import { lazy } from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { UserRole } from "../types";

// Protected Route Component
import ProtectedRoute from "../components/ProtectedRoute";

const MainLayout = lazy(() => import("../layouts/MainLayout"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));

const GuestDashboard = lazy(() => import("../pages/guest/GuestDashboard"));

const StudentDashboard = lazy(() => import("../pages/student/StudentDashboard"));
const StudentClasses = lazy(() => import("../pages/student/StudentClasses"));
const StudentQuizzes = lazy(() => import("../pages/student/StudentQuizzes"));
const StudentClassDetail = lazy(() => import("../pages/student/StudentClassDetail"));
const QuizResultView = lazy(() => import("../pages/student/QuizResultView"));
const StudentAIHistory = lazy(() => import("../pages/student/StudentAIHistory"));
const QuizTakingInterface = lazy(() => import("../components/student/quizTakingInterface"));

const TeacherDashboard = lazy(() => import("../pages/teacher/TeacherDashboard"));
const TeacherClasses = lazy(() => import("../pages/teacher/TeacherClasses"));
const TeacherProfilePage = lazy(() => import("../pages/teacher/teacherProfile"));
const TeacherClassDetail = lazy(() => import("../pages/teacher/teacherClassDetail"));
const MaterialDetailPage = lazy(() => import("../pages/teacher/MaterialDetailPage"));
const AiContentGenerator = lazy(() => import("../pages/teacher/aiContentGenerator"));
const TeacherAIHistory = lazy(() => import("../pages/teacher/TeacherAIHistory"));

const ModeratorDashboard = lazy(() => import("../pages/moderator/ModeratorDashboard"));
const ModeratorFlaggedMaterialPage = lazy(() => import("../pages/moderator/ModeratorFlaggedMaterialPage"));
const ModeratorUserSuspension = lazy(() => import("../pages/moderator/ModeratorUserSuspension"));
const ModeratorCoursesPage = lazy(() => import("../pages/moderator/ModeratorCoursesPage"));
const ModeratorTopicsPage = lazy(() => import("../pages/moderator/ModeratorTopicsPage"));
const ModeratorMaterialsPage = lazy(() => import("../pages/moderator/ModeratorMaterialsPage"));
const ModeratorClassesPage = lazy(() => import("../pages/moderator/ModeratorClassesPage"));
const ModeratorClassMaterialsPage = lazy(() => import("../pages/moderator/ModeratorClassMaterialsPage"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminCourses = lazy(() => import("../pages/admin/AdminCourses"));
const AdminClasses = lazy(() => import("../pages/admin/AdminClasses"));
const AdminMaterials = lazy(() => import("../pages/admin/AdminMaterials"));
const AdminSystemManagement = lazy(() => import("../pages/admin/AdminSystemManagement"));
const AdminAIHistory = lazy(() => import("../pages/admin/AdminAIHistory"));

const HomePage = lazy(() => import("../pages/HomePage"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
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
            path: "ai-history",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                <StudentAIHistory />
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
            path: "profile",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherProfilePage />
              </ProtectedRoute>
            ),
          },
          {
            path: "ai-history",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                <TeacherAIHistory />
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
          {
            path: "flagged",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorFlaggedMaterialPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "user-suspension",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorUserSuspension />
              </ProtectedRoute>
            ),
          },
          {
            path: "courses",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorCoursesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "courses/:courseId/topics",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorTopicsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "topics/:topicId/materials",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorMaterialsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "classes",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorClassesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "classes/:classId/materials",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
                <ModeratorClassMaterialsPage />
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
            path: "classes",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminClasses />
              </ProtectedRoute>
            ),
          },
          // {
          //   path: "topics",
          //   element: (
          //     <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          //       <AdminTopics />
          //     </ProtectedRoute>
          //   ),
          // },
          {
            path: "materials",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminMaterials />
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
          {
            path: "ai-history",
            element: (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminAIHistory />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
