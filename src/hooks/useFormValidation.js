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

      const currentData = form.getValues();
      const result = await stepSchema.safeParseAsync(currentData);

      if (result.success) {
        setStepValidationStatus((prev) => ({ ...prev, [stepNumber]: true }));
        return true;
      } else {
        result.error.errors.forEach((err) => {
          if (err.path?.length > 0) {
            form.setError(err.path[0], {
              type: "validation",
              message: err.message,
            });
          }
        });

        setStepValidationStatus((prev) => ({ ...prev, [stepNumber]: false }));
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
