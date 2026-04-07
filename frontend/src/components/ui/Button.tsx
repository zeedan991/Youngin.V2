import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "gold" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-[#00E5FF] text-[#0A0A0A] box-glow hover:bg-[#00daf3]",
      gold: "bg-[#F5C842] text-[#0A0A0A] shadow-[0_0_15px_rgba(245,200,66,0.4)] hover:bg-[#e3b630]",
      ghost: "bg-transparent text-white hover:bg-white/5",
      outline: "bg-transparent border border-white/20 text-white hover:bg-white/5"
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-bold transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00E5FF] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {icon && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";
