import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgPattern}></div>

      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>📚</div>
            <h1 style={styles.brandTitle}>CourseHub</h1>
          </div>
          <p style={styles.tagline}>
            Modern course management for the next generation of learning
          </p>
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✨</span>
              <span>Real-time collaboration</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>📊</span>
              <span>Progress analytics</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🎯</span>
              <span>Assignment tracking</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            {error && (
              <div style={styles.errorBox} className="error-shake">
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                className="custom-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                className="custom-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              className="custom-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>New to CourseHub?</span>
            <div style={styles.dividerLine}></div>
          </div>

          <button
            style={styles.createAccountBtn}
            className="custom-button-outline"
            onClick={() => navigate("/register")}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",  // Changed from height to minHeight
    position: "relative" as const,
    fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
  },
  bgPattern: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 90%, rgba(255, 195, 113, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)
    `,
    zIndex: 0,
  },
  leftPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    position: "relative" as const,
    zIndex: 1,
    minHeight: "100vh",  // Added minHeight for proper sizing
  },
  brandingContent: {
    maxWidth: "500px",
    color: "white",
    animation: "fadeInUp 0.8s ease-out",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  logoIcon: {
    fontSize: "3rem",
    filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
  },
  brandTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em",
  },
  tagline: {
    fontSize: "1.3rem",
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: "3rem",
    fontWeight: "300",
  },
  features: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "400",
  },
  featureIcon: {
    fontSize: "1.5rem",
    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))",
  },
  rightPanel: {
    width: "550px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 3rem",
    position: "relative" as const,
    zIndex: 1,
    boxShadow: "-20px 0 60px rgba(0, 0, 0, 0.2)",
    overflowY: "auto" as const,  // Added scroll capability
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
    animation: "fadeIn 1s ease-out 0.2s both",
  },
  formHeader: {
    marginBottom: "2.5rem",
  },
  formTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  formSubtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
    fontWeight: "400",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  errorBox: {
    padding: "1rem",
    background: "#FEE2E2",
    border: "1px solid #FCA5A5",
    borderRadius: "10px",
    color: "#991B1B",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  errorIcon: {
    fontSize: "1.2rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "0.9rem 1rem",
    fontSize: "1rem",
    border: "2px solid #E5E7EB",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    outline: "none",
  },
  submitBtn: {
    padding: "1rem",
    fontSize: "1.05rem",
    fontWeight: "600",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "0.5rem",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  },
  divider: {
    margin: "2rem 0 1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#E5E7EB",
  },
  dividerText: {
    color: "#999",
    fontSize: "0.9rem",
  },
  createAccountBtn: {
    width: "100%",
    padding: "1rem",
    fontSize: "1.05rem",
    fontWeight: "600",
    background: "white",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

export default Login;