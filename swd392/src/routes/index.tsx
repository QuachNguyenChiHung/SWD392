import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { UserRole } from "../types";

// Layouts
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Guest Pages
import GuestDashboard from "../pages/guest/GuestDashboard";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentClasses from "../pages/student/StudentClasses";
import StudentQuizzes from "../pages/student/StudentQuizzes";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherClasses from "../pages/teacher/TeacherClasses";


// Moderator Pages
import ModeratorDashboard from "../pages/moderator/ModeratorDashboard";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSystemManagement from "../pages/admin/AdminSystemManagement";

// Protected Route Component
import ProtectedRoute from "../components/ProtectedRoute";
import TeacherClassDetail from "../pages/teacher/teacherClassDetail";
import MaterialDetailPage from "../pages/teacher/MaterialDetailPage";
import StudentClassDetail from "../pages/student/StudentClassDetail";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Guest Routes
      {
        path: "dashboard",
        element: (
          <ProtectedRoute
            allowedRoles={[UserRole.GUEST]}
          >
            <GuestDashboard />
          </ProtectedRoute>
        ),
      },

      // Student Routes
      {
        path: "student",
        children: [
          {
            path: "dashboard",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "classes",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentClasses />
              </ProtectedRoute>
            ),
          },
          {
            path: "quizzes",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentQuizzes />
              </ProtectedRoute>
            ),
          },
          {
            path: "class/:classId",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentClassDetail />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Teacher Routes
      {
        path: "teacher",
        children: [
          {
            path: "dashboard",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "classes",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherClasses />
              </ProtectedRoute>
            ),
          },
          {
            path: "class/:classId",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherClassDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "class/:classId/materials/:materialId",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <MaterialDetailPage />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Moderator Routes
      {
        path: "moderator",
        children: [
          {
            path: "dashboard",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorDashboard />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Admin Routes
      {
        path: "admin",
        children: [
          {
            path: "dashboard",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "users",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminUsers />
              </ProtectedRoute>
            ),
          },
          {
            path: "system",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminSystemManagement />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];
