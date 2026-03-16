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
} from "@mui/material";
import { Assignment, Flag, Gavel, PersonOff } from "@mui/icons-material";
import {
  getModeratorSummary,
} from "../../services/moderatorApi";

const ModeratorDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getModeratorSummary()])
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
        <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: "auto", pb: 1 }}>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">{summary.totalStudents}</Typography>
            <Typography variant="body2" color="text.secondary">Học sinh</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">{summary.totalTeachers}</Typography>
            <Typography variant="body2" color="text.secondary">Giáo viên</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">{summary.totalClasses}</Typography>
            <Typography variant="body2" color="text.secondary">Lớp học</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">{summary.totalTopics}</Typography>
            <Typography variant="body2" color="text.secondary">Chủ đề</Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: "center", minWidth: 120 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">{summary.totalMaterials}</Typography>
            <Typography variant="body2" color="text.secondary">Tài liệu</Typography>
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
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#1976d2",
                color: "white",
              }}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>
                <Assignment />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {summary?.pendingMaterials ?? 0}
              </Typography>
              <Typography variant="body2">Tài liệu chờ duyệt</Typography>
              <Button
                component={Link}
                to="/moderator/pending"
                sx={{ mt: 1 }}
                variant="contained"
                color="secondary"
              >
                Xem chi tiết
              </Button>
            </Paper>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: 200 }}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#ed6c02",
                color: "white",
              }}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>
                <Flag />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {summary?.flaggedMaterials ?? 0}
              </Typography>
              <Typography variant="body2">Tài liệu bị flag</Typography>
              <Button
                component={Link}
                to="/moderator/flagged"
                sx={{ mt: 1 }}
                variant="contained"
                color="secondary"
              >
                Xem chi tiết
              </Button>
            </Paper>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: 200 }}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#d32f2f",
                color: "white",
              }}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>
                <PersonOff />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {summary?.bannedUsers ?? 0}
              </Typography>
              <Typography variant="body2">User bị đình chỉ</Typography>
              <Button
                component={Link}
                to="/moderator/user-suspension"
                sx={{ mt: 1 }}
                variant="contained"
                color="secondary"
              >
                Quản lý user
              </Button>
            </Paper>
          </Box>
          <Box sx={{ flex: "1 1 200px", minWidth: 200 }}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#2e7d32",
                color: "white",
              }}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>
                <Gavel />
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {summary?.reviewedToday ?? 0}
              </Typography>
              <Typography variant="body2">Duyệt hôm nay</Typography>
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
            Không có báo cáo nào gần đây.
          </Typography>
        ) : (
          <List>
            {summary.violationReports.map((report: any, idx: number) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={report.comment || "Báo cáo nội dung vi phạm"}
                  secondary={`Gửi bởi: ${report.user_id?.username || "Ẩn danh"} - ${
                    report.date ? new Date(report.date).toLocaleString() : ""
                  }`}
                />
                {report.material_id && (
                  <Button
                    size="small"
                    component={Link}
                    to={`/moderator/materials/${report.material_id._id}`}
                  >
                    Xem tài liệu
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ModeratorDashboard;
