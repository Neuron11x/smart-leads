import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, id, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
          ${error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-600"
          }
          ${className}
        `}
      />
      {/* Show validation error below input */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
