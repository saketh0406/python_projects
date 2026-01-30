    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { login } from "../services/api";

    function Login() {
      const navigate = useNavigate();
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [error, setError] = useState("");

      const handleLogin = async (e: React.FormEvent) => {
          e.preventDefault();
          setError("");

          try {
            const data = await login(email, password);
            console.log("Logged in user:", data);
            localStorage.setItem("user", JSON.stringify(data)); // optional
            navigate("/dashboard");
          } catch (err: any) {
            console.error("Login error:", err.response?.data || err);
            setError(err.response?.data?.detail || "Invalid credentials or server error");
          }
        };


      return (
        <div style={{ padding: "2rem" }}>
          <h1>Login</h1>

          <form onSubmit={handleLogin}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button type="submit">Login</button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      );
    }

    export default Login;
