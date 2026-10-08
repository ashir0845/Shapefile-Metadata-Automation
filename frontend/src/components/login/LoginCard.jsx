import LoginLogo from "./LoginLogo";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";

export default function LoginCard({
  username,
  password,
  setUsername,
  setPassword,
  loading,
  error,
  onSubmit,
}) {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <LoginLogo />

        <LoginHeader />

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <LoginForm
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          loading={loading}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}