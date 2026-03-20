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
} from "@mui/material";
import { Visibility, NavigateNext, Search, Class as ClassIcon } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { searchClasses } from "../../services/moderatorService";
import { adminSystemApi, adminCoursesApi } from "../../services/adminApi";

const ModeratorClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchClasses = async (keyword = "") => {
    setLoading(true);
    try {
      const res = await searchClasses(keyword);
      // searchClasses returns { classes: [...], total: ... } based on typical patterns,
      // but let's handle both array and object responses
      const rawClasses = Array.isArray(res) ? res : res.classes || [];
      
      setClasses(rawClasses); // Show what we have first

      // Enrich classes in background
      const enriched = await Promise.all(
        rawClasses.map(async (cls: any) => {
          try {
            // Fetch missing details in parallel
            const [classDetail, courseDetail] = await Promise.all([
              // Try to get keypass from getClassById (might return more fields than search)
              adminSystemApi.getClassById(cls._id).catch(() => null),
              // Get course name
              cls.course_id && typeof cls.course_id === 'string' 
                ? adminCoursesApi.getCourseById(cls.course_id).catch(() => null)
                : null
            ]);

            return {
              ...cls,
              keypass: classDetail?.keypass || cls.keypass,
              course_name: courseDetail?.course_name || cls.course_name
            };
          } catch (err) {
            console.error(`Error enriching class ${cls._id}:`, err);
            return cls;
          }
        })
      );

      setClasses(enriched);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lớp học:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClasses(search);
  };

  return (
    <Box p={3}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/moderator/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography color="text.secondary" sx={{ "&:hover": { textDecoration: "underline" } }}>Kiểm duyệt</Typography>
        </Link>
        <Typography color="text.primary" fontWeight="medium">Quản lý lớp học</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: "primary.main" }}>
        Trang Lớp học (Kiểm duyệt viên)
      </Typography>

      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', borderRadius: 2, elevation: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm lớp học bằng mã hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Lớp học</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mã tham gia (Keypass)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Khóa học</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Không tìm thấy lớp học nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => {
                  // Fallback data correctly
                  const courseName = cls.course_name || cls.course_id?.course_name || "-";

                  return (
                    <TableRow key={cls._id} hover sx={{ transition: "0.2s" }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: "success.light", color: "success.dark" }}>
                            <ClassIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {cls.class_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {cls._id?.substring(cls._id.length - 6).toUpperCase()}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {cls.keypass ? (
                          <Chip label={cls.keypass} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: "bold" }} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                          {courseName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Xem tài liệu trong lớp">
                          <IconButton
                            color="info"
                            onClick={() => navigate(`/moderator/classes/${cls._id}/materials`)}
                            sx={{ bgcolor: "info.light", color: "info.dark", "&:hover": { bgcolor: "info.main", color: "white" } }}
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
    </Box>
  );
};

export default ModeratorClassesPage;
