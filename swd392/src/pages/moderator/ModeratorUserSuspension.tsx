import React, { useState } from "react";
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
import moderationService from "../../services/moderation";

type UserItem = {
  id: string;
  username: string;
  email?: string;
  suspended?: boolean;
  suspendReason?: string;
};

const initialUsers: UserItem[] = [
  { id: "u1", username: "nguyen.van.a", email: "a@example.com" },
  {
    id: "u2",
    username: "tran.thi.b",
    email: "b@example.com",
    suspended: true,
    suspendReason: "Spam nội dung",
  },
  { id: "u3", username: "le.van.c", email: "c@example.com" },
];

const ModeratorUserSuspension: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [reasonInput, setReasonInput] = useState<Record<string, string>>({});

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const setLoading = (id: string, v: boolean) =>
    setLoadingIds((s) => ({ ...s, [id]: v }));

  const toggleSuspend = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    if (user.suspended) {
      if (!window.confirm(`Gỡ đình chỉ tài khoản ${user.username}?`)) return;
      try {
        setLoading(id, true);
        const updated = await moderationService.unsuspendUser(id);
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
        setLoading(id, false);
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
      setLoading(id, true);
      const updated = await moderationService.suspendUser(id, reason);
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
      setLoading(id, false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quản lý đình chỉ người dùng
      </Typography>
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
                      label={`Đã đình chỉ: ${u.suspendReason ?? "(không có lý do)"}`}
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

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Ghi chú: giao diện hiện gọi API giả định để đình chỉ/gỡ đình chỉ; đổi
        thành endpoint thực tế khi backend sẵn sàng.
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
