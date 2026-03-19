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
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  InputAdornment,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { suspendUser, unsuspendUser, searchUsers } from "../../services/moderatorService";

type UserItem = {
  id: string;
  username: string;
  email?: string;
  suspended?: boolean;
  suspendReason?: string;
  status?: string;
  latestReason?: string;
  role?: string;
};

const ModeratorUserSuspension: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    role: "",
    status: "", // Default to all statuses
    keyword: "",
  });

  // Load users from moderation service
  const fetchData = async (params = filter) => {
    setLoading(true);
    try {
      // Backend /api/users/search currently ONLY supports "keyword" and "page".
      // "role" and "status" filters are applied client-side below.
      const requestParams: any = {};
      if (params.keyword) requestParams.keyword = params.keyword;

      const data = await searchUsers(requestParams);

      // Normalize backend user objects to the expected frontend shape.
      const list: any[] = Array.isArray(data) ? data : data?.users || [];
      const normalized: UserItem[] = list.map((u: any, i: number) => ({
        id: u.id || u._id || `user-${i}`,
        username:
          u.username ||
          u.name ||
          (u.email ? u.email.split("@")[0] : `user-${i}`),
        email: u.email,
        suspended: !!(
          u.suspended ||
          u.isSuspended ||
          u.status === "banned" ||
          u.banned
        ),
        suspendReason: u.suspendReason || u.reason,
        status: u.status || (u.banned ? "banned" : "active"),
        latestReason: u.latestReason || u.latest_reason || u.suspendReason,
        role: u.role,
      }));

      // ==========================================
      // CLIENT-SIDE FILTERING 
      // ==========================================
      let filteredUsers = normalized;

      // Lọc theo vai trò (nếu chọn)
      if (params.role) {
        const rolesToMatch = params.role.split(",");
        filteredUsers = filteredUsers.filter((u) => u.role && rolesToMatch.includes(u.role));
      }

      // Lọc theo trạng thái (nếu chọn)
      if (params.status) {
        if (params.status === "banned") {
          filteredUsers = filteredUsers.filter((u) => u.suspended);
        } else if (params.status === "active") {
          filteredUsers = filteredUsers.filter((u) => !u.suspended);
        }
      }

      setUsers(filteredUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // On initial mount request only teacher & student roles for the moderation list
    // (this keeps the previous behavior for first load). When the user submits
    // the filter form with role === "" we'll omit the role param and request all roles.
    fetchData({ ...filter, role: "teacher,student" });
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (name: string, value: any) => {
    setFilter((f) => ({ ...f, [name]: value }));
  };

  const handleFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchData(filter);
  };
  const [reasonInput, setReasonInput] = useState<Record<string, string>>({});

  const [loadingIds, setUserLoading] = useState<Record<string, boolean>>({});
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const setLoadingUser = (id: string, v: boolean) =>
    setUserLoading((s) => ({ ...s, [id]: v }));

  const toggleSuspend = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    if (user.suspended) {
      if (!window.confirm(`Gỡ đình chỉ tài khoản ${user.username}?`)) return;
      try {
        setLoadingUser(id, true);
        const updated = await unsuspendUser(id);
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        setSnack({
          open: true,
          message: `Đã gỡ đình chỉ ${user.username}.`,
          severity: "success",
        });
      } catch (err: any) {
        console.error(err);
        setSnack({
          open: true,
          message: `Lỗi khi gỡ đình chỉ: ${err?.message ?? "unknown"}`,
          severity: "error",
        });
      } finally {
        setLoadingUser(id, false);
      }
      return;
    }

    const reason =
      reasonInput[id] ||
      window.prompt(
        `Lý do đình chỉ cho ${user.username}?`,
        "Vi phạm chính sách",
      );
    if (!reason) return;

    if (
      !window.confirm(`Xác nhận đình chỉ ${user.username} với lý do: ${reason}`)
    )
      return;

    try {
      setLoadingUser(id, true);
      const updated = await suspendUser(id, reason);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setReasonInput((r) => ({ ...r, [id]: "" }));
      setSnack({
        open: true,
        message: `Đã đình chỉ ${user.username}.`,
        severity: "success",
      });
    } catch (err: any) {
      console.error(err);
      setSnack({
        open: true,
        message: `Lỗi khi đình chỉ: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoadingUser(id, false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Quản lý đình chỉ người dùng
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Tìm kiếm người dùng..."
              name="keyword"
              value={filter.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={filter.role}
                label="Vai trò"
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <MenuItem value="">Tất cả vai trò</MenuItem>
                <MenuItem value="teacher">Giáo viên</MenuItem>
                <MenuItem value="student">Học sinh</MenuItem>
                <MenuItem value="moderator">Kiểm duyệt viên</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filter.status}
                label="Trạng thái"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">Tất cả trạng thái</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="banned">Bị đình chỉ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleFilter()}
            >
              Lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {users.length === 0 ? (
            <Typography align="center" color="text.secondary" py={5}>
              Không tìm thấy người dùng nào phù hợp với bộ lọc.
            </Typography>
          ) : (
            users.map((u) => (
              <Card key={u.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 44, height: 44 }}>
                      {u.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight="bold" variant="subtitle1">
                        {u.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                      {u.suspended && (
                        <Chip
                          label={`Đã đình chỉ (${u.status || "banned"}): ${u.latestReason || u.suspendReason || "(không có lý do)"}`}
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {!u.suspended && (
                        <TextField
                          size="small"
                          placeholder="Lý do đình chỉ (tùy chọn)"
                          value={reasonInput[u.id] ?? ""}
                          onChange={(e) =>
                            setReasonInput((r) => ({
                              ...r,
                              [u.id]: e.target.value,
                            }))
                          }
                          sx={{ width: { xs: 150, sm: 250 } }}
                        />
                      )}

                      <Button
                        color={u.suspended ? "success" : "error"}
                        variant={u.suspended ? "outlined" : "contained"}
                        onClick={() => toggleSuspend(u.id)}
                        disabled={!!loadingIds[u.id]}
                        sx={{ minWidth: 120 }}
                      >
                        {loadingIds[u.id]
                          ? "Đang xử lý..."
                          : u.suspended
                            ? "Gỡ đình chỉ"
                            : "Đình chỉ"}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Ghi chú: giao diện hiện gọi API filter thực tế để đình chỉ/gỡ đình chỉ
        user.
      </Typography>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorUserSuspension;
