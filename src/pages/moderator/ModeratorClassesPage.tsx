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
  TextField,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  InputAdornment,
  Avatar,
  TablePagination,
} from "@mui/material";
import { Delete, Search, School } from "@mui/icons-material";
import { searchClasses, deleteClass } from "../../services/managementApi";

const ModeratorClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" as "info" | "success" | "error" });

  const fetchClasses = async (searchKeyword: string, pageNum: number) => {
    setLoading(true);
    try {
      // Backend expects 1-indexed page
      const res = await searchClasses(searchKeyword, pageNum + 1);
      setClasses(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setSnack({ open: true, message: "Lỗi khi tìm kiếm lớp học", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses(keyword, page);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, page]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này? Tất cả tài liệu liên quan sẽ bị ảnh hưởng.")) {
      try {
        await deleteClass(id);
        setSnack({ open: true, message: "Xóa lớp học thành công", severity: "success" });
        fetchClasses(keyword, page);
      } catch (err: any) {
        setSnack({ open: true, message: err.message || "Lỗi khi xóa lớp học", severity: "error" });
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>Quản lý Lớp học</Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm lớp học theo tên..."
          value={keyword}
          onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
          }}
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
        <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lớp học</TableCell>
                <TableCell>Giáo viên</TableCell>
                <TableCell>Học sinh</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Không tìm thấy lớp học nào.</TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls._id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }} src={cls.image_cover}>
                          <School />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">{cls.class_name}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: {cls._id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{cls.teacher_id?.name || "Không rõ"}</TableCell>
                    <TableCell>{cls.students?.length || 0}</TableCell>
                    <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDelete(cls._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[12]}
            component="div"
            count={total}
            rowsPerPage={12}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
          />
        </TableContainer>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorClassesPage;
