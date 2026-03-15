import { Box, Typography, Chip, Button, Card, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Alert, CircularProgress, Stack } from '@mui/material';
import { People, School, SupervisorAccount, Person, Class as ClassIcon, Description, AdminPanelSettings, Timeline, BarChart, AutoGraph, Topic } from '@mui/icons-material';
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
  const [materialTypeStats, setMaterialTypeStats] = useState<Array<{ type: string; count: number }>>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
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

        const typeSummary = materialsData.reduce<Record<string, number>>((acc, material) => {
          acc[material.type] = (acc[material.type] || 0) + 1;
          return acc;
        }, {});

        setMaterialTypeStats(
          Object.entries(typeSummary)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
        );
        setRecentMaterials(transformedMaterials);
        setLastUpdated(new Date().toLocaleString('vi-VN'));

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
    {
      label: 'Tổng khóa học',
      value: stats.totalCourses || 0,
      icon: <Topic />,
      color: '#5d4037',
      onClick: () => navigate('/admin/courses')
    },
  ];

  const totalRoleUsers = (roleCounts?.students || 0) + (roleCounts?.teachers || 0) + (roleCounts?.moderators || 0);
  const roleDistribution = [
    { label: 'Học sinh', value: roleCounts?.students || 0, color: '#0288d1' },
    { label: 'Giáo viên', value: roleCounts?.teachers || 0, color: '#2e7d32' },
    { label: 'Moderator', value: roleCounts?.moderators || 0, color: '#6a1b9a' },
  ];

  const operationMetrics = [
    { label: 'Users / Class', value: stats.totalClasses ? (stats.totalUsers / stats.totalClasses).toFixed(1) : '0.0', hint: 'Mật độ người dùng theo lớp' },
    { label: 'Enrollments / User', value: stats.totalUsers ? (stats.totalEnrollments / stats.totalUsers).toFixed(1) : '0.0', hint: 'Mức tham gia trung bình' },
    { label: 'Materials (trang hiện tại)', value: String(recentMaterials.length), hint: 'Số tài liệu gần đây đang hiển thị' },
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
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(120deg, #0f4c81 0%, #1565c0 52%, #1e88e5 100%)',
          color: 'white',
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard Quản trị
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92 }}>
          Tổng quan hệ thống và hoạt động theo vai trò admin
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85, mt: 1, display: 'block' }}>
          Cập nhật lần cuối: {lastUpdated || '-'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 2, mb: 3 }}>
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
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ 
                  p: 1.2,
                  borderRadius: 2, 
                  backgroundColor: stat.color,
                  color: 'white',
                  display: 'flex',
                  width: 'fit-content'
                }}>
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {stat.value.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Analytics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <BarChart color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Phân bố người dùng theo vai trò
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {roleDistribution.map((item) => {
                const percent = totalRoleUsers > 0 ? Math.round((item.value / totalRoleUsers) * 100) : 0;
                return (
                  <Box key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
                      <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.value} ({percent}%)</Typography>
                    </Box>
                    <Box sx={{ height: 10, borderRadius: 10, backgroundColor: 'grey.200', overflow: 'hidden' }}>
                      <Box sx={{ width: `${percent}%`, height: '100%', backgroundColor: item.color, transition: 'width 0.3s ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoGraph color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Chỉ số vận hành
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              {operationMetrics.map((metric) => (
                <Box key={metric.label} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'grey.100' }}>
                  <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                  <Typography variant="h5" fontWeight="bold">{metric.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{metric.hint}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ gridColumn: { xs: 'span 1', lg: 'span 1' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Timeline color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Cơ cấu loại học liệu
              </Typography>
            </Box>
            {materialTypeStats.length > 0 ? (
              <Stack spacing={1.2}>
                {materialTypeStats.map((item) => {
                  const total = materialTypeStats.reduce((sum, current) => sum + current.count, 0);
                  const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <Box key={item.type} sx={{ p: 1.2, borderRadius: 2, backgroundColor: 'grey.100' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
                        <Typography variant="body2" fontWeight={600}>{getMaterialTypeLabel(item.type)}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.count}</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 8, backgroundColor: 'grey.300', overflow: 'hidden' }}>
                        <Box sx={{ width: `${percent}%`, height: '100%', backgroundColor: '#1976d2' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">Chưa có dữ liệu học liệu để phân tích.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Recent Materials */}
        <Card sx={{ gridColumn: { xs: 'span 1', lg: 'span 1' } }}>
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
              startIcon={<Topic />}
              onClick={() => navigate('/admin/topics')}
              sx={{ py: 1.5 }}
            >
              Quản lý chủ đề
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Description />}
              onClick={() => navigate('/admin/materials')}
              sx={{ py: 1.5 }}
            >
              Duyệt học liệu
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
