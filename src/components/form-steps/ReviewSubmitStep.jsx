import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Mock managers data (same as in JobDetailsStep)
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

export function ReviewSubmitStep({ form }) {
  const formData = form.getValues();

  const getManagerName = (managerId) => {
    const manager = mockManagers.find((m) => m.id === managerId);
    return manager ? manager.name : managerId;
  };

  const formatSalary = () => {
    if (formData.jobType === "Full-time") {
      return `$${formData.salaryExpectation?.toLocaleString()} annually`;
    } else if (formData.jobType === "Contract") {
      return `$${formData.salaryExpectation}/hour`;
    }
    return formData.salaryExpectation;
  };

  const formatSkillsWithExperience = () => {
    if (!formData.primarySkills || formData.primarySkills.length === 0) return "None";

    return formData.primarySkills
      .map((skill) => {
        const experience = formData.skillExperience?.[skill] || 0;
        return `${skill} (${experience} years)`;
      })
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <p className="text-gray-600">Please review all information before submitting</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Full Name:</span> {formData.fullName}
            </div>
            <div>
              <span className="font-medium">Email:</span> {formData.email}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {formData.phone}
            </div>
            <div>
              <span className="font-medium">Date of Birth:</span> {formData.dateOfBirth}
            </div>
          </div>
          {formData.profilePicture && (
            <div>
              <span className="font-medium">Profile Picture:</span> {formData.profilePicture.name}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Department:</span> {formData.department}
            </div>
            <div>
              <span className="font-medium">Position Title:</span> {formData.positionTitle}
            </div>
            <div>
              <span className="font-medium">Start Date:</span> {formData.startDate}
            </div>
            <div>
              <span className="font-medium">Job Type:</span> {formData.jobType}
            </div>
          </div>
          <div>
            <span className="font-medium">Salary Expectation:</span> {formatSalary()}
          </div>
          <div>
            <span className="font-medium">Manager:</span> {getManagerName(formData.manager)}
          </div>
          {formData.managerApproved && (
            <div>
              <span className="font-medium">Manager Approved:</span> ✅ Yes
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Primary Skills:</span> {formatSkillsWithExperience()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Working Hours:</span> {formData.workingHoursStart} -{" "}
              {formData.workingHoursEnd}
            </div>
            <div>
              <span className="font-medium">Remote Work:</span> {formData.remoteWorkPreference}%
            </div>
          </div>
          {formData.extraNotes && (
            <div>
              <span className="font-medium">Extra Notes:</span> {formData.extraNotes}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Name:</span> {formData.emergencyContactName}
            </div>
            <div>
              <span className="font-medium">Relationship:</span> {formData.emergencyRelationship}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {formData.emergencyPhone}
            </div>
          </div>

          {formData.guardianName && (
            <div className="border-t pt-2 mt-2">
              <div className="text-sm font-medium text-orange-600 mb-2">Guardian Contact:</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Guardian Name:</span> {formData.guardianName}
                </div>
                <div>
                  <span className="font-medium">Guardian Phone:</span> {formData.guardianPhone}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="confirmInformation"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium cursor-pointer">
                    I confirm all information is correct *
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-xs text-gray-600 mt-2">You must check this box to submit the form</p>
        </CardContent>
      </Card>
    </div>
  );
}
