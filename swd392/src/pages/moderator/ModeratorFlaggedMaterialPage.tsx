import React, { useEffect, useState } from "react";
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
  Button,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Snackbar,
  Alert,
  Breadcrumbs,
  Avatar,
  Tooltip,
} from "@mui/material";
import { NavigateNext, Description, Slideshow, Quiz, ViewInAr, Visibility, CheckCircle, Block } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { getPendingMaterials, verifyMaterial, changeMaterialStatus } from "../../services/moderatorService.ts";
import MaterialViewDialog from "../../components/MaterialViewDialog.tsx";

const ModeratorFlaggedMaterialPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", keyword: "" });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPendingMaterials({ status: "flagged" });
      let list = Array.isArray(data) ? data : data?.materials || [];
      
      // Enforce client-side filtering because backend might ignore params
      if (filter.type) {
        list = list.filter((m: any) => m.type === filter.type);
      }
      if (filter.keyword) {
        list = list.filter((m: any) => m.title.toLowerCase().includes(filter.keyword.toLowerCase()));
      }
      
      setMaterials(list);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu bị flag:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleVerify = async (id: string) => {
    if (!window.confirm("Xác nhận lại tài liệu này? Trạng thái sẽ trở về 'reviewed'.")) return;
    try {
      await verifyMaterial(id);
      setSnack({ open: true, message: "Đã xác nhận lại tài liệu!", severity: "success" });
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch {
      setSnack({ open: true, message: "Lỗi khi xác nhận tài liệu!", severity: "error" });
    }
  };

  const handleSuspend = async (id: string) => {
    if (!window.confirm("Đình chỉ tài liệu này? Trạng thái sẽ chuyển thành 'rejected'.")) return;
    try {
      await changeMaterialStatus(id, "rejected");
      setSnack({ open: true, message: "Đã đình chỉ tài liệu!", severity: "success" });
      fetchData();
    } catch {
      setSnack({ open: true, message: "Lỗi khi đình chỉ tài liệu!", severity: "error" });
    }
  };

  const handleView = (material: any) => {
    setSelectedMaterial(material);
    setViewDialogOpen(true);
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "slide": return <Slideshow />;
      case "file": return <Description />;
      case "quiz": return <Quiz />;
      case "2d_render": return <ViewInAr />;
      default: return <Description />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "slide": return { bg: "info.light", color: "info.dark" };
      case "file": return { bg: "primary.light", color: "primary.dark" };
      case "quiz": return { bg: "warning.light", color: "warning.dark" };
      case "2d_render": return { bg: "secondary.light", color: "secondary.dark" };
      default: return { bg: "grey.200", color: "grey.700" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "slide": return "Slide";
      case "file": return "File PDF/Word";
      case "quiz": return "Bài kiểm tra";
      case "2d_render": return "Mô hình 2D";
      default: return "Tài liệu khác";
    }
  };

  return (
    <Box p={3}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/moderator/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography color="text.secondary" sx={{ "&:hover": { textDecoration: "underline" } }}>Kiểm duyệt</Typography>
        </Link>
        <Typography color="text.primary" fontWeight="medium">Tài liệu bị Flag</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: "primary.main" }}>
        Danh sách tài liệu bị Flag
      </Typography>

      <Paper component="form" onSubmit={handleFilter} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Tìm kiếm theo tiêu đề..."
            value={filter.keyword}
            onChange={(e) => setFilter((f) => ({ ...f, keyword: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Loại tài liệu</InputLabel>
            <Select
              value={filter.type}
              label="Loại tài liệu"
              onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              <MenuItem value="slide">Slide</MenuItem>
              <MenuItem value="file">File PDF/Word</MenuItem>
              <MenuItem value="quiz">Bài kiểm tra (Quiz)</MenuItem>
              <MenuItem value="2d_render">Mô hình 2D</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" type="submit">
            Lọc kết quả
          </Button>
        </Stack>
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
                <TableCell sx={{ fontWeight: "bold" }}>Tài liệu</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Phân loại</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày flag</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: 300 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Không tìm thấy tài liệu bị flag nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m) => {
                  const colors = getTypeColor(m.type);
                  return (
                  <TableRow key={m._id} hover sx={{ transition: "0.2s" }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: colors.bg, color: colors.color }}>
                          {getTypeIcon(m.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {m.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {m._id?.substring(m._id.length - 6).toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                         {getTypeLabel(m.type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {m.dateCreate ? new Date(m.dateCreate).toLocaleString() : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.status === "flagged" ? "Bị báo cáo" : m.status}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: "medium" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Xem nội dung chi tiết">
                          <Button 
                            size="small" 
                            startIcon={<Visibility />}
                            onClick={() => handleView(m)}
                            variant="outlined"
                            color="info"
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Xem
                          </Button>
                        </Tooltip>
                        <Tooltip title="Xác nhận tài liệu này hợp lệ">
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            startIcon={<CheckCircle fontSize="small" />}
                            onClick={() => handleVerify(m._id)}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Xác nhận lại
                          </Button>
                        </Tooltip>
                        <Tooltip title="Đình chỉ hiển thị tài liệu này vĩnh viễn">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<Block fontSize="small" />}
                            onClick={() => handleSuspend(m._id)}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Đình chỉ
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedMaterial && (
        <MaterialViewDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          material={selectedMaterial}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorFlaggedMaterialPage;
