import type React from "react";
import "./AuthForm.css";

interface AuthFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  errors: string[];
  onLogin: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onRegister: () => void;
  onDemoLogin: () => void;
}

function AuthForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  errors,
  onLogin,
  onRegister,
  onDemoLogin,
}: AuthFormProps) {
  return (
    <>
      <ul className="errors auth-errors">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
      <form className="auth-form" onSubmit={onLogin}>
        <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="Email" />
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" className="submit-button">
          Log in
        </button>
        <button type="button" onClick={onRegister}>
          Register
        </button>
        <button type="button" onClick={onDemoLogin}>
          Try the demo
        </button>
      </form>
    </>
  );
}

export default AuthForm;
