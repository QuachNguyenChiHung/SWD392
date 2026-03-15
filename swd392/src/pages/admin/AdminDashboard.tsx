import { Box, Typography, Chip, Button, Card, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Alert, CircularProgress } from '@mui/material';
import { People, School, SupervisorAccount, Person, Class as ClassIcon, Description, AdminPanelSettings } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { DashboardStats, AdminClassMaterial } from '../../types/adminType';
import { adminDashboardApi, adminMaterialsApi, adminUsersApi } from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

interface MaterialItem {
  _id: string;
  title: string;
  className: string;
  teacher: string;
  type: 'file' | 'slide' | '2d_render' | 'quiz';
  views: number;
  dateCreate: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [roleCounts, setRoleCounts] = useState<{ students: number; teachers: number; moderators: number } | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats from API
        const [statsData, userRoleCounts] = await Promise.all([
          adminDashboardApi.getDashboardStats(),
          adminUsersApi.getUserRoleCounts(),
        ]);

        setStats(statsData);
        setRoleCounts({
          students: userRoleCounts.students,
          teachers: userRoleCounts.teachers,
          moderators: userRoleCounts.moderators,
        });

        // Fetch recent materials from API
        const materialsData = await adminMaterialsApi.getAllClassMaterials(1);
        
        // Transform materials to MaterialItem format
        const transformedMaterials: MaterialItem[] = materialsData.slice(0, 4).map((material: AdminClassMaterial) => ({
          _id: material._id,
          title: material.title,
          className: 'Class Name', // TODO: Fetch class name from class_assign_id
          teacher: 'Teacher Name', // TODO: Fetch teacher name
          type: material.type,
          views: 0, // API doesn't provide views, use 0 as placeholder
          dateCreate: material.dateCreate
        }));
        
        setRecentMaterials(transformedMaterials);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Failed to load dashboard data'}
        </Alert>
      </Box>
    );
  }

  const statCards = [
    { 
      label: 'Tổng người dùng', 
      value: stats.totalUsers || 0, 
      icon: <People />, 
      color: '#1976d2',
      onClick: () => navigate('/admin/users')
    },
    { 
      label: 'Tổng học sinh', 
      value: roleCounts?.students ?? stats.activeStudents ?? 0,
      icon: <Person />, 
      color: '#0288d1'
    },
    { 
      label: 'Tổng giáo viên', 
      value: roleCounts?.teachers ?? stats.activeTeachers ?? 0,
      icon: <SupervisorAccount />, 
      color: '#2e7d32'
    },
    {
      label: 'Tổng moderator',
      value: roleCounts?.moderators ?? 0,
      icon: <AdminPanelSettings />,
      color: '#6a1b9a'
    },
    { 
      label: 'Tổng lớp học', 
      value: stats.totalClasses || 0, 
      icon: <School />, 
      color: '#ed6c02'
    },
  ];

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'file': return 'error';
      case 'slide': return 'success';
      case '2d_render': return 'info';
      case 'quiz': return 'warning';
      default: return 'default';
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'file': return 'File';
      case 'slide': return 'Slide';
      case '2d_render': return '2D Render';
      case 'quiz': return 'Quiz';
      default: return type;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard Quản trị
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tổng quan hệ thống và hoạt động gần đây
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3, mb: 4 }}>
        {statCards.map((stat, index) => (
          <Card
            key={index}
            sx={{
              cursor: stat.onClick ? 'pointer' : 'default',
              transition: 'all 0.3s',
              '&:hover': stat.onClick ? {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              } : {},
            }}
            onClick={stat.onClick}
          >
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: stat.color,
                  color: 'white',
                  display: 'flex',
                  width: 'fit-content'
                }}>
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {stat.value.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr' }, gap: 3 }}>
        
        {/* Recent Classes - Hidden for now (no API endpoint available) */}
        {/* <Card>...</Card> */}

        {/* Recent Materials */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Bài giảng gần đây
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/admin/materials')}>
                Xem tất cả
              </Button>
            </Box>
            {recentMaterials.length > 0 ? (
              <List>
                {recentMaterials.map((material, index) => (
                  <Box key={material._id}>
                    <ListItem
                      sx={{
                        px: 2,
                        py: 2,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getMaterialTypeColor(material.type) + '.main' }}>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {material.title}
                          </Typography>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Lớp: {material.className}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Giáo viên: {material.teacher}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Chip 
                                label={getMaterialTypeLabel(material.type)} 
                                size="small" 
                                color={getMaterialTypeColor(material.type) as any}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(material.dateCreate).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {index < recentMaterials.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Chưa có bài giảng nào
              </Typography>
            )}
          </CardContent>
        </Card>

      </Box>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Quản lý nhanh
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<People />}
              onClick={() => navigate('/admin/users')}
              sx={{ py: 1.5 }}
            >
              Quản lý người dùng
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<School />}
              onClick={() => navigate('/admin/courses')}
              sx={{ py: 1.5 }}
            >
              Quản lý khóa học
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<ClassIcon />}
              onClick={() => navigate('/admin/system')}
              sx={{ py: 1.5 }}
            >
              Lớp học và Quiz
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
