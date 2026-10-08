import LoginInput from "./LoginInput";
import LoginButton from "./LoginButton";

export default function LoginForm({
  username,
  password,
  setUsername,
  setPassword,
  loading,
  onSubmit,
}) {
  return (
    <form
      method="post"
      onSubmit={onSubmit}
      autoComplete="on"
      className="space-y-5 text-white"
    >
      <LoginInput
        id="username"
        name="username"
        label="Username"
        type="text"
        value={username}
        onChange={(event) =>
          setUsername(event.target.value)
        }
        placeholder="Enter your username"
        autoComplete="username"
        disabled={loading}
      />

      <LoginInput
        id="password"
        name="password"
        label="Password"
        type="password"
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
        placeholder="Enter your password"
        autoComplete="current-password"
        disabled={loading}
      />

      <LoginButton loading={loading} />
    </form>
  );
}