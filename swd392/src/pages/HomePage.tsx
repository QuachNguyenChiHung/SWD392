import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AutoAwesome,
  Biotech,
  Logout,
  ManageAccounts,
  ModelTraining,
  Person,
  Science,
  School,
  Security,
  Timeline,
  TouchApp,
} from '@mui/icons-material';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
}

const coreFeatures: FeatureItem[] = [
  {
    icon: <ManageAccounts sx={{ fontSize: 34 }} />,
    title: 'Quản lý tài khoản và phân quyền',
    description:
      'Đăng ký, xác thực và kiểm soát quyền truy cập theo vai trò Học sinh, Giáo viên, Kiểm duyệt viên, Quản trị viên.',
  },
  {
    icon: <School sx={{ fontSize: 34 }} />,
    title: 'LMS bám sát chương trình THPT',
    description:
      'Tổ chức lớp học, đăng ký bằng mã lớp và quản lý học liệu theo đúng cấu trúc môn Hóa học đến lớp 12.',
  },
  {
    icon: <AutoAwesome sx={{ fontSize: 34 }} />,
    title: 'AI tạo học liệu có kiểm soát',
    description:
      'AI hỗ trợ tạo quiz, slide, hoạt động thực hành từ gợi ý giáo viên. Mọi nội dung cần giáo viên duyệt trước khi dùng.',
  },
  {
    icon: <Biotech sx={{ fontSize: 34 }} />,
    title: 'Trực quan hóa 2D cho khái niệm khó',
    description:
      'Mô phỏng và bài tập tương tác giúp học sinh dễ hình dung các chủ đề trừu tượng trong Hóa học.',
  },
  {
    icon: <Timeline sx={{ fontSize: 34 }} />,
    title: 'Theo dõi tiến độ học tập',
    description:
      'Theo dõi tự động tiến độ, kết quả bài tập và phản hồi hai chiều giữa giáo viên và học sinh.',
  },
  {
    icon: <Security sx={{ fontSize: 34 }} />,
    title: 'Kiểm duyệt và quản trị hệ thống',
    description:
      'Kiểm duyệt nội dung người dùng/AI, xử lý vi phạm và quản trị dữ liệu hệ thống ở cấp độ toàn cục.',
  },
];

const getDashboardPathByRole = (role: UserRole | undefined): string => {
  switch (role) {
    case UserRole.STUDENT:
      return '/student/dashboard';
    case UserRole.TEACHER:
      return '/teacher/dashboard';
    case UserRole.MODERATOR:
      return '/moderator/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/auth/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 11, md: 13 },
        pb: { xs: 7, md: 10 },
        background:
          'radial-gradient(circle at 0% 0%, #dff5f2 0%, transparent 40%), radial-gradient(circle at 100% 20%, #ffe9cd 0%, transparent 42%), linear-gradient(160deg, #f6fbff 0%, #eef6ff 48%, #fef8ef 100%)',
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'linear-gradient(130deg, #0f4c81 0%, #1b6cb5 58%, #2d8bd4 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 10px 24px rgba(12, 56, 97, 0.24)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            {/* Logo */}
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.85 }, transition: 'opacity 0.2s' }}
              onClick={() => navigate('/')}
            >
              <Science sx={{ color: '#fff', fontSize: 26 }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  fontFamily: '"Space Grotesk", sans-serif',
                  letterSpacing: '-0.01em',
                  color: '#fff',
                }}
              >
                Hóa học THPT
              </Typography>
            </Stack>

            {/* Right side actions */}
            <Stack direction="row" spacing={1.2} sx={{ ml: 'auto' }} alignItems="center">
              {!isAuthenticated ? (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate('/auth/login')}
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.25)',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 2.2,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.6)',
                        bgcolor: 'rgba(255,255,255,0.06)',
                      },
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate('/auth/register')}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2.5,
                      borderRadius: 2,
                      background: '#fff',
                      color: '#1b6cb5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        background: '#f0f7ff',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    Đăng ký
                  </Button>
                </>
              ) : (
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(getDashboardPathByRole(user?.role))}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 2.5,
                      borderRadius: 2,
                      background: '#fff',
                      color: '#1b6cb5',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        background: '#f0f7ff',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    Vào dashboard
                  </Button>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      p: 0.3,
                      border: '2px solid rgba(255,255,255,0.15)',
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.4)' },
                    }}
                  >
                    <Avatar
                      alt={user?.name}
                      src={user?.avatar}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        bgcolor: '#6366f1',
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 1,
                          borderRadius: 2.5,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                          minWidth: 200,
                        },
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: '1 !important' }}>
                      <Person sx={{ mr: 1, color: '#6366f1' }} />
                      <Typography fontWeight={700} fontSize="0.9rem">{user?.name}</Typography>
                    </MenuItem>
                    <MenuItem disabled sx={{ opacity: '0.7 !important', py: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 4.5 }}>
                        {user?.email}
                      </Typography>
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        color: '#dc2626',
                        '&:hover': { bgcolor: '#fef2f2' },
                        borderRadius: 1,
                        mx: 0.5,
                      }}
                    >
                      <Logout sx={{ mr: 1, fontSize: 18 }} />
                      <Typography fontSize="0.85rem" fontWeight={600}>Đăng xuất</Typography>
                    </MenuItem>
                  </Menu>
                </Stack>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            border: '1px solid #d5e3f8',
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(244,249,255,0.96))',
            boxShadow: '0 22px 48px rgba(14, 65, 119, 0.12)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -35,
              right: -35,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(65, 186, 170, 0.16)',
              filter: 'blur(2px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 120,
              height: 120,
              borderRadius: 4,
              transform: 'rotate(22deg)',
              background: 'rgba(255, 173, 82, 0.18)',
            }}
          />

          <Stack spacing={2} sx={{ position: 'relative' }}>
            <Chip
              icon={<ModelTraining />}
              label="Nền tảng LMS + AI cho giảng dạy Hóa học THPT"
              sx={{
                alignSelf: 'flex-start',
                fontWeight: 700,
                bgcolor: '#d9f6e9',
                color: '#175c45',
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Space Grotesk", "Nunito", sans-serif',
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                fontSize: { xs: '2rem', md: '3rem' },
                maxWidth: 900,
                color: '#12344d',
              }}
            >
              Ứng dụng web giảng dạy Hóa học bậc Trung học
            </Typography>

            <Typography
              sx={{
                maxWidth: 900,
                color: '#2f5169',
                fontSize: { xs: '1rem', md: '1.08rem' },
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              Hệ thống được thiết kế để thay thế cách học thiên về chấm điểm bằng trải nghiệm học tập có tương tác,
              trực quan và cá nhân hóa. Giáo viên chủ động kiểm soát AI, học sinh nhận hỗ trợ giải thích khái niệm có
              nguồn trích dẫn, và toàn bộ quá trình học tập được theo dõi liên tục.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
              {!isAuthenticated && (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/auth/login')}
                    sx={{ px: 3, py: 1.2 }}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/auth/register')}
                    sx={{ px: 3, py: 1.2 }}
                  >
                    Tạo tài khoản
                  </Button>
                </>
              )}

              <Button
                variant={isAuthenticated ? 'contained' : 'outlined'}
                endIcon={<TouchApp />}
                onClick={() => navigate(getDashboardPathByRole(user?.role))}
                sx={{ px: 2.2, py: 1.2, fontWeight: 700 }}
              >
                {isAuthenticated ? 'Vào khu vực của tôi' : 'Khám phá bản dùng thử'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid id="problem-solution" container spacing={2.2} sx={{ mt: 2.8 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.6,
                borderRadius: 4,
                border: '1px solid #cfe0ea',
                backgroundColor: '#f3fbff',
                height: '100%',
              }}
            >
              <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: '#0f4d73' }}>
                Vấn đề
              </Typography>
              <Typography sx={{ mt: 1, color: '#2f5169', fontFamily: '"Nunito", sans-serif' }}>
                Nhiều hệ thống học tập hiện tại chú trọng chấm điểm hơn tương tác, làm giảm động lực và khả năng ghi
                nhớ lâu dài. Đặc biệt, Hóa học chứa nhiều khái niệm trừu tượng khiến học sinh khó tiếp cận.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.6,
                borderRadius: 4,
                border: '1px solid #dce8f4',
                background:
                  'linear-gradient(120deg, rgba(255,255,255,0.96) 0%, rgba(236,247,255,0.96) 45%, rgba(240,255,246,0.96) 100%)',
                height: '100%',
              }}
            >
              <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: '#0c5c61' }}>
                Giải pháp
              </Typography>
              <Typography sx={{ mt: 1, color: '#2c5267', fontFamily: '"Nunito", sans-serif' }}>
                Kết hợp mô hình LMS bám chương trình THPT với AI tạo nội dung do giáo viên kiểm soát, cùng hoạt động
                trực quan 2D để tăng mức độ hiểu sâu. Nền tảng ưu tiên tính tương tác, phản hồi và theo dõi tiến độ để
                cải thiện chất lượng học tập thực tế.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box id="features" sx={{ mt: 4.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: '#12344d',
              mb: 2,
            }}
          >
            Tính năng nổi bật
          </Typography>
          <Grid container spacing={2}>
            {coreFeatures.map((feature) => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.4,
                    borderRadius: 3,
                    height: '100%',
                    border: '1px solid #d6e7f4',
                    backgroundColor: '#ffffff',
                    transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 14px 28px rgba(20, 64, 106, 0.15)',
                      borderColor: '#9fc4e5',
                    },
                  }}
                >
                  <Box sx={{ color: '#1b6cb5', mb: 1 }}>{feature.icon}</Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Space Grotesk", sans-serif',
                      color: '#12344d',
                      mb: 0.8,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: '#31536b', fontFamily: '"Nunito", sans-serif' }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
