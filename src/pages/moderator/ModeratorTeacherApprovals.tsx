import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { apiService } from "../../services/api";

type TeacherRequestItem = {
  _id: string;
  user_id: {
    _id: string;
    username: string;
    email: string;
  };
  cv_url?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const ModeratorTeacherApprovals: React.FC = () => {
  const [requests, setRequests] = useState<TeacherRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/admin/teacher-requests?status=${filterStatus}`);
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Lỗi tải dữ liệu.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filterStatus]);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Xác nhận duyệt giáo viên này?")) return;
    try {
      await apiService.patch(`/admin/teacher-requests/${id}`, { action: "approve" });
      setSnack({ open: true, message: "Đã duyệt thành công.", severity: "success" });
      fetchData();
    } catch (err: any) {
      setSnack({ open: true, message: err?.response?.data?.error || "Lỗi khi duyệt", severity: "error" });
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      setSnack({ open: true, message: "Vui lòng nhập lý do từ chối", severity: "warning" });
      return;
    }
    try {
      await apiService.patch(`/admin/teacher-requests/${rejectDialog.id}`, {
        action: "reject",
        reason: rejectReason,
      });
      setSnack({ open: true, message: "Đã từ chối thành công.", severity: "success" });
      setRejectDialog({ open: false, id: "" });
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      setSnack({ open: true, message: err?.response?.data?.error || "Lỗi khi từ chối", severity: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Duyệt yêu cầu giáo viên
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: 8, borderRadius: 4 }}>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Đã từ chối</option>
          <option value="all">Tất cả</option>
        </select>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Typography color="text.secondary">Không có yêu cầu nào.</Typography>
      ) : (
        <Stack spacing={2}>
          {requests.map((req) => (
            <Card key={req._id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {req.user_id?.username?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{req.user_id?.username || "Không rõ"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {req.user_id?.email || "Không rõ"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ngày gửi: {new Date(req.created_at).toLocaleString()}
                    </Typography>
                    {req.cv_url && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <a href={req.cv_url} target="_blank" rel="noreferrer">Xem CV</a>
                      </Typography>
                    )}
                    <Chip
                      label={req.status === "pending" ? "Chờ duyệt" : req.status === "approved" ? "Đã duyệt" : "Đã từ chối"}
                      color={req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "error"}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  {req.status === "pending" && (
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="success" onClick={() => handleApprove(req._id)}>
                        Duyệt
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => setRejectDialog({ open: true, id: req._id })}>
                        Từ chối
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: "" })}>
        <DialogTitle>Từ chối yêu cầu</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do từ chối"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: "" })}>Hủy</Button>
          <Button onClick={handleReject} color="error" variant="contained">Xác nhận</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorTeacherApprovals;
