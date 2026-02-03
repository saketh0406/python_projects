import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function StudentCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchAssignments();
    checkEnrollment();
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

  const checkEnrollment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const enrollRes = await api.get("/enrollments", {
        params: { student_email: user.email },
      });
      const enrolled = enrollRes.data.some((e: any) => e.course_id === parseInt(courseId!));
      setIsEnrolled(enrolled);
    } catch (err) {
      console.error(err);
    }
  };

  if (!course) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
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
          <div style={styles.navItem} onClick={() => navigate("/student/courses")}>
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
        <div style={styles.courseHeader} className="fade-in">
          <button
            style={styles.backBtn}
            onClick={() => navigate(isEnrolled ? "/student/my-courses" : "/student/courses")}
          >
            ← Back
          </button>
          <div style={styles.courseInfo}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
              <h1 style={styles.pageTitle}>{course.title}</h1>
              {isEnrolled && <span style={styles.enrolledBadge}>✓ Enrolled</span>}
            </div>
            <p style={styles.pageSubtitle}>
              {course.description || "No description"}
            </p>
          </div>
        </div>

        <div style={styles.section} className="fade-in stagger-1">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Course Assignments ({assignments.length})</h2>
          </div>

          {assignments.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <h3 style={styles.emptyTitle}>No assignments yet</h3>
              <p style={styles.emptyDesc}>Your instructor hasn't posted any assignments yet.</p>
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
                      <p style={styles.assignmentDesc}>
                        {assignment.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  <div style={styles.assignmentFooter}>
                    <span style={styles.assignmentId}>Assignment ID: {assignment.id}</span>
                    <span style={styles.statusPending}>📋 Pending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
  courseInfo: {
    marginTop: "1rem",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: 0,
    color: "#1a1a1a",
  },
  pageSubtitle: {
    fontSize: "1rem",
    color: "#666",
    margin: "0.5rem 0 0 0",
  },
  enrolledBadge: {
    background: "#D1FAE5",
    color: "#065F46",
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
  },
  section: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #E5E7EB",
  },
  assignmentId: {
    color: "#999",
    fontSize: "0.85rem",
  },
  statusPending: {
    background: "#FEF3C7",
    color: "#92400E",
    padding: "0.5rem 1rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "500",
    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.2)",
  },
};

export default StudentCourseDetail;