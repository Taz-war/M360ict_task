import { useState, useCallback, useRef } from "react";

export const useOptimisticUpdates = () => {
  const [optimisticState, setOptimisticState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingUpdates = useRef(new Map());

  const performOptimisticUpdate = useCallback(
    async (key, optimisticValue, asyncOperation, options = {}) => {
      const { onSuccess, onError, revertOnError = true, loadingDelay = 0 } = options;

      const previousValue = optimisticState[key];

      setOptimisticState((prev) => ({
        ...prev,
        [key]: optimisticValue,
      }));

      setError(null);
      const loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, loadingDelay);

      try {
        const operationId = Date.now();
        pendingUpdates.current.set(operationId, { key, previousValue });

        const result = await asyncOperation();

        pendingUpdates.current.delete(operationId);
        setOptimisticState((prev) => ({
          ...prev,
          [key]: result,
        }));

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        if (revertOnError) {
          setOptimisticState((prev) => ({
            ...prev,
            [key]: previousValue,
          }));
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    },
    [optimisticState]
  );

  const clearOptimisticState = useCallback((key) => {
    if (key) {
      setOptimisticState((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } else {
      setOptimisticState({});
    }
  }, []);

  const revertPendingUpdates = useCallback(() => {
    pendingUpdates.current.forEach(({ key, previousValue }) => {
      setOptimisticState((prev) => ({
        ...prev,
        [key]: previousValue,
      }));
    });
    pendingUpdates.current.clear();
  }, []);

  return {
    optimisticState,
    isLoading,
    error,
    performOptimisticUpdate,
    clearOptimisticState,
    revertPendingUpdates,
    hasPendingUpdates: pendingUpdates.current.size > 0,
  };
};
