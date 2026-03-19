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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Hồ sơ giáo viên
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Thông tin người dùng và thực thể giáo viên
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {!profile ? (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Không có dữ liệu hồ sơ.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            User
                        </Typography>
                        <Stack spacing={1}>
                            <Typography><strong>ID:</strong> {profile.user._id || profile.user.id || "-"}</Typography>
                            <Typography><strong>Username:</strong> {profile.user.username}</Typography>
                            <Typography><strong>Email:</strong> {profile.user.email}</Typography>
                            <Typography><strong>Role:</strong> {profile.user.role}</Typography>
                            <Typography><strong>Status:</strong> {profile.user.status}</Typography>
                            <Typography>
                                <strong>Created:</strong>{" "}
                                {profile.user.date_create
                                    ? new Date(profile.user.date_create).toLocaleString("vi-VN")
                                    : "-"}
                            </Typography>
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Teacher
                        </Typography>
                        <Stack spacing={1}>
                            <Typography><strong>Credential file:</strong> {profile.teacher.fileName || "-"}</Typography>
                            {profile.teacher.credential ? (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    href={profile.teacher.credential}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ alignSelf: "flex-start" }}
                                >
                                    Xem credential
                                </Button>
                            ) : (
                                <Typography><strong>Credential link:</strong> -</Typography>
                            )}
                        </Stack>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Password
                        </Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
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
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
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
                                sx={{ alignSelf: "flex-start" }}
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
