import { Box, Typography, Paper, Tabs, Tab, Button } from '@mui/material';
import { useState } from 'react';
import { Add } from '@mui/icons-material';

const AdminUsers = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý người dùng
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Thêm người dùng
        </Button>
      </Box>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Tất cả" />
          <Tab label="Giáo viên" />
          <Tab label="Học sinh" />
          <Tab label="Kiểm duyệt viên" />
          <Tab label="Yêu cầu chờ duyệt" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Danh sách người dùng sẽ hiển thị ở đây
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminUsers;
