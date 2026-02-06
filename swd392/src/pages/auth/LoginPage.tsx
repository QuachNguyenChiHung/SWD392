import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(UserRole.STUDENT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock login với role được chọn (TẠM THỜI - CHỈ ĐỂ DEMO)
      const mockUser = {
        id: Date.now().toString(),
        email,
        name: 'Demo User',
        role: role as UserRole,
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      await login(email, password);
      
      // Điều hướng dựa trên role
      const roleRoutes: Record<string, string> = {
        [UserRole.STUDENT]: '/student/dashboard',
        [UserRole.TEACHER]: '/teacher/dashboard',
        [UserRole.MODERATOR]: '/moderator/dashboard',
        [UserRole.ADMIN]: '/admin/dashboard',
        [UserRole.GUEST]: '/dashboard',
      };
      navigate(roleRoutes[role] || '/dashboard');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Vai trò (TẠM THỜI - CHỈ ĐỂ DEMO)</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          value={role}
          label="Vai trò (TẠM THỜI - CHỈ ĐỂ DEMO)"
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value={UserRole.STUDENT}>Học sinh</MenuItem>
          <MenuItem value={UserRole.TEACHER}>Giáo viên</MenuItem>
          <MenuItem value={UserRole.MODERATOR}>Kiểm duyệt viên</MenuItem>
          <MenuItem value={UserRole.ADMIN}>Quản trị viên</MenuItem>
          <MenuItem value={UserRole.GUEST}>Khách</MenuItem>
        </Select>
      </FormControl>
      
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
