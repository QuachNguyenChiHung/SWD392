import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Breadcrumbs,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  Stack,
  Chip,
  Container,
  Button,
} from "@mui/material";
import {
  Visibility,
  NavigateNext,
  Search,
  Class as ClassIcon,
} from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { searchClasses } from "../../services/moderatorService";
import {
  adminSystemApi,
  adminCoursesApi,
  adminUsersApi,
} from "../../services/adminApi";

const ModeratorClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});

  const fetchTeacherMap = async () => {
    try {
      const res = await adminUsersApi.getAllUsers({ page: 1, limit: 100 });
      const users = res.users || [];

      const map: Record<string, string> = {};
      users.forEach((user: any) => {
        if (user.role === "teacher" && user.teacher?._id) {
          map[user.teacher._id] = user.username;
        }
      });
      setTeacherMap(map);
      return map;
    } catch (err) {
      console.error("Error building teacher map:", err);
      return {};
    }
  };

  const fetchClasses = async (
    keyword = "",
    currentTeacherMap?: Record<string, string>,
  ) => {
    setLoading(true);
    try {
      const res = await searchClasses(keyword);
      const rawClasses = Array.isArray(res) ? res : res.classes || [];

      // Use provided map or state map
      const activeMap = currentTeacherMap || teacherMap;

      setClasses(rawClasses);

      // Enrich classes in background
      const enriched = await Promise.all(
        rawClasses.map(async (cls: any) => {
          try {
            const [classDetail, courseDetail] = await Promise.all([
              adminSystemApi.getClassById(cls._id).catch(() => null),
              cls.course_id && typeof cls.course_id === "string"
                ? adminCoursesApi.getCourseById(cls.course_id).catch(() => null)
                : null,
            ]);

            return {
              ...cls,
              keypass: classDetail?.keypass || cls.keypass,
              course_name: courseDetail?.course_name || cls.course_name,
              teacher_name: activeMap[cls.teacher_id] || "N/A",
            };
          } catch (err) {
            console.error(`Error enriching class ${cls._id}:`, err);
            return cls;
          }
        }),
      );

      setClasses(enriched);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lớp học:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const map = await fetchTeacherMap();
      fetchClasses("", map);
    };
    init();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClasses(search);
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
            Quản lý lớp học
          </Typography>
        </Breadcrumbs>

        {/* Title Section */}
        <Box mb={4}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#2d3436", mb: 0.5 }}
          >
            Trang Lớp học (Kiểm duyệt viên)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý và theo dõi các lớp học đang hoạt động trong hệ thống
          </Typography>
        </Box>

        {/* Filter Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            alignItems: "center",
          }}
          component="form"
          onSubmit={handleSearch}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm lớp học bằng mã hoặc tên..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            sx={{ maxWidth: 500 }}
          />
          <Button
            variant="contained"
            type="submit"
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
            }}
          >
            TÌM KIẾM
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress
              thickness={5}
              size={50}
              sx={{ color: "primary.main" }}
            />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #edf2f7",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#2d3436",
                      py: 2,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    LỚP HỌC
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#2d3436",
                      py: 2,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    GIÁO VIÊN
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#2d3436",
                      py: 2,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    KEYPASS
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      color: "#2d3436",
                      py: 2,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    KHÓA HỌC
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 800,
                      color: "#2d3436",
                      py: 2,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    HÀNH ĐỘNG
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Typography color="text.secondary" fontWeight={600}>
                        Không tìm thấy lớp học nào.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map((cls) => {
                    const courseName =
                      cls.course_name || cls.course_id?.course_name || "-";

                    return (
                      <TableRow
                        key={cls._id}
                        hover
                        sx={{ "&:hover": { bgcolor: "#fdfdfd" } }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#e3f2fd",
                                color: "#1976d2",
                                borderRadius: "12px",
                                width: 40,
                                height: 40,
                              }}
                            >
                              <ClassIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={800}
                                sx={{ fontFamily: "'Nunito', sans-serif" }}
                              >
                                {cls.class_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                fontWeight={700}
                              >
                                ID:{" "}
                                {cls._id
                                  ?.substring(cls._id.length - 6)
                                  .toUpperCase()}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: "#f1f2f6",
                                color: "#747d8c",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                              }}
                            >
                              {cls.teacher_name
                                ? cls.teacher_name[0].toUpperCase()
                                : "T"}
                            </Avatar>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                color: "#2d3436",
                                fontFamily: "'Nunito', sans-serif",
                              }}
                            >
                              {cls.teacher_name || "Đang tải..."}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {cls.keypass ? (
                            <Chip
                              label={cls.keypass}
                              size="small"
                              sx={{
                                bgcolor: "#f1f2f6",
                                color: "#2d3436",
                                fontWeight: 700,
                                borderRadius: "6px",
                                fontFamily: "monospace",
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              color: "#636e72",
                              fontFamily: "'Nunito', sans-serif",
                            }}
                          >
                            {courseName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Xem tài liệu trong lớp" arrow>
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/moderator/classes/${cls._id}/materials`,
                                )
                              }
                              sx={{
                                bgcolor: "#667eea15",
                                color: "#667eea",
                                "&:hover": {
                                  bgcolor: "#667eea",
                                  color: "white",
                                },
                                transition: "0.2s",
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default ModeratorClassesPage;
