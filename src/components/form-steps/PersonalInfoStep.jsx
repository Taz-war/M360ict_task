import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { allowedImageTypes } from "@/data/mockData";

export function PersonalInfoStep({ form }) {
  const [profilePreview, setProfilePreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!allowedImageTypes.includes(file.type)) {
        form.setError("profilePicture", { message: "Only JPG and PNG files are allowed" });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        form.setError("profilePicture", { message: "File size must be less than 2MB" });
        return;
      }

      form.setValue("profilePicture", file);
      form.clearErrors("profilePicture");

      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter your full name (at least 2 words)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="[email]@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="01537454231 or +8801537454231" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth * (Must be at least 18 years old)</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="profilePicture"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Picture (Optional)</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-muted-foreground">Only JPG/PNG files, max size 2MB</p>
                {profilePreview && (
                  <div className="mt-2">
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
