import { Box, Typography, Chip, Button, Card, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import { People, School, Assignment, SupervisorAccount, Person, Class as ClassIcon, Description, Visibility } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { SystemStats } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ClassItem {
  id: string;
  name: string;
  teacher: string;
  students: number;
  materials: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

interface MaterialItem {
  id: string;
  title: string;
  className: string;
  teacher: string;
  type: 'pdf' | 'video' | 'document';
  views: number;
  createdAt: Date;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalClasses: 0,
    totalMaterials: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalModerators: 0,
    activeClasses: 0,
  });

  const [recentClasses, setRecentClasses] = useState<ClassItem[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<MaterialItem[]>([]);

  useEffect(() => {
    // TODO: Fetch real data from API
    setStats({
      totalUsers: 1234,
      totalClasses: 156,
      totalMaterials: 892,
      totalStudents: 987,
      totalTeachers: 234,
      totalModerators: 13,
      activeClasses: 142,
    });

    setRecentClasses([
      {
        id: '1',
        name: 'Hóa học hữu cơ nâng cao',
        teacher: 'Nguyễn Văn A',
        students: 45,
        materials: 12,
        status: 'active',
        createdAt: new Date('2025-03-01'),
      },
      {
        id: '2',
        name: 'Hóa học vô cơ cơ bản',
        teacher: 'Trần Thị B',
        students: 38,
        materials: 8,
        status: 'active',
        createdAt: new Date('2025-02-28'),
      },
      {
        id: '3',
        name: 'Hóa phân tích',
        teacher: 'Lê Văn C',
        students: 52,
        materials: 15,
        status: 'active',
        createdAt: new Date('2025-02-25'),
      },
      {
        id: '4',
        name: 'Hóa lý thuyết',
        teacher: 'Phạm Thị D',
        students: 30,
        materials: 10,
        status: 'inactive',
        createdAt: new Date('2025-02-20'),
      },
    ]);

    setRecentMaterials([
      {
        id: '1',
        title: 'Bài giảng: Liên kết hóa học',
        className: 'Hóa học hữu cơ nâng cao',
        teacher: 'Nguyễn Văn A',
        type: 'pdf',
        views: 245,
        createdAt: new Date('2025-03-05'),
      },
      {
        id: '2',
        title: 'Video: Cân bằng phương trình',
        className: 'Hóa học vô cơ cơ bản',
        teacher: 'Trần Thị B',
        type: 'video',
        views: 189,
        createdAt: new Date('2025-03-04'),
      },
      {
        id: '3',
        title: 'Tài liệu: Bảng tuần hoàn',
        className: 'Hóa học vô cơ cơ bản',
        teacher: 'Trần Thị B',
        type: 'document',
        views: 321,
        createdAt: new Date('2025-03-03'),
      },
      {
        id: '4',
        title: 'Bài tập: Phản ứng oxi hóa khử',
        className: 'Hóa phân tích',
        teacher: 'Lê Văn C',
        type: 'pdf',
        views: 156,
        createdAt: new Date('2025-03-02'),
      },
    ]);
  }, []);

  const statCards = [
    { 
      label: 'Tổng người dùng', 
      value: stats.totalUsers, 
      icon: <People />, 
      color: '#1976d2',
      onClick: () => navigate('/admin/users')
    },
    { 
      label: 'Học sinh', 
      value: stats.totalStudents, 
      icon: <Person />, 
      color: '#0288d1'
    },
    { 
      label: 'Giáo viên', 
      value: stats.totalTeachers, 
      icon: <SupervisorAccount />, 
      color: '#2e7d32'
    },
    { 
      label: 'Lớp đang hoạt động', 
      value: stats.activeClasses, 
      icon: <School />, 
      color: '#ed6c02'
    },
  ];

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'error';
      case 'video': return 'success';
      case 'document': return 'info';
      default: return 'default';
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'video': return 'Video';
      case 'document': return 'Tài liệu';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        
        {/* Recent Classes */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClassIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Lớp học gần đây
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/admin/classes')}>
                Xem tất cả
              </Button>
            </Box>
            <List>
              {recentClasses.map((classItem, index) => (
                <Box key={classItem.id}>
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
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ClassIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {classItem.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Giáo viên: {classItem.teacher}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip 
                              label={`${classItem.students} học sinh`} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${classItem.materials} bài giảng`} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={getStatusLabel(classItem.status)} 
                              size="small" 
                              color={getStatusColor(classItem.status) as any}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentClasses.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

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
            <List>
              {recentMaterials.map((material, index) => (
                <Box key={material.id}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {material.views} lượt xem
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentMaterials.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

      </Box>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Quản lý nhanh
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
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
              onClick={() => navigate('/admin/classes')}
              sx={{ py: 1.5 }}
            >
              Quản lý lớp học
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<Assignment />}
              onClick={() => navigate('/admin/system')}
              sx={{ py: 1.5 }}
            >
              Quản lý hệ thống
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
