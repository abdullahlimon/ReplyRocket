import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-400",
        "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15",
        "disabled:bg-gray-50 disabled:text-gray-500",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-relaxed",
      "placeholder:text-gray-400",
      "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15",
      "disabled:bg-gray-50 disabled:text-gray-500",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "block w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm",
        "bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat",
        "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'><path d='m4 6 4 4 4-4'/></svg>\")",
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-gray-900",
        className,
      )}
      {...props}
    />
  );
}
