import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
} from "@mui/material";
import moderationService from "../../services/moderation";

type Metrics = {
  totalUsers: number;
  activeUsersToday: number;
  totalClasses: number;
  contentsReviewed: number;
  reviewRate: number; // 0-100
};

const initialMetrics: Metrics = {
  totalUsers: 0,
  activeUsersToday: 0,
  totalClasses: 0,
  contentsReviewed: 0,
  reviewRate: 0,
};

const ModeratorStatistics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [recentActivity, setRecentActivity] = useState<Array<any>>([]);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching metrics from an API
  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        const m = await moderationService.getMetrics();
        const recent = await moderationService.getRecentActivity();

        if (!mounted) return;

        setMetrics({
          totalUsers: m?.totalUsers ?? initialMetrics.totalUsers,
          activeUsersToday:
            m?.activeUsersToday ?? initialMetrics.activeUsersToday,
          totalClasses: m?.totalClasses ?? initialMetrics.totalClasses,
          contentsReviewed:
            m?.contentsReviewed ?? initialMetrics.contentsReviewed,
          reviewRate: m?.reviewRate ?? initialMetrics.reviewRate,
        });

        setRecentActivity(
          Array.isArray(recent) ? recent : (recent?.items ?? []),
        );
      } catch (err: any) {
        console.warn(
          "Failed to fetch metrics/recent activity, using fallback mock.",
          err,
        );
        if (!mounted) return;
        setMetrics({
          totalUsers: 12458,
          activeUsersToday: 872,
          totalClasses: 342,
          contentsReviewed: 1234,
          reviewRate: 78,
        });

        setRecentActivity([
          {
            id: 1,
            user: "nguyen.a",
            action: "Submitted assignment",
            time: "2h",
          },
          { id: 2, user: "tran.b", action: "Flagged content", time: "3h" },
          { id: 3, user: "le.c", action: "Account suspended", time: "5h" },
        ]);

        setError(err?.message ?? "Lỗi khi tải dữ liệu thống kê");
      }
    };

    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Thống kê hệ thống
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Box sx={{ flex: "1 1 220px", minWidth: 220 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Tổng số người dùng
            </Typography>
            <Typography variant="h6">
              {metrics.totalUsers.toLocaleString()}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: "1 1 220px", minWidth: 220 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Người dùng hoạt động (hôm nay)
            </Typography>
            <Typography variant="h6">
              {metrics.activeUsersToday.toLocaleString()}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={
                (metrics.activeUsersToday / Math.max(metrics.totalUsers, 1)) *
                100
              }
              sx={{ mt: 1 }}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: "1 1 220px", minWidth: 220 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Lớp học
            </Typography>
            <Typography variant="h6">{metrics.totalClasses}</Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: "1 1 220px", minWidth: 220 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Nội dung đã duyệt
            </Typography>
            <Typography variant="h6">{metrics.contentsReviewed}</Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Tỷ lệ duyệt: {metrics.reviewRate}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.reviewRate}
              sx={{ mt: 1 }}
            />
          </Paper>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Hoạt động gần đây
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Hành động</TableCell>
              <TableCell>Thời gian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentActivity.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.user}</TableCell>
                <TableCell>{r.action}</TableCell>
                <TableCell>{r.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="warning" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorStatistics;
