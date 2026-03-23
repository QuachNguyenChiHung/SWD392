import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Stack,
    Paper,
    Button,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import teacherProfileApi, {
    type TeacherProfileResponse,
} from "../../services/teacherApi/teacherProfileApi";
import {
    pageTitle,
    pageSubtitle,
    sectionLabel,
    sectionTitle,
    flatCard,
    flatButtonContained,
    flatButtonOutlined,
    loadingContainer,
    COLORS,
    RADIUS,
} from "./teacherStyles";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const TeacherProfilePage = () => {
    const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [hasTriedPasswordSubmit, setHasTriedPasswordSubmit] = useState(false);

    const passwordValidationError =
        password.trim().length === 0
            ? "Vui lòng nhập mật khẩu mới"
            : !PASSWORD_REGEX.test(password)
                ? "Mật khẩu phải có ít nhất 10 ký tự, gồm 1 chữ in hoa, 1 số và 1 ký tự đặc biệt"
                : "";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setError(null);
                const res = await teacherProfileApi.getTeacherProfile();
                setProfile(res);
            } catch (error) {
                console.error("Error fetching teacher profile:", error);
                setError(error instanceof Error ? error.message : "Không thể tải hồ sơ giáo viên");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdatePassword = async () => {
        setHasTriedPasswordSubmit(true);

        if (passwordValidationError) {
            setError(passwordValidationError);
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            setIsUpdatingPassword(true);
            await teacherProfileApi.updateMyPassword(password);
            setSuccess("Đổi mật khẩu thành công");
            setPassword("");
            setShowPassword(false);
            setHasTriedPasswordSubmit(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (loading) {
        return (
            <Box sx={loadingContainer}>
                <CircularProgress sx={{ color: COLORS.accent }} />
            </Box>
        );
    }

    const fieldRow = (label: string, value: string) => (
        <Box
            sx={{
                display: "flex",
                py: 1.25,
                borderBottom: `1px solid ${COLORS.borderLight}`,
                "&:last-child": { borderBottom: "none" },
            }}
        >
            <Typography
                sx={{
                    width: 140,
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: COLORS.textSecondary,
                    pt: 0.25,
                }}
            >
                {label}
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: COLORS.textDark }}>
                {value || "—"}
            </Typography>
        </Box>
    );

    return (
        <Box>
            {/* ── Page Header ── */}
            <Box sx={{ mb: 4 }}>
                <Typography sx={sectionLabel}>Profile</Typography>
                <Typography sx={pageTitle}>Hồ sơ giáo viên</Typography>
                <Typography sx={pageSubtitle}>
                    Thông tin người dùng và thực thể giáo viên
                </Typography>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        borderRadius: RADIUS,
                        border: `1px solid ${COLORS.error}`,
                        boxShadow: "none",
                    }}
                >
                    {error}
                </Alert>
            )}
            {success && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 2,
                        borderRadius: RADIUS,
                        border: `1px solid ${COLORS.success}`,
                        boxShadow: "none",
                    }}
                >
                    {success}
                </Alert>
            )}

            {!profile ? (
                <Paper elevation={0} sx={flatCard}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                        Không có dữ liệu hồ sơ.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {/* User Info */}
                    <Paper elevation={0} sx={flatCard}>
                        <Typography sx={sectionTitle}>User</Typography>
                        <Box>
                            {fieldRow("ID", profile.user._id || profile.user.id || "—")}
                            {fieldRow("Username", profile.user.username)}
                            {fieldRow("Email", profile.user.email)}
                            {fieldRow("Role", profile.user.role)}
                            {fieldRow("Status", profile.user.status)}
                            {fieldRow(
                                "Created",
                                profile.user.date_create
                                    ? new Date(profile.user.date_create).toLocaleString("vi-VN")
                                    : "—",
                            )}
                        </Box>
                    </Paper>

                    {/* Teacher Info */}
                    <Paper elevation={0} sx={flatCard}>
                        <Typography sx={sectionTitle}>Teacher</Typography>
                        <Box>
                            {fieldRow("Credential file", profile.teacher.fileName || "—")}
                            {profile.teacher.credential ? (
                                <Box sx={{ mt: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={profile.teacher.credential}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={flatButtonOutlined}
                                    >
                                        Xem credential
                                    </Button>
                                </Box>
                            ) : (
                                fieldRow("Credential link", "—")
                            )}
                        </Box>
                    </Paper>

                    {/* Password */}
                    <Paper elevation={0} sx={flatCard}>
                        <Typography sx={sectionTitle}>Password</Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                                Mật khẩu hiện tại không thể hiển thị vì lý do bảo mật.
                            </Typography>
                            <TextField
                                label="Mật khẩu mới"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setSuccess(null);
                                }}
                                placeholder="Nhập mật khẩu mới"
                                fullWidth
                                error={hasTriedPasswordSubmit && !!passwordValidationError}
                                helperText={
                                    hasTriedPasswordSubmit
                                        ? (passwordValidationError || "")
                                        : "Ít nhất 10 ký tự, gồm chữ in hoa, số và ký tự đặc biệt"
                                }
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: RADIUS,
                                    },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                                sx={{ color: COLORS.textSecondary }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleUpdatePassword}
                                disabled={isUpdatingPassword}
                                sx={{ ...flatButtonContained, alignSelf: "flex-start" }}
                            >
                                {isUpdatingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                            </Button>
                        </Stack>
                    </Paper>
                </Stack>
            )}
        </Box>
    );
};

export default TeacherProfilePage;
