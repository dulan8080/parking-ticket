"use client";

import { InputHTMLAttributes, ChangeEvent } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  uppercase?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({
  label,
  error,
  className = "",
  uppercase = false,
  onChange,
  ...props
}: InputProps) => {
  // Handle input change with uppercase conversion if needed
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (uppercase) {
      // Create a new event with uppercase value
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: e.target.value.toUpperCase()
        }
      };
      onChange && onChange(newEvent);
    } else {
      onChange && onChange(e);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : ""
        } ${uppercase ? "uppercase" : ""} ${className}`}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input; 