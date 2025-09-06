import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

// Mock managers data
const mockManagers = [
  { id: "ENG001", name: "Alice Johnson", department: "Engineering" },
  { id: "ENG002", name: "Tanvir Ahamed", department: "Engineering" },
  { id: "ENG003", name: "Lisa Wong", department: "Engineering" },
  { id: "MKT001", name: "Sarah Kim", department: "Marketing" },
  { id: "MKT002", name: "John Patel", department: "Marketing" },
  { id: "MKT003", name: "Nina Roy", department: "Marketing" },
  { id: "SAL001", name: "David Lee", department: "Sales" },
  { id: "SAL002", name: "Maria Gomez", department: "Sales" },
  { id: "SAL003", name: "Rahul Sinha", department: "Sales" },
  { id: "HR001", name: "Emma Brown", department: "HR" },
  { id: "HR002", name: "Hasan Chowdhury", department: "HR" },
  { id: "FIN001", name: "Olivia Green", department: "Finance" },
  { id: "FIN002", name: "Jake Turner", department: "Finance" },
  { id: "FIN003", name: "Nadia Rahman", department: "Finance" },
];

const getManagersByDepartment = (department) => {
  return mockManagers.filter((manager) => manager.department === department);
};

export function JobDetailsStep({ form }) {
  const [availableManagers, setAvailableManagers] = useState([]);
  const watchedDepartment = form.watch("department");
  const watchedJobType = form.watch("jobType");
  const watchedStartDate = form.watch("startDate");
  const remoteWorkPreference = form.watch("remoteWorkPreference") || 50;

  useEffect(() => {
    if (watchedDepartment) {
      setAvailableManagers(getManagersByDepartment(watchedDepartment));
      form.setValue("manager", ""); // Reset manager when department changes
    }
  }, [watchedDepartment, form]);

  const getSalaryLabel = () => {
    if (watchedJobType === "Full-time") {
      return "Annual Salary ($30,000 - $200,000)";
    } else if (watchedJobType === "Contract") {
      return "Hourly Rate ($50 - $150)";
    }
    return "Salary Expectation";
  };

  const getSalaryPlaceholder = () => {
    if (watchedJobType === "Full-time") {
      return "e.g., 75000";
    } else if (watchedJobType === "Contract") {
      return "e.g., 85";
    }
    return "Enter amount";
  };

  const isWeekend = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
  };

  const showWeekendWarning =
    watchedDepartment && ["HR", "Finance"].includes(watchedDepartment) && isWeekend(watchedStartDate);

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
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
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
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="full-time"
                    name="jobType"
                    value="Full-time"
                    checked={field.value === "Full-time"}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="full-time">Full-time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="part-time"
                    name="jobType"
                    value="Part-time"
                    checked={field.value === "Part-time"}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="part-time">Part-time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="contract"
                    name="jobType"
                    value="Contract"
                    checked={field.value === "Contract"}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="contract">Contract</Label>
                </div>
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
                onChange={(e) => field.onChange(e.target.value)}
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
            <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDepartment}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={watchedDepartment ? "Select manager" : "Select department first"} />
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
