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
} from "@mui/material";
import { Visibility, NavigateNext, Search } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { searchClasses } from "../../services/moderatorService";

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
      setClasses(Array.isArray(res) ? res : res.classes || []);
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
          Kiểm duyệt
        </Link>
        <Typography color="text.primary">Quản lý lớp học</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        Xem Lớp học (Kiểm duyệt viên)
      </Typography>

      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm lớp học bằng mã hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã lớp</TableCell>
                <TableCell>Tên lớp</TableCell>
                <TableCell>Khóa học</TableCell>
                <TableCell>Giáo viên</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không tìm thấy lớp học nào.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls._id}>
                    <TableCell sx={{ fontWeight: "bold" }}>{cls.keypass}</TableCell>
                    <TableCell>{cls.class_name}</TableCell>
                    <TableCell>{cls.course_id?.course_name || "-"}</TableCell>
                    <TableCell>{cls.teacher_id?.name || cls.teacher_id?.username || "-"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem tài liệu trong lớp">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/moderator/classes/${cls._id}/materials`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ModeratorClassesPage;
