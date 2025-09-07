import { z } from "zod";
import { departments, jobTypes, relationships, weekendRestrictedDepartments } from "@/data/mockData";

const phoneRegex = /^(\+88)?0?1[3-9]\d{8}$/;

const validateAge = (dateString) => {
  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

const validateStartDate = (dateString) => {
  const startDate = new Date(dateString);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 90);

  return startDate >= today && startDate <= maxDate;
};

const validateWeekendRestriction = (dateString, department) => {
  if (!dateString || !department) return true;
  if (!weekendRestrictedDepartments.includes(department)) return true;

  const startDate = new Date(dateString);
  if (isNaN(startDate.getTime())) return true;

  const dayOfWeek = startDate.getDay();

  return dayOfWeek !== 5 && dayOfWeek !== 6;
};

export const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .refine((name) => name.trim().split(" ").length >= 2, "Full name must have at least 2 words"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Phone must be in format 01537454231 or +8801537454231"),
    dateOfBirth: z.string().min(1, "Date of birth is required").refine(validateAge, "Must be at least 18 years old"),
    profilePicture: z.any().optional(),
    department: z.enum(departments, {
      required_error: "Department is required",
    }),
    positionTitle: z.string().min(3, "Position title must be at least 3 characters"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(validateStartDate, "Start date cannot be in the past and must be within 90 days"),
    jobType: z.enum(jobTypes, {
      required_error: "Job type is required",
    }),
    salaryExpectation: z.union([
      z.number().min(1, "Salary expectation is required"),
      z
        .string()
        .min(1, "Salary expectation is required")
        .transform((val) => {
          const num = parseFloat(val);
          if (isNaN(num)) throw new Error("Invalid number");
          return num;
        }),
    ]),
    manager: z.string().min(1, "Manager selection is required"),
    managerApproved: z.boolean().optional(),
    primarySkills: z.array(z.string()).min(3, "Please select at least 3 primary skills"),
    skillExperience: z.record(z.string(), z.number().min(0).max(20)),
    workingHoursStart: z.string().min(1, "Start time is required"),
    workingHoursEnd: z.string().min(1, "End time is required"),
    remoteWorkPreference: z.number().min(0).max(100),
    extraNotes: z.string().max(500, "Extra notes cannot exceed 500 characters").optional(),
    emergencyContactName: z.string().min(1, "Emergency contact name is required"),
    emergencyRelationship: z.enum(relationships, {
      required_error: "Relationship is required",
    }),
    emergencyPhone: z.string().regex(phoneRegex, "Phone must be in format 01537454231 or +8801537454231"),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    confirmInformation: z.boolean().refine((val) => val === true, "You must confirm the information is correct"),
  })
  .refine(
    (data) => {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        actualAge = age - 1;
      }

      if (actualAge < 21) {
        return data.guardianName && data.guardianPhone;
      }
      return true;
    },
    {
      message: "Guardian contact is required for applicants under 21",
      path: ["guardianName"],
    }
  )
  .refine(
    (data) => {
      if (data.jobType === "Full-time") {
        return data.salaryExpectation >= 30000 && data.salaryExpectation <= 200000;
      } else if (data.jobType === "Contract") {
        return data.salaryExpectation >= 50 && data.salaryExpectation <= 150;
      } else if (data.jobType === "Part-time") {
        return data.salaryExpectation >= 15000 && data.salaryExpectation <= 80000;
      }
      return true;
    },
    {
      message: "Salary expectation is outside the valid range for the selected job type",
      path: ["salaryExpectation"],
    }
  )
  .refine(
    (data) => {
      return validateWeekendRestriction(data.startDate, data.department);
    },
    {
      message: "HR and Finance departments cannot start on weekends (Friday/Saturday)",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      if (data.remoteWorkPreference > 50) {
        return data.managerApproved === true;
      }
      return true;
    },
    {
      message: "Manager approval is required for remote work preference above 50%",
      path: ["managerApproved"],
    }
  );

export const stepSchemas = {
  1: z.object({
    fullName: formSchema.shape.fullName,
    email: formSchema.shape.email,
    phone: formSchema.shape.phone,
    dateOfBirth: formSchema.shape.dateOfBirth,
    profilePicture: formSchema.shape.profilePicture,
  }),
  2: z
    .object({
      department: formSchema.shape.department,
      positionTitle: formSchema.shape.positionTitle,
      startDate: formSchema.shape.startDate,
      jobType: formSchema.shape.jobType,
      salaryExpectation: formSchema.shape.salaryExpectation,
      manager: formSchema.shape.manager,
    })
    .refine(
      (data) => {
        if (!data.salaryExpectation || !data.jobType) return true;

        const salary =
          typeof data.salaryExpectation === "string" ? parseFloat(data.salaryExpectation) : data.salaryExpectation;

        if (isNaN(salary)) return false;

        if (data.jobType === "Full-time") {
          return salary >= 30000 && salary <= 200000;
        } else if (data.jobType === "Contract") {
          return salary >= 50 && salary <= 150;
        } else if (data.jobType === "Part-time") {
          return salary >= 15000 && salary <= 80000;
        }
        return true;
      },
      {
        message: "Salary expectation is outside the valid range for the selected job type",
        path: ["salaryExpectation"],
      }
    )
    .refine(
      (data) => {
        return validateWeekendRestriction(data.startDate, data.department);
      },
      {
        message: "HR and Finance departments cannot start on weekends (Friday/Saturday)",
        path: ["startDate"],
      }
    ),
  3: z
    .object({
      primarySkills: formSchema.shape.primarySkills,
      skillExperience: formSchema.shape.skillExperience,
      workingHoursStart: formSchema.shape.workingHoursStart,
      workingHoursEnd: formSchema.shape.workingHoursEnd,
      remoteWorkPreference: formSchema.shape.remoteWorkPreference,
      extraNotes: formSchema.shape.extraNotes,
      managerApproved: formSchema.shape.managerApproved,
    })
    .refine(
      (data) => {
        if (data.remoteWorkPreference > 50) {
          return data.managerApproved === true;
        }
        return true;
      },
      {
        message: "Manager approval is required for remote work preference above 50%",
        path: ["managerApproved"],
      }
    ),
  4: z.object({
    emergencyContactName: formSchema.shape.emergencyContactName,
    emergencyRelationship: formSchema.shape.emergencyRelationship,
    emergencyPhone: formSchema.shape.emergencyPhone,
    guardianName: formSchema.shape.guardianName,
    guardianPhone: formSchema.shape.guardianPhone,
  }),
  5: formSchema,
};
