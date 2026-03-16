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
} from "@mui/material";
import { suspendUser, unsuspendUser } from "../../services/moderation";
import { filterUsers } from "../../services/moderatorFilterApi";

type UserItem = {
  id: string;
  username: string;
  email?: string;
  suspended?: boolean;
  suspendReason?: string;
  status?: string;
  latestReason?: string;
};

const ModeratorUserSuspension: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    role: "",
    status: "banned",
    keyword: "",
  });

  // Load users from moderation service
  const fetchData = async (params = filter) => {
    setLoading(true);
    try {
      const data = await filterUsers({ ...params, status: "banned" });
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilter((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
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
    <Box>
      <Typography variant="h6" gutterBottom>
        Quản lý đình chỉ người dùng
      </Typography>
      <form style={{ marginBottom: 16 }} onSubmit={handleFilter}>
        <input
          name="keyword"
          placeholder="Tìm kiếm..."
          value={filter.keyword}
          onChange={handleInput}
        />
        <select name="role" value={filter.role} onChange={handleInput}>
          <option value="">Tất cả vai trò</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
          <option value="moderator">Kiểm duyệt viên</option>
        </select>
        <button type="submit">Lọc</button>
      </form>
      {loading ? (
        <Typography>Đang tải...</Typography>
      ) : (
        <Stack spacing={2}>
          {users.map((u) => (
            <Card key={u.id} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {u.username[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{u.username}</Typography>
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
                      />
                    )}

                    <Button
                      color={u.suspended ? "primary" : "error"}
                      variant={u.suspended ? "outlined" : "contained"}
                      onClick={() => toggleSuspend(u.id)}
                      disabled={!!loadingIds[u.id]}
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
          ))}
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
