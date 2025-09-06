import { useState, useCallback } from "react";
import { stepSchemas } from "@/lib/form-schema";

export const useFormValidation = (form) => {
  const [stepValidationStatus, setStepValidationStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const validateStep = useCallback(
    async (stepNumber) => {
      const stepSchema = stepSchemas[stepNumber];
      if (!stepSchema) return true;

      try {
        const currentData = form.getValues();
        await stepSchema.parseAsync(currentData);

        // Optimistic update - immediately update validation status
        setStepValidationStatus((prev) => ({
          ...prev,
          [stepNumber]: true,
        }));

        return true;
      } catch (error) {
        // Trigger validation for current step fields
        const stepFields = Object.keys(stepSchemas[stepNumber].shape);
        stepFields.forEach((field) => {
          form.trigger(field);
        });

        // Update validation status
        setStepValidationStatus((prev) => ({
          ...prev,
          [stepNumber]: false,
        }));

        return false;
      }
    },
    [form]
  );

  const validateAllSteps = useCallback(async () => {
    const results = await Promise.all([
      validateStep(1),
      validateStep(2),
      validateStep(3),
      validateStep(4),
      validateStep(5),
    ]);

    return results.every(Boolean);
  }, [validateStep]);

  return {
    stepValidationStatus,
    validateStep,
    validateAllSteps,
    setStepValidationStatus,
  };
};
