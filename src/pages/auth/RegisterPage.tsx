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

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (password.length < 10) {
      setError('Mật khẩu phải có ít nhất 10 ký tự');
      return;
    }

    // Check for uppercase letter, number, and special character
    if (!/(?=.*[A-Z])/.test(password)) {
      setError('Mật khẩu phải có ít nhất một chữ hoa');
      return;
    }

    if (!/(?=.*\d)/.test(password)) {
      setError('Mật khẩu phải có ít nhất một số');
      return;
    }

    if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
      setError('Mật khẩu phải có ít nhất một ký tự đặc biệt');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);

      // Redirect to login page after successful registration
      navigate('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%' }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Đăng ký tài khoản
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Tạo tài khoản để tham gia lớp học và bài tập tương tác.
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
        id="name"
        label="Họ và tên"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 2.5, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>
      <Box textAlign="center">
        <Link component={RouterLink} to="/auth/login" variant="body2">
          Đã có tài khoản? Đăng nhập
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterPage;
