import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full rounded-[50px] bg-primary border-2 border-transparent px-5 py-3 text-white placeholder:text-smoke-purple focus:border-persian-pink focus:outline-none transition-colors ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";
