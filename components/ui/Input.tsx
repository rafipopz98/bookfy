import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-sm uppercase tracking-[0.08em] text-ink-soft">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "border border-accent bg-paper px-4 py-3 text-ink placeholder:text-ink-soft/60 outline-none transition-colors focus:border-ink",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
