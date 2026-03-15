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
import AiContentGenerator from "../pages/teacher/aiContentGenerator";


// Moderator Pages
import ModeratorDashboard from "../pages/moderator/ModeratorDashboard";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSystemManagement from "../pages/admin/AdminSystemManagement";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminTeacherRequests from "../pages/admin/AdminTeacherRequests";
import AdminMaterials from "../pages/admin/AdminMaterials";
import AdminTopics from "../pages/admin/AdminTopics";

// Protected Route Component
import ProtectedRoute from "../components/ProtectedRoute";
import TeacherClassDetail from "../pages/teacher/teacherClassDetail";
import MaterialDetailPage from "../pages/teacher/MaterialDetailPage";
import StudentClassDetail from "../pages/student/StudentClassDetail";
import QuizTakingInterface from "../components/student/quizTakingInterface";
import QuizResultView from "../pages/student/QuizResultView";

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
          {
            path: "take-quiz/:id",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <QuizTakingInterface />
              </ProtectedRoute>
            ),
          },
          {
            path: "quiz-result/:id",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <QuizResultView />
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
            path: "class/:classId/ai-generator",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <AiContentGenerator />
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
            path: "courses",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminCourses />
              </ProtectedRoute>
            ),
          },
          {
            path: "topics",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminTopics />
              </ProtectedRoute>
            ),
          },
          {
            path: "materials",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminMaterials />
              </ProtectedRoute>
            ),
          },
          {
            path: "teacher-requests",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminTeacherRequests />
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
