import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

export function EmergencyContactStep({ form }) {
  const [showGuardianFields, setShowGuardianFields] = useState(false);
  const dateOfBirth = form.watch("dateOfBirth");

  useEffect(() => {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        actualAge = age - 1;
      }

      setShowGuardianFields(actualAge < 21);
    }
  }, [dateOfBirth]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="emergencyContactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter emergency contact name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="emergencyRelationship"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relationship *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="emergencyPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number * (same format as personal phone)</FormLabel>
            <FormControl>
              <Input placeholder="01537454231 or +8801537454231" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showGuardianFields && (
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">Guardian Contact Required (Age under 21)</h3>

          <FormField
            control={form.control}
            name="guardianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter guardian name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guardianPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="01537454231 or +8801537454231" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
