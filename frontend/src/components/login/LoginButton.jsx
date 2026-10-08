export default function LoginButton({
  loading,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-gradient-to-br from-[#0b1f3a] via-[#102f52] to-[#163e68] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Logging in..." : "Login"}
    </button>
  );
}