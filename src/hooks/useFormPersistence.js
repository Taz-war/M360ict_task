import { useState, useEffect, useCallback, useRef } from "react";

export const useFormPersistence = (form, options = {}) => {
  const { storageKey = "form-data", debounceMs = 1000, enableAutoSave = true, onSave, onLoad, onError } = options;

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

          form.reset(mergedData);
          initialDataRef.current = mergedData;

          if (onLoad) {
            onLoad(parsedData);
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

        if (onError) {
          onError(error);
        }
      }
    };

    loadSavedData();
  }, [form, storageKey, onLoad, onError]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave) return;

    const subscription = form.watch((data) => {
      const hasChanges = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);

      setPersistenceState((prev) => ({
        ...prev,
        hasUnsavedChanges: hasChanges,
      }));

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

            if (onSave) {
              onSave(data);
            }
          } catch (error) {
            setPersistenceState((prev) => ({
              ...prev,
              status: "error",
              error: error.message,
            }));

            if (onError) {
              onError(error);
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
  }, [form, enableAutoSave, debounceMs, storageKey, onSave, onError]);

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

      if (onSave) {
        onSave(currentData);
      }

      return currentData;
    } catch (error) {
      setPersistenceState((prev) => ({
        ...prev,
        status: "error",
        error: error.message,
      }));

      if (onError) {
        onError(error);
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
      if (onError) {
        onError(error);
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
