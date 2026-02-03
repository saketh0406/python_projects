import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

function StudentCourses() {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<{ [key: number]: string }>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const coursesRes = await api.get("/courses");
      setAllCourses(coursesRes.data);

      const enrollRes = await api.get("/enrollments", {
        params: { student_email: user.email },
      });
      setEnrollments(enrollRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (courseId: number) => {
    setLoading({ ...loading, [courseId]: true });
    setError({ ...error, [courseId]: "" });

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        enrollment: {
          course_id: courseId,
        },
        student_email: user.email,
      };

      await api.post("/enroll", payload);
      setToast({ message: "Enrolled successfully! 🎉", type: "success" });
      fetchData();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : "Failed to enroll";
      setError({ ...error, [courseId]: msg });
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading({ ...loading, [courseId]: false });
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrollments.some((e) => e.course_id === courseId);
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
            <span style={styles.navIcon}>📖</span>
            <span>Browse Courses</span>
          </div>
          <div style={styles.navItem} onClick={() => navigate("/student/my-courses")}>
            <span style={styles.navIcon}>🎓</span>
            <span>My Enrollments</span>
          </div>
        </nav>
      </aside>

      <main style={styles.main}>
        <div style={styles.header} className="fade-in">
          <div>
            <h1 style={styles.pageTitle}>Browse Courses</h1>
            <p style={styles.pageSubtitle}>Explore and enroll in available courses</p>
          </div>
        </div>

        {allCourses.length === 0 ? (
          <div style={styles.emptyState} className="fade-in stagger-1">
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>No courses available</h3>
            <p style={styles.emptyDesc}>Check back later for new courses!</p>
          </div>
        ) : (
          <div style={styles.courseGrid}>
            {allCourses.map((course, index) => {
              const enrolled = isEnrolled(course.id);
              return (
                <div
                  key={course.id}
                  style={styles.courseCard}
                  className={`hover-lift fade-in stagger-${Math.min(index + 1, 5)}`}
                >
                  <div style={styles.courseHeader}>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    {enrolled && <span style={styles.enrolledBadge}>✓ Enrolled</span>}
                  </div>

                  <p style={styles.courseDesc}>{course.description || "No description provided"}</p>

                  {error[course.id] && (
                    <div style={styles.errorBox} className="error-shake">
                      ⚠️ {error[course.id]}
                    </div>
                  )}

                  <div style={styles.courseFooter}>
                    <span style={styles.courseId}>ID: {course.id}</span>
                    {enrolled ? (
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                      >
                        View Course →
                      </button>
                    ) : (
                      <button
                        style={styles.enrollBtn}
                        className="custom-button"
                        onClick={() => handleEnroll(course.id)}
                        disabled={loading[course.id]}
                      >
                        {loading[course.id] ? "Enrolling..." : "Enroll Now"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
    paddingBottom: "4rem",
    overflowY: "auto" as const,
  },
  header: {
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
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
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
    display: "flex",
    flexDirection: "column" as const,
    transition: "all 0.3s ease",
  },
  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
    gap: "1rem",
  },
  courseTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: 0,
    color: "#1a1a1a",
    flex: 1,
  },
  enrolledBadge: {
    background: "#D1FAE5",
    color: "#065F46",
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "500",
    whiteSpace: "nowrap" as const,
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
  },
  courseDesc: {
    color: "#666",
    fontSize: "1rem",
    lineHeight: 1.6,
    flex: 1,
    marginBottom: "1rem",
  },
  errorBox: {
    background: "#FEE2E2",
    color: "#991B1B",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  },
  courseFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #E5E7EB",
  },
  courseId: {
    color: "#999",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  enrollBtn: {
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
  viewBtn: {
    padding: "0.75rem 1.5rem",
    background: "#EFF6FF",
    color: "#667eea",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
};

export default StudentCourses;