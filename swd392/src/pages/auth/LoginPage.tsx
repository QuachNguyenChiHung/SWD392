import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Get the logged in user's role from the response
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Navigate based on user role determined by backend
      const roleRoutes: Record<string, string> = {
        [UserRole.STUDENT]: '/student/dashboard',
        [UserRole.TEACHER]: '/teacher/dashboard',
        [UserRole.MODERATOR]: '/moderator/dashboard',
        [UserRole.ADMIN]: '/admin/dashboard',
        [UserRole.GUEST]: '/dashboard',
      };

      navigate(roleRoutes[user.role] || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', mt: 1 }}
    >
      <Typography variant="h5" component="h2" gutterBottom textAlign="center">
        Đăng nhập
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mật khẩu"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
      <Box textAlign="center">
        <Link component={RouterLink} to="/auth/register" variant="body2">
          Chưa có tài khoản? Đăng ký ngay
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
