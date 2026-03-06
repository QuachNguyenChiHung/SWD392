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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Class,
  Quiz,
  Person,
  Group,
  Settings,
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
    text: 'Bài kiểm tra',
    icon: <Quiz />,
    path: '/student/quizzes',
    roles: [UserRole.STUDENT],
  },
  {
    text: 'Quản lý lớp học',
    icon: <School />,
    path: '/teacher/classes',
    roles: [UserRole.TEACHER],
  },
  {
    text: 'Kiểm duyệt',
    icon: <Settings />,
    path: '/moderator/dashboard',
    roles: [UserRole.MODERATOR],
  },
  {
    text: 'Quản lý người dùng',
    icon: <Group />,
    path: '/admin/users',
    roles: [UserRole.ADMIN],
  },
  {
    text: 'Quản lý hệ thống',
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

  const drawer = (
    <Box>
      <Toolbar>
        <Science sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          Hóa học THPT
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role === UserRole.TEACHER && 'Giáo viên'}
            {user?.role === UserRole.STUDENT && 'Học sinh'}
            {user?.role === UserRole.ADMIN && 'Quản trị viên'}
            {user?.role === UserRole.MODERATOR && 'Kiểm duyệt viên'}
            {user?.role === UserRole.GUEST && 'Khách'}
          </Typography>
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
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
