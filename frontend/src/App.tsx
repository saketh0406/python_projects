import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InstructorCourses from "./pages/InstructorCourses";
import InstructorCourseDetail from "./pages/InstructorCourseDetail";
import StudentCourses from "./pages/StudentCourses";
import StudentMyCourses from "./pages/StudentMyCourses";
import StudentCourseDetail from "./pages/StudentCourseDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Instructor Routes */}
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute>
              <InstructorCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId"
          element={
            <ProtectedRoute>
              <InstructorCourseDetail />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <StudentCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-courses"
          element={
            <ProtectedRoute>
              <StudentMyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <ProtectedRoute>
              <StudentCourseDetail />
            </ProtectedRoute>
          }
        />

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;