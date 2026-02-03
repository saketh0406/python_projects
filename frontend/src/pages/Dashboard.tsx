import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    students: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        // Check if we have the /me endpoint
        try {
          const response = await api.get("/me", {
            params: { email: user.email },
          });
          setProfile(response.data);
        } catch (err) {
          // If /me endpoint doesn't exist, use the user data from localStorage
          setProfile(user);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Fetch all courses
        const coursesRes = await api.get("/courses");
        setCourses(coursesRes.data);

        // Get my courses based on role
        const myCourses = profile.role === "instructor"
          ? coursesRes.data.filter((c: any) => c.instructor_id === profile.id)
          : [];

        // If student, fetch enrollments
        if (profile.role === "student") {
          const enrollRes = await api.get("/enrollments", {
            params: { student_email: user.email },
          });
          setEnrollments(enrollRes.data);
        }

        // Calculate stats based on role
        if (profile.role === "instructor") {
          // For instructor, calculate total students and assignments
          let totalStudents = 0;
          let totalAssignments = 0;

          // Get all enrollments to count students
          try {
            const allEnrollments = await api.get("/enrollments");

            // Count unique students for my courses
            const myCourseIds = myCourses.map((c: any) => c.id);
            const myCourseEnrollments = allEnrollments.data.filter(
              (e: any) => myCourseIds.includes(e.course_id)
            );

            // Count unique students
            const uniqueStudents = new Set();
            myCourseEnrollments.forEach((e: any) => {
              uniqueStudents.add(e.student_email || e.student_id);
            });
            totalStudents = uniqueStudents.size;
          } catch (err) {
            console.error("Error fetching enrollments:", err);
          }

          // Try to get assignments if the endpoint exists
          try {
            for (const course of myCourses) {
              try {
                const assignmentsRes = await api.get(`/courses/${course.id}/assignments`);
                totalAssignments += assignmentsRes.data?.length || 0;
              } catch (assignErr) {
                // Endpoint might not exist, skip
                console.log(`Assignments endpoint not available for course ${course.id}`);
              }
            }
          } catch (err) {
            console.error("Error calculating assignments:", err);
          }

          setStats({
            courses: myCourses.length,
            assignments: totalAssignments,
            students: totalStudents,
          });
        } else {
          // For student
          const enrollRes = await api.get("/enrollments", {
            params: { student_email: user.email },
          });
          setEnrollments(enrollRes.data);

          let totalAssignments = 0;

          // Count assignments from enrolled courses
          for (const enrollment of enrollRes.data) {
            try {
              const assignmentsRes = await api.get(`/courses/${enrollment.course_id}/assignments`);
              totalAssignments += assignmentsRes.data?.length || 0;
            } catch (err) {
              console.error("Error fetching assignments:", err);
            }
          }

          setStats({
            courses: enrollRes.data.length,
            assignments: totalAssignments,
            students: 0,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!profile) return <div style={styles.loading}>Loading...</div>;

  const isInstructor = profile.role === "instructor";
  const myCourses = isInstructor
    ? courses.filter(c => c.instructor_id === profile.id)
    : courses.filter(c => enrollments.some(e => e.course_id === c.id));

  const statCards = isInstructor
    ? [
        { icon: "📚", label: "My Courses", value: stats.courses, color: "#667eea", path: "/instructor/courses" },
        { icon: "📝", label: "Assignments", value: stats.assignments, color: "#f093fb", path: "/instructor/courses" },
        { icon: "👥", label: "Total Students", value: stats.students, color: "#4facfe", path: "/instructor/courses" },
      ]
    : [
        { icon: "🎓", label: "Enrolled Courses", value: stats.courses, color: "#667eea", path: "/student/my-courses" },
        { icon: "📋", label: "Assignments", value: stats.assignments, color: "#f093fb", path: "/student/my-courses" },
        { icon: "📖", label: "Available Courses", value: courses.length, color: "#4facfe", path: "/student/courses" },
      ];

  const quickActions = isInstructor
    ? [
        { icon: "➕", label: "Create Course", path: "/instructor/courses", color: "#667eea" },
        { icon: "📊", label: "Manage Courses", path: "/instructor/courses", color: "#764ba2" },
      ]
    : [
        { icon: "🔍", label: "Browse Courses", path: "/student/courses", color: "#667eea" },
        { icon: "📚", label: "My Enrollments", path: "/student/my-courses", color: "#764ba2" },
      ];

  return (
    <div style={styles.container}>
      <div style={styles.bgGradient}></div>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>📚</div>
            <span style={styles.logoText}>CourseHub</span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout →
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeSection} className="fade-in">
          <div>
            <h1 style={styles.welcomeTitle}>Welcome back, {profile.name}! 👋</h1>
            <p style={styles.welcomeSubtitle}>
              {isInstructor
                ? "Here's what's happening with your courses today"
                : "Ready to continue your learning journey?"}
            </p>
          </div>
          <div style={styles.roleBadge}>
            {isInstructor ? "👨‍🏫 Instructor" : "🎓 Student"}
          </div>
        </div>

        <div style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              style={{
                ...styles.statCard,
                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
              }}
              className={`hover-lift stagger-${index + 1} fade-in`}
              onClick={() => navigate(stat.path)}
            >
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.section} className="fade-in stagger-4">
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <div
                key={action.label}
                style={{
                  ...styles.actionCard,
                  background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`,
                  borderLeft: `4px solid ${action.color}`,
                }}
                className="hover-lift"
                onClick={() => navigate(action.path)}
              >
                <div style={{...styles.actionIcon, background: action.color}}>
                  {action.icon}
                </div>
                <span style={styles.actionLabel}>{action.label}</span>
                <span style={styles.actionArrow}>→</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section} className="fade-in stagger-5">
          <h2 style={styles.sectionTitle}>
            {isInstructor ? "Your Recent Courses" : "Your Enrollments"}
          </h2>

          {myCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <h3 style={styles.emptyTitle}>
                {isInstructor ? "No courses yet" : "Not enrolled yet"}
              </h3>
              <p style={styles.emptyDesc}>
                {isInstructor
                  ? "Create your first course to get started!"
                  : "Browse courses and enroll in topics you're interested in!"}
              </p>
              <button
                style={styles.browseBtn}
                className="custom-button"
                onClick={() => navigate(isInstructor ? "/instructor/courses" : "/student/courses")}
              >
                {isInstructor ? "Create Course" : "Browse Courses"}
              </button>
            </div>
          ) : (
            <div style={styles.courseGrid}>
              {myCourses.slice(0, 3).map((course, index) => (
                <div
                  key={course.id}
                  style={styles.courseCard}
                  className={`hover-lift fade-in stagger-${Math.min(index + 1, 3)}`}
                  onClick={() => navigate(
                    isInstructor
                      ? `/instructor/courses/${course.id}`
                      : `/student/courses/${course.id}`
                  )}
                >
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseDesc}>{course.description || "No description"}</p>
                  <div style={styles.courseFooter}>
                    <span style={styles.courseId}>ID: {course.id}</span>
                    <span style={styles.viewBtn}>View →</span>
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

// Keep your existing styles object (same as before)
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f9fa",
    fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
    position: "relative" as const,
  },
  bgGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "300px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    zIndex: 0,
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "1.2rem",
    color: "#666",
  },
  header: {
    position: "relative" as const,
    zIndex: 10,
    padding: "1.5rem 2rem",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logoIcon: {
    fontSize: "2rem",
    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))",
  },
  logoText: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "white",
    letterSpacing: "-0.02em",
  },
  logoutBtn: {
    padding: "0.75rem 1.5rem",
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  main: {
    position: "relative" as const,
    zIndex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    paddingBottom: "4rem",
  },
  welcomeSection: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "1rem",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  welcomeTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },
  welcomeSubtitle: {
    fontSize: "1.1rem",
    color: "#666",
    margin: 0,
  },
  roleBadge: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "12px",
    fontSize: "1.1rem",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    padding: "2rem",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    color: "white",
  },
  statIcon: {
    fontSize: "3rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: "700",
    lineHeight: 1,
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "1rem",
    opacity: 0.95,
    fontWeight: "500",
  },
  section: {
    background: "white",
    padding: "2rem",
    borderRadius: "16px",
    marginBottom: "2rem",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: "0 0 1.5rem 0",
    color: "#1a1a1a",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
  },
  actionCard: {
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  actionIcon: {
    width: "3rem",
    height: "3rem",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "white",
  },
  actionLabel: {
    flex: 1,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
  },
  actionArrow: {
    fontSize: "1.5rem",
    color: "#999",
    transition: "transform 0.3s ease",
  },
  emptyState: {
    padding: "3rem 2rem",
    textAlign: "center" as const,
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#333",
  },
  emptyDesc: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "1.5rem",
  },
  browseBtn: {
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
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  courseCard: {
    padding: "1.5rem",
    background: "#f8f9fa",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "1px solid #e5e7eb",
  },
  courseTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    margin: "0 0 0.75rem 0",
    color: "#1a1a1a",
  },
  courseDesc: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "0 0 1rem 0",
    lineHeight: 1.5,
  },
  courseFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  courseId: {
    fontSize: "0.85rem",
    color: "#999",
  },
  viewBtn: {
    fontSize: "0.9rem",
    color: "#667eea",
    fontWeight: "600",
  },
};

export default Dashboard;