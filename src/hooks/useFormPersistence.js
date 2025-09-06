import { useState, useEffect, useCallback, useRef } from "react";

export const useFormPersistence = (form, options = {}) => {
  const { storageKey = "form-data", debounceMs = 1000, enableAutoSave = true, onSave, onLoad, onError } = options;

  // Use refs for callbacks to prevent dependency issues
  const onSaveRef = useRef(onSave);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  onSaveRef.current = onSave;
  onLoadRef.current = onLoad;
  onErrorRef.current = onError;

  const [persistenceState, setPersistenceState] = useState({
    status: "idle", // 'idle', 'saving', 'saved', 'error', 'loading'
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const saveTimeoutRef = useRef(null);
  const initialDataRef = useRef(null);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setPersistenceState((prev) => ({ ...prev, status: "loading" }));

        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);

          // Merge with current form values (in case of default values)
          const currentValues = form.getValues();
          const mergedData = { ...currentValues, ...parsedData };

          // Set initial data first to prevent triggering the watcher
          initialDataRef.current = mergedData;

          // Reset form without triggering validation
          form.reset(mergedData, { keepDefaultValues: true });

          if (onLoadRef.current) {
            onLoadRef.current(parsedData);
          }
        } else {
          initialDataRef.current = form.getValues();
        }

        setPersistenceState((prev) => ({
          ...prev,
          status: "idle",
          lastSaved: savedData ? new Date() : null,
        }));
      } catch (error) {
        setPersistenceState((prev) => ({
          ...prev,
          status: "error",
          error: error.message,
        }));

        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      }
    };

    loadSavedData();
  }, [storageKey]); // Remove form, onLoad, onError from dependencies to prevent re-runs

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave || !initialDataRef.current) return;

    const subscription = form.watch((data) => {
      // Skip if data is null/undefined or if we're still loading
      if (!data || persistenceState.status === "loading") return;

      const hasChanges = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);

      // Only update state if hasUnsavedChanges actually changed
      setPersistenceState((prev) => {
        if (prev.hasUnsavedChanges !== hasChanges) {
          return { ...prev, hasUnsavedChanges: hasChanges };
        }
        return prev;
      });

      if (hasChanges) {
        // Clear previous timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Show saving status immediately for better UX
        setPersistenceState((prev) => ({ ...prev, status: "saving" }));

        // Debounced save
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));

            setPersistenceState((prev) => ({
              ...prev,
              status: "saved",
              lastSaved: new Date(),
              hasUnsavedChanges: false,
              error: null,
            }));

            initialDataRef.current = data;

            if (onSaveRef.current) {
              onSaveRef.current(data);
            }
          } catch (error) {
            setPersistenceState((prev) => ({
              ...prev,
              status: "error",
              error: error.message,
            }));

            if (onErrorRef.current) {
              onErrorRef.current(error);
            }
          }
        }, debounceMs);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [enableAutoSave, debounceMs, storageKey, persistenceState.status]); // Removed form, onSave, onError from dependencies

  // Manual save function
  const forceSave = useCallback(async () => {
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setPersistenceState((prev) => ({ ...prev, status: "saving" }));

      const currentData = form.getValues();
      localStorage.setItem(storageKey, JSON.stringify(currentData));

      setPersistenceState((prev) => ({
        ...prev,
        status: "saved",
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
      }));

      initialDataRef.current = currentData;

      if (onSaveRef.current) {
        onSaveRef.current(currentData);
      }

      return currentData;
    } catch (error) {
      setPersistenceState((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
      }));

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }

      throw error;
    }
  }, [form, storageKey, onSave, onError]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      initialDataRef.current = form.getValues();

      setPersistenceState((prev) => ({
        ...prev,
        lastSaved: null,
        hasUnsavedChanges: false,
        error: null,
      }));
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    }
  }, [storageKey, form, onError]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (persistenceState.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [persistenceState.hasUnsavedChanges]);

  return {
    ...persistenceState,
    forceSave,
    clearSavedData,
  };
};
