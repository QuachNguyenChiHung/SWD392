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
import TeacherLessons from "../pages/teacher/TeacherLessons";

// Moderator Pages
import ModeratorDashboard from "../pages/moderator/ModeratorDashboard";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";

// Protected Route Component
import ProtectedRoute from "../components/ProtectedRoute";
import TeacherClassDetail from "../pages/teacher/teacherClassDetail";

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
            allowedRoles={[
              UserRole.GUEST,
              UserRole.STUDENT,
              UserRole.TEACHER,
              UserRole.MODERATOR,
              UserRole.ADMIN,
            ]}
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
            path: "lessons",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherLessons />
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
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];
