import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  Avatar,
} from "@mui/material";
import { Flag, PersonOff, Visibility } from "@mui/icons-material";
import { getDashboardSummary } from "../../services/moderatorService.ts";
import MaterialViewDialog from "../../components/MaterialViewDialog.tsx";

const ModeratorDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const sum = await getDashboardSummary();
      setSummary(sum);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Bảng điều khiển Moderator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý kiểm duyệt nội dung và người dùng
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={fetchStats}
          disabled={loading}
          sx={{
            borderRadius: "8px",
            bgcolor: "#667eea",
            "&:hover": { bgcolor: "#5a6fd6" },
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          LÀM MỚI
        </Button>
      </Stack>

      {/* System Overview Stats */}
      {summary && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 4, overflowX: "auto", pb: 1 }}
        >
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalStudents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Học sinh
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalTeachers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Giáo viên
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalClasses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lớp học
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalTopics}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chủ đề
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalMaterials}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tài liệu
            </Typography>
          </Paper>
        </Stack>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack
          spacing={3}
          direction={{ xs: "column", md: "row" }}
          flexWrap="wrap"
          sx={{ mb: 4 }}
        >
          <Box sx={{ flex: "1 1 200px", minWidth: 200 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
                borderTop: "4px solid",
                borderColor: "warning.main",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "warning.light",
                  color: "warning.dark",
                  mb: 2,
                  width: 56,
                  height: 56,
                }}
              >
                <Flag sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {summary?.pendingMaterials ?? 0}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="medium"
                mb={2}
              >
                Đang chờ kiểm duyệt
              </Typography>
              <Button
                component={Link}
                to="/moderator/flagged"
                size="small"
                variant="outlined"
                color="warning"
                sx={{ borderRadius: 2, textTransform: "none", mt: "auto" }}
              >
                Xem chi tiết
              </Button>
            </Paper>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: 200 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
                borderTop: "4px solid",
                borderColor: "error.main",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "error.light",
                  color: "error.dark",
                  mb: 2,
                  width: 56,
                  height: 56,
                }}
              >
                <PersonOff sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {summary?.bannedUsers ?? 0}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="medium"
                mb={2}
              >
                User bị đình chỉ
              </Typography>
              <Button
                component={Link}
                to="/moderator/user-suspension"
                size="small"
                variant="outlined"
                color="error"
                sx={{ borderRadius: 2, textTransform: "none", mt: "auto" }}
              >
                Quản lý user
              </Button>
            </Paper>
          </Box>
        </Stack>
      )}

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Báo cáo vi phạm gần đây
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : !summary?.violationReports?.length ? (
          <Typography variant="body2" color="text.secondary">
            Không có báo cáo vi phạm nào gần đây.
          </Typography>
        ) : (
          <List>
            {summary.violationReports.map((report: any, idx: number) => (
              <ListItem key={idx} sx={{ borderBottom: "1px solid #eee" }}>
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">
                      {report.comment || "Báo cáo nội dung vi phạm"}
                    </Typography>
                  }
                  secondary={`Gửi bởi: ${report.user_id?.username || "Ẩn danh"} - ${
                    report.date ? new Date(report.date).toLocaleString() : ""
                  }`}
                />
                {report.material_id && (
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => {
                      setSelectedMaterial(report.material_id);
                      setViewDialogOpen(true);
                    }}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Xem tài liệu
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {selectedMaterial && (
        <MaterialViewDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          material={selectedMaterial}
        />
      )}
    </Box>
  );
};

export default ModeratorDashboard;
