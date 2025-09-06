"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef(({ className, onValueChange, value, children, ...props }, ref) => {
  return (
    <div className={cn("grid gap-2", className)} role="radiogroup" ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, checked, onChange, ...props }, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      className={cn("h-4 w-4 rounded-full border border-gray-300 text-blue-600 focus:ring-blue-500", className)}
      checked={checked}
      onChange={onChange}
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
