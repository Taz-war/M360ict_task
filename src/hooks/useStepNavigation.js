import { useState, useCallback, useRef } from "react";

export const useStepNavigation = (totalSteps, options = {}) => {
  const { initialStep = 1, onStepChange, onStepValidation, enableOptimisticNavigation = true } = options;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [navigationState, setNavigationState] = useState({
    isNavigating: false,
    direction: null, // 'forward' | 'backward'
    error: null,
  });

  const [stepHistory, setStepHistory] = useState([initialStep]);
  const validationCache = useRef(new Map());

  const updateStep = useCallback(
    (newStep, direction = null) => {
      if (newStep < 1 || newStep > totalSteps) return false;

      setCurrentStep((prevStep) => {
        setStepHistory((prev) => [...prev, newStep]);

        if (onStepChange) {
          onStepChange(newStep, prevStep);
        }

        return newStep;
      });

      return true;
    },
    [totalSteps, onStepChange]
  );

  const navigateToStep = useCallback(
    async (targetStep, options = {}) => {
      const { skipValidation = false, force = false, optimistic = enableOptimisticNavigation } = options;

      if (targetStep === currentStep) return true;
      if (targetStep < 1 || targetStep > totalSteps) return false;

      const direction = targetStep > currentStep ? "forward" : "backward";

      setNavigationState({
        isNavigating: true,
        direction,
        error: null,
      });

      try {
        // For backward navigation, usually no validation needed
        if (direction === "backward" && !force) {
          updateStep(targetStep, direction);
          setNavigationState({ isNavigating: false, direction: null, error: null });
          return true;
        }

        // For forward navigation, validate if required
        if (!skipValidation && onStepValidation) {
          // Check cache first for performance
          const cacheKey = `${currentStep}-${targetStep}`;
          let isValid = validationCache.current.get(cacheKey);

          if (isValid === undefined) {
            // Optimistic navigation - update UI immediately if enabled
            if (optimistic) {
              updateStep(targetStep, direction);
            }

            // Perform validation
            isValid = await onStepValidation(currentStep, targetStep);

            // Cache the result
            validationCache.current.set(cacheKey, isValid);
          }

          if (!isValid) {
            // Revert optimistic update if validation failed
            if (optimistic && targetStep !== currentStep) {
              setCurrentStep(currentStep);
            }

            setNavigationState({
              isNavigating: false,
              direction: null,
              error: "Please complete all required fields before proceeding",
            });
            return false;
          }
        }

        // If we haven't updated optimistically, update now
        if (!optimistic || skipValidation) {
          updateStep(targetStep, direction);
        }

        setNavigationState({ isNavigating: false, direction: null, error: null });
        return true;
      } catch (error) {
        // Revert optimistic update on error
        if (optimistic && targetStep !== currentStep) {
          setCurrentStep(currentStep);
        }

        setNavigationState({
          isNavigating: false,
          direction: null,
          error: error.message || "Navigation failed",
        });
        return false;
      }
    },
    [currentStep, totalSteps, onStepValidation, enableOptimisticNavigation, updateStep]
  );

  const nextStep = useCallback(
    (options = {}) => {
      return navigateToStep(currentStep + 1, options);
    },
    [currentStep, navigateToStep]
  );

  const prevStep = useCallback(
    (options = {}) => {
      return navigateToStep(currentStep - 1, { ...options, skipValidation: true });
    },
    [currentStep, navigateToStep]
  );

  const goToStep = useCallback(
    (step, options = {}) => {
      return navigateToStep(step, options);
    },
    [navigateToStep]
  );

  const resetNavigation = useCallback(() => {
    setCurrentStep(initialStep);
    setStepHistory([initialStep]);
    setNavigationState({ isNavigating: false, direction: null, error: null });
    validationCache.current.clear();
  }, [initialStep]);

  const clearValidationCache = useCallback((stepKey = null) => {
    if (stepKey) {
      // Clear specific step validations
      for (const key of validationCache.current.keys()) {
        if (key.includes(stepKey.toString())) {
          validationCache.current.delete(key);
        }
      }
    } else {
      validationCache.current.clear();
    }
  }, []);

  const canNavigateForward = currentStep < totalSteps;
  const canNavigateBackward = currentStep > 1;
  const progress = (currentStep / totalSteps) * 100;

  return {
    currentStep,
    navigationState,
    stepHistory,
    canNavigateForward,
    canNavigateBackward,
    progress,
    nextStep,
    prevStep,
    goToStep,
    resetNavigation,
    clearValidationCache,
  };
};
