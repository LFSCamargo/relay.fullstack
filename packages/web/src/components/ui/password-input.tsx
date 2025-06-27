import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
  autocomplete?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  id,
  error,
  className,
  value,
  onChange,
  autocomplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }

    // Calculate password strength
    const password = e.target.value;
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Fair";
    if (passwordStrength === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autocomplete}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm pr-10
            focus:outline-none focus:ring-2 focus:ring-black focus:border-black
            transition-colors
            ${error ? "border-red-500" : "border-gray-300"}
            ${className || ""}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : `${id}-strength`}
          value={value}
          onChange={handleChange}
          {...props}
        />

        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {value && typeof value === "string" && value.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex space-x-1 flex-1">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                    index <= passwordStrength
                      ? getStrengthColor()
                      : "bg-gray-200"
                  }`}
                ></div>
              ))}
            </div>
            <span
              id={`${id}-strength`}
              className={`text-xs ml-2 ${
                passwordStrength <= 1
                  ? "text-red-500"
                  : passwordStrength === 2
                    ? "text-yellow-500"
                    : passwordStrength === 3
                      ? "text-blue-500"
                      : "text-green-500"
              }`}
            >
              {getStrengthText()}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600 mt-1 animate-fadeIn"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
