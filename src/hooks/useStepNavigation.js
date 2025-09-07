import { useState, useCallback, useRef } from "react";

export const useStepNavigation = (totalSteps, options = {}) => {
  const { initialStep = 1, onStepChange, onStepValidation } = options;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [navigationState, setNavigationState] = useState({
    isNavigating: false,
    direction: null, // 'forward' | 'backward'
    error: null,
  });

  const [stepHistory, setStepHistory] = useState([initialStep]);

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
      const { skipValidation = false } = options;

      if (targetStep === currentStep) return true;
      if (targetStep < 1 || targetStep > totalSteps) return false;

      const direction = targetStep > currentStep ? "forward" : "backward";

      setNavigationState({
        isNavigating: true,
        direction,
        error: null,
      });

      try {
        if (direction === "backward") {
          updateStep(targetStep, direction);
          setNavigationState({ isNavigating: false, direction: null, error: null });
          return true;
        }

        if (!skipValidation && onStepValidation) {
          const isValid = await onStepValidation(currentStep, targetStep);

          if (!isValid) {
            setNavigationState({
              isNavigating: false,
              direction: null,
              error: "Please complete all required fields before proceeding",
            });
            return false;
          }
        }

        updateStep(targetStep, direction);
        setNavigationState({ isNavigating: false, direction: null, error: null });
        return true;
      } catch (error) {
        console.error("Navigation error:", error);
        setNavigationState({
          isNavigating: false,
          direction: null,
          error: error.message || "Navigation failed",
        });
        return false;
      }
    },
    [currentStep, totalSteps, onStepValidation, updateStep]
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
  }, [initialStep]);

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
  };
};
