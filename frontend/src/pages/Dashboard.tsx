import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await api.get("/me", {
          params: { email: user.email },
        });
        setProfile(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!profile) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={{ marginBottom: "2rem" }}>MyApp</h2>
        <p>Dashboard</p>
        <p>Profile</p>
        <p>Settings</p>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topbar}>
          <span>Welcome, {profile.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Content */}
        <h1>Dashboard</h1>

        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>Total Activity</h3>
            <p>123</p>
          </div>
          <div style={styles.card}>
            <h3>Status</h3>
            <p>Active</p>
          </div>
          <div style={styles.card}>
            <h3>Role</h3>
            <p>{profile.role || "User"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: "sans-serif",
  },
  sidebar: {
    width: "220px",
    background: "#111827",
    color: "white",
    padding: "2rem",
  },
  main: {
    flex: 1,
    padding: "2rem",
    background: "grey",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2rem",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
    marginTop: "1.5rem",
  },
  card: {
    background: "darkgrey",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
};

export default Dashboard;

