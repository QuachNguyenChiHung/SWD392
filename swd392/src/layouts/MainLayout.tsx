import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  HomeRounded,
  Dashboard,
  School,
  Class,
  Person,
  Group,
  Quiz,
  Logout,
  Science,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const drawerWidth = 240;

import type { ReactElement } from 'react';

interface NavItem {
  text: string;
  icon: ReactElement;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    text: 'Trang chủ',
    icon: <HomeRounded />,
    path: '/',
    roles: [UserRole.GUEST, UserRole.STUDENT],
  },
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: [UserRole.GUEST, UserRole.STUDENT, UserRole.TEACHER, UserRole.MODERATOR, UserRole.ADMIN],
  },
  {
    text: 'Lớp học của tôi',
    icon: <Class />,
    path: '/student/classes',
    roles: [UserRole.STUDENT],
  },

  {
    text: 'Quản lý lớp học',
    icon: <School />,
    path: '/teacher/classes',
    roles: [UserRole.TEACHER],
  },
  {
    text: 'Xem hồ sơ',
    icon: <Person />,
    path: '/teacher/profile',
    roles: [UserRole.TEACHER],
  },
 {
    text: "Quản lý người dùng",
    icon: <Group />,
    path: "/moderator/user-suspension",
    roles: [UserRole.MODERATOR],
  },
  {
    text: "Tài liệu bị Flag",
    icon: <Quiz />,
    path: "/moderator/flagged",
    roles: [UserRole.MODERATOR],
  },
  {
    text: "Quản lý lớp học",
    icon: <School />,
    path: "/moderator/classes",
    roles: [UserRole.MODERATOR],
  },
  {
    text: "Quản lý khóa học",
    icon: <Science />,
    path: "/moderator/courses",
    roles: [UserRole.MODERATOR],
  },
  {
    text: 'Tài khoản (HS/GV)',
    icon: <Group />,
    path: '/admin/users',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Quản lý khóa học',
    icon: <School />,
    path: '/admin/courses',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Danh sách lớp học',
    icon: <Class />,
    path: '/admin/classes',
    roles: [UserRole.ADMIN],
  },
  // {
  //   text: 'Quản lý chủ đề',
  //   icon: <Class />,
  //   path: '/admin/topics',
  //   roles: [UserRole.ADMIN],
  // },
  {
    text: 'Quản lý lớp/Quiz',
    icon: <AdminPanelSettings />,
    path: '/admin/system',
    roles: [UserRole.ADMIN],
  },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    // Special handling for role-specific dashboard redirects
    if (path === '/dashboard') {
      if (user?.role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
      } else if (user?.role === UserRole.TEACHER) {
        navigate('/teacher/dashboard');
      } else if (user?.role === UserRole.STUDENT) {
        navigate('/student/dashboard');
      } else if (user?.role === UserRole.MODERATOR) {
        navigate('/moderator/dashboard');
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
    }
    setMobileOpen(false);
  };

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const roleLabel =
    user?.role === UserRole.TEACHER
      ? 'Giáo viên'
      : user?.role === UserRole.STUDENT
        ? 'Học sinh'
        : user?.role === UserRole.ADMIN
          ? 'Quản trị viên'
          : user?.role === UserRole.MODERATOR
            ? 'Kiểm duyệt viên'
            : 'Khách';

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #f7fcff 0%, #f1f8ff 100%)' }}>
      <Toolbar sx={{ minHeight: 72 }}>
        <Science sx={{ mr: 1, color: '#1b6cb5' }} />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: '#12344d' }}>
          Hóa học THPT
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#d5e3f8' }} />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#eaf3ff',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#35658a', minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: '#1c4b6e',
                  fontSize: '0.92rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(130deg, #0f4c81 0%, #1b6cb5 58%, #2d8bd4 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 10px 24px rgba(12, 56, 97, 0.24)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 700, letterSpacing: '-0.01em', fontFamily: '"Space Grotesk", "Nunito", sans-serif' }}
            >
              {roleLabel}
            </Typography>
            <Chip
              size="small"
              label="Không gian học tập"
              sx={{
                mt: 0.5,
                height: 22,
                color: '#175c45',
                bgcolor: '#d9f6e9',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          </Box>
          {(user?.role === UserRole.GUEST || user?.role === UserRole.STUDENT) && (
            <IconButton
              color="inherit"
              onClick={() => navigate('/')}
              aria-label="go home"
              sx={{ mr: 1 }}
            >
              <HomeRounded />
            </IconButton>
          )}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar alt={user?.name} src={user?.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Person sx={{ mr: 1 }} />
              {user?.name}
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background:
            'radial-gradient(circle at 0% 0%, #dff5f2 0%, transparent 36%), radial-gradient(circle at 100% 18%, #ffe9cd 0%, transparent 40%), linear-gradient(160deg, #f6fbff 0%, #eef6ff 48%, #fef8ef 100%)',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
