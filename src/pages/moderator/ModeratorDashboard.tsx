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
import { Flag, Gavel, PersonOff, Visibility } from "@mui/icons-material";
import { getDashboardSummary } from "../../services/moderatorService";
import MaterialViewDialog from "../../components/MaterialViewDialog";

const ModeratorDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getDashboardSummary()])
      .then(([sum]) => {
        if (!mounted) return;
        setSummary(sum);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bảng điều khiển Moderator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý kiểm duyệt nội dung và người dùng
      </Typography>

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
              <Avatar sx={{ bgcolor: "warning.light", color: "warning.dark", mb: 2, width: 56, height: 56 }}>
                <Flag sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {summary?.flaggedMaterials ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={2}>
                Tài liệu bị flag
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
              <Avatar sx={{ bgcolor: "error.light", color: "error.dark", mb: 2, width: 56, height: 56 }}>
                <PersonOff sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {summary?.bannedUsers ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={2}>
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
                borderColor: "success.main",
              }}
            >
              <Avatar sx={{ bgcolor: "success.light", color: "success.dark", mb: 2, width: 56, height: 56 }}>
                <Gavel sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {summary?.reviewedToday ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="medium" mb={2}>
                Duyệt hôm nay
              </Typography>
              <Button
                disabled
                size="small"
                variant="text"
                sx={{ borderRadius: 2, textTransform: "none", mt: "auto", opacity: 0 }}
              >
                Spacer
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
                  primary={<Typography fontWeight="medium">{report.comment || "Báo cáo nội dung vi phạm"}</Typography>}
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
