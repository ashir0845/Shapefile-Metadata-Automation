import { useState } from "react";
import { KeyRound, X } from "lucide-react";

import { changePassword } from "../../services/api";

const MIN_PASSWORD_LENGTH = 8;

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const FIELDS = [
  { name: "currentPassword", label: "Current password" },
  { name: "newPassword", label: "New password" },
  { name: "confirmPassword", label: "Confirm new password" },
];

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword === form.currentPassword) {
      setError(
        "New password must be different from the current password.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await changePassword(
        form.currentPassword,
        form.newPassword,
      );

      setSuccess("Password changed successfully.");
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="change-password-title"
            className="flex items-center gap-2 text-lg font-bold text-[#0b1f3a]"
          >
            <KeyRound size={20} />
            Change password
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {FIELDS.map((field) => (
            <label
              key={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}

              <input
                type="password"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                autoComplete={
                  field.name === "currentPassword"
                    ? "current-password"
                    : "new-password"
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#285596] focus:outline-none focus:ring-2 focus:ring-[#285596]/20"
              />
            </label>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#285596] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b1f3a] disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}