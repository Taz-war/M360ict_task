import { useState, useEffect, useRef } from "react";

export const useAutoSave = (form) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saving', 'saved', 'error'
  const initialFormData = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!initialFormData.current) {
      initialFormData.current = form.getValues();
      setLastSaved(new Date());
    }

    const subscription = form.watch((data) => {
      const hasChanges = JSON.stringify(data) !== JSON.stringify(initialFormData.current);
      setHasUnsavedChanges(hasChanges);

      if (hasChanges) {
        // Optimistic UI - show saving status immediately
        setSaveStatus("saving");

        // Clear previous timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Simulate auto-save with debounce
        saveTimeoutRef.current = setTimeout(() => {
          try {
            // In a real app, this would be an API call
            // For now, we'll just update the saved timestamp
            setLastSaved(new Date());
            setSaveStatus("saved");

            // Update initial data to current state
            initialFormData.current = data;
            setHasUnsavedChanges(false);
          } catch (error) {
            setSaveStatus("error");
            console.error("Auto-save failed:", error);
          }
        }, 1000); // 1 second debounce
      }
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const forceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    setTimeout(() => {
      const currentData = form.getValues();
      initialFormData.current = currentData;
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveStatus("saved");
    }, 500);
  };

  return {
    hasUnsavedChanges,
    lastSaved,
    saveStatus,
    forceSave,
  };
};
