import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

function InstructorCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    fetchCourses(userData);
  }, []);

  const fetchCourses = async (userData: any) => {
    try {
      const response = await api.get("/courses");
      console.log("All courses:", response.data);
      console.log("User data:", userData);
      console.log("User email:", userData.email);
      console.log("User id:", userData.id);

      // Try both instructor_email and instructor_id
      const instructorCourses = response.data.filter(
        (c: any) =>
          c.instructor_email === userData.email ||
          c.instructor_id === userData.id
      );

      console.log("Filtered courses:", instructorCourses);
      setCourses(instructorCourses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Creating course with user:", user);

      const payload = {
      course: {
        title: title,
        description: description
      },
      instructor_email: user.email
    };

      console.log("Payload:", payload);

      const response = await api.post("/courses", payload);
      console.log("Create response:", response);

      setShowModal(false);
      setTitle("");
      setDescription("");
      setToast({ message: "Course created successfully! 🎉", type: "success" });
      fetchCourses(user);
    } catch (err: any) {
      console.error("Create course error:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => `${e.loc.join(".")}: ${e.msg}`).join(", "));
      } else {
        setError(detail || "Failed to create course");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoIcon}>📚</div>
          <h2 style={styles.sidebarTitle}>CourseHub</h2>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navItem} onClick={() => navigate("/dashboard")}>
            <span style={styles.navIcon}>📊</span>
            <span>Dashboard</span>
          </div>
          <div style={{...styles.navItem, ...styles.navItemActive}}>
            <span style={styles.navIcon}>📚</span>
            <span>My Courses</span>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header} className="fade-in">
          <div>
            <h1 style={styles.pageTitle}>My Courses</h1>
            <p style={styles.pageSubtitle}>Manage your courses and assignments</p>
          </div>
          <button
            style={styles.createBtn}
            className="custom-button"
            onClick={() => setShowModal(true)}
          >
            <span style={{ fontSize: "1.2rem" }}>+</span>
            Create Course
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsContainer} className="fade-in stagger-1">
          <div style={styles.statBox}>
            <div style={styles.statValue}>{courses.length}</div>
            <div style={styles.statLabel}>Total Courses</div>
          </div>
        </div>

        {/* Debug info - remove this after testing */}
        {user && (
          <div style={{
            background: "#f0f9ff",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "#0369a1"
          }}>
            <strong>Debug Info:</strong> User ID: {user.id}, Email: {user.email}
          </div>
        )}

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div style={styles.emptyState} className="fade-in stagger-2">
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>No courses yet</h3>
            <p style={styles.emptyDesc}>Create your first course to get started!</p>
            <button
              style={styles.createBtnLarge}
              className="custom-button"
              onClick={() => setShowModal(true)}
            >
              <span style={{ fontSize: "1.2rem" }}>+</span>
              Create Your First Course
            </button>
          </div>
        ) : (
          <div style={styles.courseGrid}>
            {courses.map((course, index) => (
              <div
                key={course.id}
                style={styles.courseCard}
                className={`hover-lift fade-in stagger-${Math.min(index + 2, 5)}`}
              >
                <div style={styles.courseHeader}>
                  <div style={styles.courseIcon}>📖</div>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                </div>

                <p style={styles.courseDesc}>
                  {course.description || "No description provided"}
                </p>

                <div style={styles.courseFooter}>
                  <div style={styles.courseId}>ID: {course.id}</div>
                  <div style={{ color: "#666", fontSize: "0.9rem" }}>
                    Instructor: {course.instructor_email || `ID: ${course.instructor_id}`}
                  </div>
                  <button
                    style={styles.manageBtn}
                    onClick={() => navigate(`/instructor/courses/${course.id}`)}
                  >
                    Manage →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            style={styles.modal}
            className="scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Course</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={styles.form}>
              {error && (
                <div style={styles.errorBox} className="error-shake">
                  <span style={styles.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                  className="custom-input"
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{...styles.input, ...styles.textarea}}
                  className="custom-input"
                  placeholder="Provide a brief description of the course..."
                  rows={4}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
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
                  {isLoading ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
    background: "#f8f9fa",
  },
  sidebar: {
    width: "280px",
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    color: "white",
    padding: "2rem 0",
    boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
    position: "sticky" as const,
    top: 0,
    height: "100vh",
    overflowY: "auto" as const,
  },
  sidebarHeader: {
    padding: "0 1.5rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "2rem",
  },
  logoIcon: {
    fontSize: "2rem",
    filter: "drop-shadow(0 0 10px rgba(102, 126, 234, 0.5))",
  },
  sidebarTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    color: "white",
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    padding: "0 1rem",
  },
  navItem: {
    padding: "1rem 1.5rem",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    color: "rgba(255,255,255,0.7)",
  },
  navItemActive: {
    background: "rgba(102, 126, 234, 0.2)",
    color: "white",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
  },
  navIcon: {
    fontSize: "1.3rem",
  },
  main: {
    flex: 1,
    padding: "2rem",
    overflowY: "auto" as const,
    paddingBottom: "4rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  createBtn: {
    padding: "0.9rem 1.8rem",
    fontSize: "1rem",
    fontWeight: "600",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  statsContainer: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    marginBottom: "2rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  statBox: {
    textAlign: "center" as const,
  },
  statValue: {
    fontSize: "3rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statLabel: {
    fontSize: "1rem",
    color: "#666",
    fontWeight: "500",
  },
  emptyState: {
    background: "white",
    padding: "4rem 2rem",
    borderRadius: "16px",
    textAlign: "center" as const,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  emptyIcon: {
    fontSize: "5rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#333",
  },
  emptyDesc: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "2rem",
  },
  createBtnLarge: {
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    fontWeight: "600",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  courseCard: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  courseHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  courseIcon: {
    fontSize: "2.5rem",
  },
  courseTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: 0,
    color: "#1a1a1a",
    flex: 1,
  },
  courseDesc: {
    fontSize: "1rem",
    color: "#666",
    lineHeight: 1.6,
    margin: 0,
    flex: 1,
  },
  courseFooter: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #E5E7EB",
  },
  courseId: {
    fontSize: "0.9rem",
    color: "#999",
    fontWeight: "500",
  },
  manageBtn: {
    padding: "0.6rem 1.2rem",
    background: "#EFF6FF",
    color: "#667eea",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    alignSelf: "flex-end",
    marginTop: "0.5rem",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    background: "white",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2rem 2rem 1rem",
    borderBottom: "1px solid #E5E7EB",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    color: "#1a1a1a",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#999",
    padding: "0.5rem",
    transition: "color 0.2s",
  },
  form: {
    padding: "2rem",
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
  textarea: {
    resize: "vertical" as const,
    minHeight: "100px",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    paddingTop: "1rem",
  },
  cancelBtn: {
    padding: "0.9rem 1.8rem",
    fontSize: "1rem",
    fontWeight: "600",
    background: "#F3F4F6",
    color: "#666",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  submitBtn: {
    padding: "0.9rem 1.8rem",
    fontSize: "1rem",
    fontWeight: "600",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
};

export default InstructorCourses;