import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSkillsByDepartment } from "@/data/mockData";

export function SkillsPreferencesStep({ form }) {
  const primarySkills = form.watch("primarySkills") || [];
  const skillExperience = form.watch("skillExperience") || {};
  const remoteWorkPreference = form.watch("remoteWorkPreference") || 50;
  const department = form.watch("department");

  const availableSkills = getSkillsByDepartment(department);

  const handleSkillToggle = (skill) => {
    const currentSkills = [...primarySkills];
    const skillIndex = currentSkills.indexOf(skill);

    if (skillIndex > -1) {
      currentSkills.splice(skillIndex, 1);
      const newExperience = { ...skillExperience };
      delete newExperience[skill];
      form.setValue("skillExperience", newExperience);
    } else {
      currentSkills.push(skill);
      form.setValue("skillExperience", { ...skillExperience, [skill]: 1 });
    }

    form.setValue("primarySkills", currentSkills);
  };

  const handleExperienceChange = (skill, years) => {
    form.setValue("skillExperience", {
      ...skillExperience,
      [skill]: parseInt(years) || 0,
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="primarySkills"
        render={() => (
          <FormItem>
            <FormLabel>Primary Skills * (choose at least 3 using checkboxes)</FormLabel>
            {!department ? (
              <div className="text-sm text-gray-500 p-3 border rounded-md">
                Please select a department in Step 2 to see available skills
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {availableSkills.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={primarySkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {primarySkills.length > 0 && (
        <FormField
          control={form.control}
          name="skillExperience"
          render={() => (
            <FormItem>
              <FormLabel>Experience for Each Skill (years)</FormLabel>
              <div className="space-y-3">
                {primarySkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill}</span>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      placeholder="Years"
                      value={skillExperience[skill] || ""}
                      onChange={(e) => handleExperienceChange(skill, e.target.value)}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="workingHoursStart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Working Hours - Start *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="workingHoursEnd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Working Hours - End *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="remoteWorkPreference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Remote Work Preference: {remoteWorkPreference}%</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={remoteWorkPreference}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0% (Office only)</span>
                  <span>50% (Hybrid)</span>
                  <span>100% (Fully remote)</span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {remoteWorkPreference > 50 && (
        <FormField
          control={form.control}
          name="managerApproved"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center space-x-2 p-3 border border-orange-200 bg-orange-50 rounded-md">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium cursor-pointer">
                  Manager Approved * (Required for remote work preference above 50%)
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="extraNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Extra Notes (optional, max 500 characters)</FormLabel>
            <FormControl>
              <Textarea placeholder="Any additional information you'd like to share..." maxLength={500} {...field} />
            </FormControl>
            <div className="text-xs text-gray-500 text-right">{(field.value || "").length}/500 characters</div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
