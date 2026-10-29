import { useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import { parseApiError, type FieldErrors } from "../utils/errors";

type Mode = "login" | "register";

export function LoginPage() {
  const { user, login } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const showErrors = (name: string) =>
    (fields[name] ?? []).map((m) => <p key={m} role="alert">{m}</p>);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setFields({});
    setSubmitting(true);
    try {
      if (mode === "register") {
        await authApi.register({
          username,
          display_name: displayName,
          password,
          join_code: joinCode,
        });
        toast.success("Account created!");
      }
      await login({ username, password });
    } catch (error) {
      const parsed = parseApiError(error);
      setMessage(parsed.message);
      setFields(parsed.fields);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Hangout Board</h1>
      <form onSubmit={handleSubmit}>
        <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
        {message && <p role="alert">{message}</p>}

        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        {showErrors("username")}

        {mode === "register" && (
          <>
            <label htmlFor="displayName">Display name</label>
            <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            {showErrors("display_name")}

            <label htmlFor="joinCode">Join code</label>
            <input id="joinCode" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required />
            {showErrors("join_code")}
          </>
        )}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {showErrors("password")}

        <button type="submit" disabled={submitting}>
          {mode === "login" ? "Log in" : "Register"}
        </button>
      </form>
      <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
      </button>
    </main>
  );
}