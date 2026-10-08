import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/api";
import LoginCard from "../components/login/LoginCard";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(username.trim(), password);

      sessionStorage.setItem("access_token", data.access_token);

      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("role", data.role);

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
      <LoginCard
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
