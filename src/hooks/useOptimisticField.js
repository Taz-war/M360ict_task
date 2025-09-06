import { useState, useCallback, useEffect } from "react";

export const useOptimisticField = (form, fieldName, options = {}) => {
  const { validateOnChange = true, debounceMs = 300, onValidationSuccess, onValidationError, transform } = options;

  const [fieldState, setFieldState] = useState({
    isValidating: false,
    hasBeenTouched: false,
    optimisticValue: null,
    validationError: null,
  });

  const currentValue = form.watch(fieldName);
  const displayValue = fieldState.optimisticValue !== null ? fieldState.optimisticValue : currentValue;

  const updateField = useCallback(
    async (newValue, options = {}) => {
      const { skipValidation = false, immediate = false, revertOnError = true } = options;

      // Transform value if transformer provided
      const transformedValue = transform ? transform(newValue) : newValue;

      // Optimistically update the display
      setFieldState((prev) => ({
        ...prev,
        optimisticValue: transformedValue,
        hasBeenTouched: true,
        isValidating: !skipValidation && validateOnChange,
      }));

      try {
        // Update form value
        form.setValue(fieldName, transformedValue, {
          shouldValidate: validateOnChange && !skipValidation,
          shouldDirty: true,
          shouldTouch: true,
        });

        // Perform validation if required
        if (validateOnChange && !skipValidation) {
          const isValid = await form.trigger(fieldName);

          setFieldState((prev) => ({
            ...prev,
            isValidating: false,
            validationError: isValid ? null : form.formState.errors[fieldName]?.message || "Invalid value",
          }));

          if (isValid && onValidationSuccess) {
            onValidationSuccess(transformedValue);
          } else if (!isValid && onValidationError) {
            onValidationError(form.formState.errors[fieldName]);
          }
        } else {
          setFieldState((prev) => ({
            ...prev,
            isValidating: false,
            validationError: null,
          }));
        }

        // Clear optimistic value after successful update
        setTimeout(
          () => {
            setFieldState((prev) => ({
              ...prev,
              optimisticValue: null,
            }));
          },
          immediate ? 0 : 100
        );

        return true;
      } catch (error) {
        setFieldState((prev) => ({
          ...prev,
          isValidating: false,
          validationError: error.message,
          optimisticValue: revertOnError ? null : prev.optimisticValue,
        }));

        if (onValidationError) {
          onValidationError(error);
        }

        return false;
      }
    },
    [form, fieldName, validateOnChange, transform, onValidationSuccess, onValidationError]
  );

  const clearOptimisticValue = useCallback(() => {
    setFieldState((prev) => ({
      ...prev,
      optimisticValue: null,
    }));
  }, []);

  const resetField = useCallback(() => {
    setFieldState({
      isValidating: false,
      hasBeenTouched: false,
      optimisticValue: null,
      validationError: null,
    });
    form.resetField(fieldName);
  }, [form, fieldName]);

  // Handle debounced validation
  useEffect(() => {
    if (!fieldState.hasBeenTouched || !validateOnChange) return;

    const timeoutId = setTimeout(async () => {
      if (fieldState.optimisticValue === null) {
        const isValid = await form.trigger(fieldName);
        setFieldState((prev) => ({
          ...prev,
          validationError: isValid ? null : form.formState.errors[fieldName]?.message || "Invalid value",
        }));
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [
    currentValue,
    fieldState.hasBeenTouched,
    fieldState.optimisticValue,
    validateOnChange,
    debounceMs,
    form,
    fieldName,
  ]);

  return {
    value: displayValue,
    updateField,
    clearOptimisticValue,
    resetField,
    isValidating: fieldState.isValidating,
    hasBeenTouched: fieldState.hasBeenTouched,
    validationError: fieldState.validationError,
    hasOptimisticValue: fieldState.optimisticValue !== null,
  };
};
