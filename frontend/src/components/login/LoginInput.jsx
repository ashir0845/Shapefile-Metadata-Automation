import { useEffect, useState } from "react";

export default function LoginInput({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}) {
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (disabled) setShowPassword(false);
  }, [disabled]);
  const isPassword = type === "password";

  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-black">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={disabled}
          className="w-full rounded-lg border border-black  bg-transparent px-4 py-3 pr-12 text-sm text-black  transition placeholder:text-gray-300 focus:border-black "
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-black transition  disabled:cursor-not-allowed"
          >
            {showPassword ? (
              /* Eye Off */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.5 12s3.75 7.5 10.5 7.5c1.65 0 3.12-.384 4.402-1.013"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.228 6.228C7.81 5.15 9.72 4.5 12 4.5c6.75 0 10.5 7.5 10.5 7.5a19.48 19.48 0 0 1-3.073 4.153"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.228 6.228 3 3m3.228 3.228 4.242 4.242m3.06 3.06 3.06 3.06M21 21l-3.228-3.228"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.88 9.88a3 3 0 0 0 4.24 4.24"
                />
              </svg>
            ) : (
              /* Eye */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
