import { useState, useCallback, useRef } from "react";

export const useOptimisticUpdates = () => {
  const [optimisticState, setOptimisticState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingUpdates = useRef(new Map());

  const performOptimisticUpdate = useCallback(
    async (key, optimisticValue, asyncOperation, options = {}) => {
      const { onSuccess, onError, revertOnError = true, loadingDelay = 0 } = options;

      // Store the current value for potential rollback
      const previousValue = optimisticState[key];

      // Immediately update the UI with optimistic value
      setOptimisticState((prev) => ({
        ...prev,
        [key]: optimisticValue,
      }));

      // Clear any previous error
      setError(null);

      // Set loading state after delay (prevents flash for fast operations)
      const loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, loadingDelay);

      try {
        // Store the pending operation
        const operationId = Date.now();
        pendingUpdates.current.set(operationId, { key, previousValue });

        // Perform the actual async operation
        const result = await asyncOperation();

        // Clear the pending operation
        pendingUpdates.current.delete(operationId);

        // Update with the actual result
        setOptimisticState((prev) => ({
          ...prev,
          [key]: result,
        }));

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        // Handle error
        setError(err);

        if (revertOnError) {
          // Revert to previous value
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
