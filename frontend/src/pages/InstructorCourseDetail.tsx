import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

function InstructorCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    fetchCourseDetails();
    fetchAssignments();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get("/courses");
      const foundCourse = response.data.find((c: any) => c.id === parseInt(courseId!));
      setCourse(foundCourse);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/courses/${courseId}/assignments`);
      setAssignments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        assignment: {
          title: newAssignment.title,
          description: newAssignment.description,
        },
        instructor_email: user.email,
      };

      await api.post(`/courses/${courseId}/assignments`, payload);

      setShowModal(false);
      setNewAssignment({ title: "", description: "" });
      setToast({ message: "Assignment created successfully! 🎉", type: "success" });
      fetchAssignments();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => `${e.loc.join(".")}: ${e.msg}`).join(", "));
      } else {
        setError(detail || "Failed to create assignment");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={styles.page}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
          <div style={styles.navItem} onClick={() => navigate("/instructor/courses")}>
            <span style={styles.navIcon}>📚</span>
            <span>My Courses</span>
          </div>
        </nav>
      </aside>

      <main style={styles.main}>
        <div style={styles.courseHeader} className="fade-in">
          <button style={styles.backBtn} onClick={() => navigate("/instructor/courses")}>
            ← Back to Courses
          </button>
          <div style={{ marginTop: "1rem" }}>
            <h1 style={styles.pageTitle}>{course.title}</h1>
            <p style={styles.pageSubtitle}>{course.description || "No description"}</p>
          </div>
        </div>

        <div style={styles.section} className="fade-in stagger-1">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Assignments ({assignments.length})</h2>
            <button
              style={styles.addBtn}
              className="custom-button"
              onClick={() => { setShowModal(true); setError(""); }}
            >
              + Add Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <h3 style={styles.emptyTitle}>No assignments yet</h3>
              <p style={styles.emptyDesc}>Create your first assignment for this course</p>
              <button
                style={styles.addBtnLarge}
                className="custom-button"
                onClick={() => { setShowModal(true); setError(""); }}
              >
                + Add Assignment
              </button>
            </div>
          ) : (
            <div style={styles.assignmentList}>
              {assignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  style={styles.assignmentCard}
                  className={`fade-in stagger-${Math.min(index + 2, 5)}`}
                >
                  <div style={styles.assignmentHeader}>
                    <div style={styles.assignmentNumber}>#{assignment.number}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.assignmentTitle}>{assignment.title}</h3>
                      <p style={styles.assignmentDesc}>{assignment.description || "No description"}</p>
                    </div>
                  </div>
                  <div style={styles.assignmentFooter}>
                    <span style={styles.assignmentId}>Assignment ID: {assignment.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div
              style={styles.modal}
              className="scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Create New Assignment</h2>
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} style={styles.form}>
                {error && (
                  <div style={styles.errorBox} className="error-shake">
                    <span style={styles.errorIcon}>⚠️</span>
                    {error}
                  </div>
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Assignment Title</label>
                  <input
                    style={styles.input}
                    className="custom-input"
                    type="text"
                    placeholder="e.g., Introduction to Variables"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={{ ...styles.input, ...styles.textarea }}
                    className="custom-input"
                    placeholder="Describe the assignment requirements..."
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    rows={4}
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
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    className="custom-button"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Assignment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
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
  navIcon: {
    fontSize: "1.3rem",
  },
  main: {
    flex: 1,
    padding: "2rem",
    paddingBottom: "4rem",
    overflowY: "auto" as const,
  },
  courseHeader: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    marginBottom: "2rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  backBtn: {
    padding: "0.75rem 1.5rem",
    background: "#F3F4F6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  section: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #E5E7EB",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
    color: "#1a1a1a",
  },
  addBtn: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  emptyState: {
    padding: "4rem 2rem",
    textAlign: "center" as const,
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
  addBtnLarge: {
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.05rem",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
  assignmentList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  assignmentCard: {
    padding: "1.5rem",
    background: "#F9FAFB",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },
  assignmentHeader: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1rem",
    alignItems: "flex-start",
  },
  assignmentNumber: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "0.75rem 1.25rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "1.2rem",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
  assignmentTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
  },
  assignmentDesc: {
    color: "#666",
    fontSize: "0.95rem",
    margin: 0,
    lineHeight: 1.6,
  },
  assignmentFooter: {
    paddingTop: "1rem",
    borderTop: "1px solid #E5E7EB",
  },
  assignmentId: {
    color: "#999",
    fontSize: "0.85rem",
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
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
  },
  textarea: {
    resize: "vertical" as const,
    minHeight: "120px",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    paddingTop: "1rem",
  },
  cancelBtn: {
    padding: "0.9rem 1.8rem",
    background: "#F3F4F6",
    color: "#666",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  submitBtn: {
    padding: "0.9rem 1.8rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    transition: "all 0.3s ease",
  },
};

export default InstructorCourseDetail;