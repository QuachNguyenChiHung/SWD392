import { Box, Typography, Paper, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import ModeratorContentReview from "./ModeratorContentReview.tsx";
import ModeratorUserSuspension from "./ModeratorUserSuspension.tsx";
import ModeratorStatistics from "./ModeratorStatistics.tsx";
import ModeratorMaterialReview from "./ModeratorMaterialReview";

const ModeratorDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Moderator Dashboard
      </Typography>

      {/* Lưu ý: phần dưới chỉ liên quan tới vai trò moderator.
          1) Xem xét nội dung: cho phép duyệt, từ chối nội dung do user/AI tạo.
          2) Đình chỉ người dùng: tạm khóa/treo tài khoản vi phạm với lý do.
          Không thay đổi chức năng ngoài moderator. */}

      <Typography variant="body1" color="text.secondary" paragraph>
        Dùng các tab bên dưới để thực hiện hai nhiệm vụ moderator: xem xét nội
        dung và đình chỉ người dùng.
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Nội dung chờ duyệt" />
          <Tab label="Báo cáo vi phạm" />
          <Tab label="Tài liệu lớp (Materials)" />
          <Tab label="Tài khoản bị đình chỉ" />
          <Tab label="Thống kê" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <ModeratorContentReview />}
          {tabValue === 1 && <ModeratorContentReview showOnlyFlagged />}
          {tabValue === 2 && <ModeratorMaterialReview />}
          {tabValue === 3 && <ModeratorUserSuspension />}
          {tabValue === 4 && <ModeratorStatistics />}
        </Box>
      </Paper>
    </Box>
  );
};

export default ModeratorDashboard;
