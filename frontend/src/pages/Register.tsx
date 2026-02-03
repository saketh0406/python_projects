import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err.response?.data || err);
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgPattern}></div>

      <div style={styles.formWrapper}>
        <div style={styles.formCard}>
          <div style={styles.header}>
            <div style={styles.logoIcon}>📚</div>
            <h1 style={styles.title}>CourseHub</h1>
            <p style={styles.subtitle}>Create your account</p>
          </div>

          <form onSubmit={handleRegister} style={styles.form}>
            {error && (
              <div style={styles.errorBox} className="error-shake">
                <span>⚠️</span> {error}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                className="custom-input"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                className="custom-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                className="custom-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>I am a:</label>
              <select
                style={styles.select}
                className="custom-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              className="custom-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              type="button"
              style={styles.loginBtn}
              className="custom-button-outline"
              onClick={() => navigate("/login")}
            >
              Already have an account? Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
    padding: "2rem 1rem",
    position: "relative" as const,
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
      linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    `,
    zIndex: 0,
  },
  formWrapper: {
    position: "relative" as const,
    zIndex: 1,
    width: "100%",
    maxWidth: "500px",
  },
  formCard: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "3rem 2.5rem",
    animation: "scaleIn 0.5s ease-out",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2.5rem",
  },
  logoIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  title: {
    margin: "0 0 0.5rem 0",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  subtitle: {
    margin: 0,
    color: "#666",
    fontSize: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  errorBox: {
    background: "#FEE2E2",
    color: "#991B1B",
    padding: "1rem",
    borderRadius: "10px",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
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
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
  },
  select: {
    padding: "0.9rem 1rem",
    fontSize: "1rem",
    border: "2px solid #E5E7EB",
    borderRadius: "10px",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
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
    marginTop: "0.5rem",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  loginBtn: {
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

export default Register;