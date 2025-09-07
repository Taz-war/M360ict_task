"use client";

import { useState } from "react";
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

const steps = [
  { title: "Personal Information", component: PersonalInfoStep },
  { title: "Job Details", component: JobDetailsStep },
  { title: "Skills & Preferences", component: SkillsPreferencesStep },
  { title: "Emergency Contact", component: EmergencyContactStep },
  { title: "Review & Submit", component: ReviewSubmitStep },
];

export function SimpleMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepValidationStatus, setStepValidationStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      profilePicture: null,
      department: "",
      positionTitle: "",
      startDate: "",
      jobType: "",
      salaryExpectation: "",
      manager: "",
      managerApproved: false,
      primarySkills: [],
      skillExperience: {},
      workingHoursStart: "",
      workingHoursEnd: "",
      remoteWorkPreference: 50,
      extraNotes: "",
      emergencyContactName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      guardianName: "",
      guardianPhone: "",
      confirmInformation: false,
    },
    mode: "onChange",
  });

  const validateCurrentStep = async () => {
    const stepSchema = stepSchemas[currentStep];
    if (!stepSchema) return true;

    try {
      const currentData = form.getValues();
      console.log(`Validating step ${currentStep} with data:`, currentData);

      await stepSchema.parseAsync(currentData);

      setStepValidationStatus((prev) => ({
        ...prev,
        [currentStep]: true,
      }));

      console.log(`Step ${currentStep} validation passed`);
      return true;
    } catch (error) {
      console.error(`Step ${currentStep} validation failed:`, error);

      // Show specific validation errors
      if (error.errors) {
        error.errors.forEach((err) => {
          console.error(`Validation error on ${err.path?.join(".")}: ${err.message}`);
        });
      }

      // Trigger validation for all fields in the current step
      const stepFields = Object.keys(stepSchemas[currentStep].shape);
      stepFields.forEach((field) => {
        form.trigger(field);
      });

      setStepValidationStatus((prev) => ({
        ...prev,
        [currentStep]: false,
      }));

      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form submitted:", data);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Employee Registration Form</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center font-medium">{steps[currentStep - 1].title}</p>

            {/* Step validation indicators */}
            <div className="flex justify-center space-x-2 mt-2">
              {steps.map((_, index) => {
                const stepNum = index + 1;
                const isCompleted = stepValidationStatus[stepNum];
                const isCurrent = stepNum === currentStep;

                return (
                  <div
                    key={stepNum}
                    className={`w-3 h-3 rounded-full ${
                      isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-gray-300"
                    }`}
                    title={`Step ${stepNum}: ${isCompleted ? "Valid" : "Incomplete"}`}
                  />
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CurrentStepComponent form={form} />

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
