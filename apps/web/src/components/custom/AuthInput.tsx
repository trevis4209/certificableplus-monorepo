"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { cn } from "@certplus/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ 
    icon: Icon, 
    type = "text", 
    showPasswordToggle = false, 
    containerClassName,
    className,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle 
      ? showPassword 
        ? "text" 
        : "password"
      : type;

    return (
      <div className={cn(
        "flex items-center px-4 py-3 lg:py-4 rounded-xl transition-all duration-200",
        "bg-gray-50 dark:bg-gray-800",
        "border border-gray-300 dark:border-gray-600",
        "hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500",
        isFocused && "bg-gray-100 dark:bg-gray-700 ring-2 ring-[#2A9D8F]/20 border-[#2A9D8F]/50",
        containerClassName
      )}>
        {Icon && (
          <Icon size={20} className="text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={cn(
            "flex-1 bg-transparent outline-none border-0 ring-0 focus:ring-0 focus:border-0",
            "text-lg lg:text-xl text-gray-900 dark:text-white",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
