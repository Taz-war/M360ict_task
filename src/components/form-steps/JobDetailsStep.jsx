import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { departments, jobTypes, getManagersByDepartment, weekendRestrictedDepartments } from "@/data/mockData";

export function JobDetailsStep({ form }) {
  const [availableManagers, setAvailableManagers] = useState([]);
  const department = form.watch("department");
  const jobType = form.watch("jobType");
  const startDate = form.watch("startDate");

  useEffect(() => {
    if (department) {
      const managers = getManagersByDepartment(department);
      setAvailableManagers(managers);

      const currentManager = form.getValues("manager");
      const isValidManager = managers.some((manager) => manager.id === currentManager);

      if (!isValidManager && currentManager) {
        form.setValue("manager", "");
        form.clearErrors("manager");
      }
    } else {
      setAvailableManagers([]);
      form.setValue("manager", "");
    }
  }, [department, form]);

  useEffect(() => {
    if (jobType) {
      form.clearErrors("salaryExpectation");
      const currentSalary = form.getValues("salaryExpectation");
      if (currentSalary) {
        setTimeout(() => form.trigger("salaryExpectation"), 100);
      }
    }
  }, [jobType, form]);

  const getSalaryLabel = () => {
    const labels = {
      "Full-time": "Annual Salary ($30,000 - $200,000)",
      Contract: "Hourly Rate ($50 - $150)",
      "Part-time": "Annual Salary ($15,000 - $80,000)",
    };
    return labels[jobType] || "Salary Expectation";
  };

  const getSalaryPlaceholder = () => {
    const placeholders = {
      "Full-time": "e.g., 75000",
      Contract: "e.g., 85",
      "Part-time": "e.g., 45000",
    };
    return placeholders[jobType] || "Enter amount";
  };

  const isWeekend = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6;
  };

  const showWeekendWarning = department && weekendRestrictedDepartments.includes(department) && isWeekend(startDate);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="positionTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position Title * (min 3 characters)</FormLabel>
            <FormControl>
              <Input placeholder="Enter position title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Date * (not in past, max 90 days future)</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            {showWeekendWarning && (
              <div className="text-sm text-red-600 mt-1">
                ⚠️ HR and Finance departments cannot start on weekends (Friday/Saturday)
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="jobType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Type *</FormLabel>
            <FormControl>
              <div className="flex flex-col space-y-2">
                {jobTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={type.toLowerCase().replace("-", "")}
                      name="jobType"
                      value={type}
                      checked={field.value === type}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <Label htmlFor={type.toLowerCase().replace("-", "")}>{type}</Label>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="salaryExpectation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{getSalaryLabel()} *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder={getSalaryPlaceholder()}
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value);

                  setTimeout(() => {
                    form.trigger("salaryExpectation");
                  }, 300);
                }}
                onBlur={() => {
                  form.trigger("salaryExpectation");
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="manager"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manager * (filtered by department)</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                form.trigger("manager");
              }}
              value={field.value}
              disabled={!department || availableManagers.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !department
                        ? "Select department first"
                        : availableManagers.length === 0
                        ? "No managers available"
                        : "Select manager"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
