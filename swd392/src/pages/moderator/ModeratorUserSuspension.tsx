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
  CircularProgress,
  Paper,
  Container,
  Breadcrumbs,
  InputAdornment,
} from "@mui/material";
import {
  Search,
  NavigateNext,
  PersonOff,
  Person,
  Mail,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  suspendUser,
  unsuspendUser,
  searchUsers,
} from "../../services/moderatorService";

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

  const normalizeUser = (u: any, i: number = 0): UserItem => ({
    id: u.id || u._id || `user-${i}`,
    username:
      u.username || u.name || (u.email ? u.email.split("@")[0] : `user-${i}`),
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
      const normalized: UserItem[] = list.map((u, i) => normalizeUser(u, i));

      // ==========================================
      // CLIENT-SIDE FILTERING
      // ==========================================
      let filteredUsers = normalized;

      // Lọc theo vai trò (nếu chọn)
      if (params.role) {
        const rolesToMatch = params.role.split(",");
        filteredUsers = filteredUsers.filter(
          (u) => u.role && rolesToMatch.includes(u.role),
        );
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
        const responseData = await unsuspendUser(id);
        const updated = normalizeUser(responseData);
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
      const responseData = await suspendUser(id, reason);
      const updated = normalizeUser(responseData);
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
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        py: 4,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={
            <NavigateNext fontSize="small" sx={{ color: "text.disabled" }} />
          }
          sx={{
            mb: 1,
            "& .MuiTypography-root": { fontFamily: "'Nunito', sans-serif" },
          }}
        >
          <Link to="/moderator/dashboard" style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              Kiểm duyệt
            </Typography>
          </Link>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            Đình chỉ người dùng
          </Typography>
        </Breadcrumbs>

        {/* Title Section */}
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#2d3436", mb: 0.5 }}
          >
            Quản lý đình chỉ người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi, đình chỉ hoặc gỡ đình chỉ các tài khoản vi phạm chính sách
          </Typography>
        </Box>

        {/* Filter Section - Matching the user's preferred style */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            alignItems: "flex-start",
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Tìm kiếm người dùng..."
            size="small"
            value={filter.keyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "4px",
                fontFamily: "'Nunito', sans-serif",
                height: "40px",
                bgcolor: "#fff",
              },
            }}
            InputLabelProps={{ sx: { fontFamily: "'Nunito', sans-serif" } }}
            sx={{ flex: 2 }}
          />
          <FormControl
            variant="outlined"
            size="small"
            sx={{ flex: 1, minWidth: { md: 180 } }}
          >
            <InputLabel sx={{ fontFamily: "'Nunito', sans-serif" }}>
              Vai trò
            </InputLabel>
            <Select
              value={filter.role}
              label="Vai trò"
              onChange={(e) => handleFilterChange("role", e.target.value)}
              sx={{
                borderRadius: "4px",
                height: "40px",
                bgcolor: "#fff",
                "& .MuiSelect-select": { fontFamily: "'Nunito', sans-serif" },
              }}
            >
              <MenuItem value="">Tất cả vai trò</MenuItem>
              <MenuItem value="teacher">Giáo viên</MenuItem>
              <MenuItem value="student">Học sinh</MenuItem>
              <MenuItem value="moderator">Kiểm duyệt viên</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ flex: 1, minWidth: { md: 180 } }}
          >
            <InputLabel sx={{ fontFamily: "'Nunito', sans-serif" }}>
              Trạng thái
            </InputLabel>
            <Select
              value={filter.status}
              label="Trạng thái"
              onChange={(e) => handleFilterChange("status", e.target.value)}
              sx={{
                borderRadius: "4px",
                height: "40px",
                bgcolor: "#fff",
                "& .MuiSelect-select": { fontFamily: "'Nunito', sans-serif" },
              }}
            >
              <MenuItem value="">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="banned">Bị đình chỉ</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => handleFilter()}
            sx={{
              px: 4,
              height: "40px",
              borderRadius: "4px",
              textTransform: "uppercase",
              fontWeight: 700,
              boxShadow: "none",
              bgcolor: "#667eea",
              "&:hover": { bgcolor: "#5a6fd6", boxShadow: "none" },
              fontFamily: "'Nunito', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            LỌC
          </Button>
        </Box>

        {/* Users List */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress
              thickness={5}
              size={50}
              sx={{ color: "primary.main" }}
            />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {users.length === 0 ? (
              <Paper
                sx={{
                  p: 10,
                  textAlign: "center",
                  borderRadius: "16px",
                  border: "1px solid #edf2f7",
                }}
              >
                <PersonOff
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Không tìm thấy người dùng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </Typography>
              </Paper>
            ) : (
              users.map((u) => (
                <Card
                  key={u.id}
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #edf2f7",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={3}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: u.suspended ? "#ffebee" : "#e3f2fd",
                          color: u.suspended ? "#d32f2f" : "#1976d2",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          borderRadius: "14px",
                        }}
                      >
                        {u.username[0].toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={800}
                            sx={{
                              color: "#2d3436",
                              fontFamily: "'Nunito', sans-serif",
                            }}
                          >
                            {u.username}
                          </Typography>
                          <Chip
                            label={u.role || "user"}
                            size="small"
                            sx={{
                              bgcolor: "#f1f2f6",
                              color: "#747d8c",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: "20px",
                            }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Mail
                              sx={{
                                fontSize: "0.9rem",
                                color: "text.disabled",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#636e72", fontWeight: 500 }}
                            >
                              {u.email}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.disabled", fontWeight: 600 }}
                          >
                            ID: {u.id?.substring(u.id.length - 8).toUpperCase()}
                          </Typography>
                        </Stack>

                        {u.suspended && (
                          <Box
                            sx={{
                              mt: 2,
                              p: 1.5,
                              bgcolor: "#fff5f5",
                              borderRadius: "10px",
                              border: "1px solid #fed7d7",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <PersonOff
                              sx={{
                                color: "#e53e3e",
                                fontSize: "1.1rem",
                                mt: 0.3,
                              }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                sx={{ color: "#c53030", display: "block" }}
                              >
                                ĐÃ ĐÌNH CHỈ
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#9b2c2c", fontWeight: 500 }}
                              >
                                Lý do:{" "}
                                {u.latestReason ||
                                  u.suspendReason ||
                                  "Không có lý do cụ thể"}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems="center"
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                      >
                        {!u.suspended && (
                          <TextField
                            size="small"
                            placeholder="Nhập lý do đình chỉ..."
                            value={reasonInput[u.id] ?? ""}
                            onChange={(e) =>
                              setReasonInput((r) => ({
                                ...r,
                                [u.id]: e.target.value,
                              }))
                            }
                            sx={{
                              width: { xs: "100%", sm: 250 },
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                bgcolor: "#fff",
                              },
                            }}
                          />
                        )}

                        <Button
                          fullWidth={false}
                          variant={u.suspended ? "outlined" : "contained"}
                          color={u.suspended ? "success" : "error"}
                          onClick={() => toggleSuspend(u.id)}
                          disabled={!!loadingIds[u.id]}
                          startIcon={
                            loadingIds[u.id] ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : u.suspended ? (
                              <Person />
                            ) : (
                              <PersonOff />
                            )
                          }
                          sx={{
                            minWidth: 140,
                            height: "40px",
                            borderRadius: "10px",
                            fontWeight: 700,
                            textTransform: "none",
                            boxShadow: u.suspended
                              ? "none"
                              : "0 4px 14px rgba(229, 62, 62, 0.3)",
                          }}
                        >
                          {loadingIds[u.id]
                            ? "Đang xử lý"
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

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            variant="filled"
            sx={{ borderRadius: "12px", fontWeight: 600 }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ModeratorUserSuspension;
