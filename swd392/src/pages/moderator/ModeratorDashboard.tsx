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
import StudentPageShell from "../../components/student/StudentPageShell";

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
    <StudentPageShell
      title="Dashboard kiểm duyệt"
      subtitle="Quản lý nội dung bị gắn cờ, báo cáo vi phạm và trạng thái người dùng"
      chipLabel="Khu vực kiểm duyệt"
      actions={(
        <Button
          variant="contained"
          onClick={fetchStats}
          disabled={loading}
          sx={{
            borderRadius: 2,
            bgcolor: "#1b6cb5",
            "&:hover": { bgcolor: "#155790" },
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Làm mới
        </Button>
      )}
    >

      {/* System Overview Stats */}
      {summary && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 4, overflowX: "auto", pb: 1 }}
        >
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120, borderRadius: 3, border: "1px solid #d6e7f4", boxShadow: "none" }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalStudents}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Học sinh
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120, borderRadius: 3, border: "1px solid #d6e7f4", boxShadow: "none" }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalTeachers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Giáo viên
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120, borderRadius: 3, border: "1px solid #d6e7f4", boxShadow: "none" }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalClasses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lớp học
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120, borderRadius: 3, border: "1px solid #d6e7f4", boxShadow: "none" }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {summary.totalTopics}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chủ đề
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120, borderRadius: 3, border: "1px solid #d6e7f4", boxShadow: "none" }}>
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
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff",
                borderRadius: 3,
                border: "1px solid #d6e7f4",
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
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff",
                borderRadius: 3,
                border: "1px solid #d6e7f4",
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

      <Paper sx={{ p: 3, mt: 2, borderRadius: 3, border: "1px solid #d6e7f4", boxShadow: "none" }}>
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
    </StudentPageShell>
  );
};

export default ModeratorDashboard;
