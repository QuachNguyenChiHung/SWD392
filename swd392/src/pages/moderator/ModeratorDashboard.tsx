import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { useState } from 'react';

const ModeratorDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Kiểm duyệt
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Xem xét và kiểm duyệt nội dung
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Nội dung chờ duyệt" />
          <Tab label="Báo cáo vi phạm" />
          <Tab label="Tài khoản bị đình chỉ" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Không có mục nào cần xem xét
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ModeratorDashboard;
