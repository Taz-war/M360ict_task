"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { formSchema, stepSchemas } from "@/lib/form-schema";
import { PersonalInfoStep } from "./form-steps/PersonalInfoStep";
import { JobDetailsStep } from "./form-steps/JobDetailsStep";
import { SkillsPreferencesStep } from "./form-steps/SkillsPreferencesStep";
import { EmergencyContactStep } from "./form-steps/EmergencyContactStep";
import { ReviewSubmitStep } from "./form-steps/ReviewSubmitStep";
import { FormErrorBoundary } from "./FormErrorBoundary";
import { SaveIndicator } from "./ui/SaveIndicator";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { useOptimisticUpdates } from "@/hooks/useOptimisticUpdates";

const steps = [
  { title: "Personal Information", component: PersonalInfoStep },
  { title: "Job Details", component: JobDetailsStep },
  { title: "Skills & Preferences", component: SkillsPreferencesStep },
  { title: "Emergency Contact", component: EmergencyContactStep },
  { title: "Review & Submit", component: ReviewSubmitStep },
];

export function MultiStepForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Personal Info
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      profilePicture: null,

      // Job Details
      department: "",
      positionTitle: "",
      startDate: "",
      jobType: "",
      salaryExpectation: "",
      manager: "",
      managerApproved: false,

      // Skills & Preferences
      primarySkills: [],
      skillExperience: {},
      workingHoursStart: "",
      workingHoursEnd: "",
      remoteWorkPreference: 50,
      extraNotes: "",

      // Emergency Contact
      emergencyContactName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      guardianName: "",
      guardianPhone: "",

      // Review & Submit
      confirmInformation: false,
    },
    mode: "onChange",
  });

  // Custom hooks for enhanced functionality
  const { stepValidationStatus, validateStep, validateAllSteps } = useFormValidation(form);

  const persistence = useFormPersistence(form, {
    storageKey: "employee-registration-form",
    debounceMs: 1000,
    onSave: (data) => console.log("Form auto-saved:", Object.keys(data)),
    onError: (error) => console.error("Auto-save failed:", error),
  });

  const { optimisticState, performOptimisticUpdate } = useOptimisticUpdates();

  const stepValidation = useCallback(
    async (currentStepNum, targetStep) => {
      if (targetStep <= currentStepNum) return true; // Allow backward navigation
      return await validateStep(currentStepNum);
    },
    [validateStep]
  );

  const navigation = useStepNavigation(steps.length, {
    onStepValidation: stepValidation,
    enableOptimisticNavigation: true,
  });

  // Enhanced form submission with optimistic updates
  const handleFormSubmit = useCallback(
    async (data) => {
      return performOptimisticUpdate(
        "formSubmission",
        { status: "submitting", data },
        async () => {
          // Simulate API call with realistic delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Simulate potential failure (5% chance)
          if (Math.random() < 0.05) {
            throw new Error("Network error occurred. Please try again.");
          }

          return { status: "success", submittedAt: new Date() };
        },
        {
          onSuccess: (result) => {
            console.log("Form submitted successfully:", result);
            // Clear saved form data after successful submission
            persistence.clearSavedData();
          },
          onError: (error) => {
            console.error("Form submission failed:", error);
          },
        }
      );
    },
    [performOptimisticUpdate, persistence]
  );

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await handleFormSubmit(data);
      alert("Form submitted successfully!");
    } catch (error) {
      alert(`Error submitting form: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[navigation.currentStep - 1].component;
  const submissionState = optimisticState.formSubmission;

  return (
    <FormErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Form error:", error, errorInfo);
      }}
      onRetry={() => {
        navigation.clearValidationCache();
      }}
      onReset={() => {
        form.reset();
        navigation.resetNavigation();
        persistence.clearSavedData();
      }}
      onForceSave={(data) => {
        persistence.forceSave();
      }}
    >
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <CardTitle className="text-2xl">Employee Registration Form</CardTitle>
              <SaveIndicator status={persistence.status} lastSaved={persistence.lastSaved} size="sm" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Step {navigation.currentStep} of {steps.length}
                </span>
                <span>{Math.round(navigation.progress)}% Complete</span>
              </div>
              <Progress value={navigation.progress} className="w-full" />
              <p className="text-center font-medium">{steps[navigation.currentStep - 1].title}</p>

              {/* Enhanced step validation indicators */}
              <div className="flex justify-center space-x-2 mt-2">
                {steps.map((_, index) => {
                  const stepNum = index + 1;
                  const isCompleted = stepValidationStatus[stepNum];
                  const isCurrent = stepNum === navigation.currentStep;
                  const isNavigating =
                    navigation.navigationState.isNavigating &&
                    navigation.navigationState.direction === "forward" &&
                    stepNum === navigation.currentStep;

                  return (
                    <div
                      key={stepNum}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        isNavigating
                          ? "bg-blue-400 animate-pulse"
                          : isCompleted
                          ? "bg-green-500"
                          : isCurrent
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                      title={`Step ${stepNum}: ${isCompleted ? "Valid" : "Incomplete"}`}
                    />
                  );
                })}
              </div>

              {/* Navigation error display */}
              {navigation.navigationState.error && (
                <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
                  {navigation.navigationState.error}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CurrentStepComponent form={form} />

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={navigation.prevStep}
                    disabled={!navigation.canNavigateBackward || navigation.navigationState.isNavigating}
                  >
                    Previous
                  </Button>

                  {navigation.currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={navigation.nextStep}
                      disabled={navigation.navigationState.isNavigating}
                    >
                      {navigation.navigationState.isNavigating ? "Validating..." : "Next"}
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting || submissionState?.status === "submitting"}>
                      {submissionState?.status === "submitting"
                        ? "Submitting..."
                        : isSubmitting
                        ? "Submitting..."
                        : "Submit"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </FormErrorBoundary>
  );
}
