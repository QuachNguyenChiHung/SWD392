import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPaths: Record<UserRole, string> = {
      [UserRole.GUEST]: '/dashboard',
      [UserRole.STUDENT]: '/student/dashboard',
      [UserRole.TEACHER]: '/teacher/dashboard',
      [UserRole.MODERATOR]: '/moderator/dashboard',
      [UserRole.ADMIN]: '/admin/dashboard',
    };
    return <Navigate to={redirectPaths[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
