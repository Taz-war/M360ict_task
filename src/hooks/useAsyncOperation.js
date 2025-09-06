import { useState, useCallback, useRef } from "react";

export const useAsyncOperation = (options = {}) => {
  const { onSuccess, onError, retryAttempts = 3, retryDelay = 1000, timeout = 30000 } = options;

  const [state, setState] = useState({
    isLoading: false,
    error: null,
    data: null,
    attempt: 0,
  });

  const abortControllerRef = useRef(null);

  const execute = useCallback(
    async (asyncFn, ...args) => {
      // Cancel any ongoing operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        attempt: prev.attempt + 1,
      }));

      const attemptOperation = async (attemptNumber = 1) => {
        try {
          // Set timeout
          const timeoutId = setTimeout(() => {
            abortControllerRef.current?.abort();
          }, timeout);

          // Execute the async function
          const result = await asyncFn(...args, { signal });

          clearTimeout(timeoutId);

          // Check if operation was aborted
          if (signal.aborted) {
            throw new Error("Operation was cancelled");
          }

          setState({
            isLoading: false,
            error: null,
            data: result,
            attempt: attemptNumber,
          });

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (error) {
          clearTimeout(timeoutId);

          // Don't retry if operation was aborted
          if (signal.aborted || error.name === "AbortError") {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: new Error("Operation was cancelled"),
            }));
            return;
          }

          // Retry logic
          if (attemptNumber < retryAttempts) {
            console.warn(`Attempt ${attemptNumber} failed, retrying in ${retryDelay}ms...`, error);

            await new Promise((resolve) => setTimeout(resolve, retryDelay * attemptNumber));

            // Check if still not aborted before retrying
            if (!signal.aborted) {
              return attemptOperation(attemptNumber + 1);
            }
          }

          // Final failure
          setState({
            isLoading: false,
            error,
            data: null,
            attempt: attemptNumber,
          });

          if (onError) {
            onError(error);
          }

          throw error;
        }
      };

      return attemptOperation();
    },
    [onSuccess, onError, retryAttempts, retryDelay, timeout]
  );

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      isLoading: false,
      error: null,
      data: null,
      attempt: 0,
    });
  }, [cancel]);

  return {
    ...state,
    execute,
    cancel,
    reset,
  };
};
