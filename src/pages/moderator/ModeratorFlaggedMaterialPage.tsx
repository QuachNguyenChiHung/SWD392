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
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { getPendingMaterials, verifyMaterial, changeMaterialStatus } from "../../services/moderatorService";
import MaterialViewDialog from "../../components/MaterialViewDialog";

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
      const data = await getPendingMaterials({ status: "flagged", ...filter });
      setMaterials(Array.isArray(data) ? data : data?.materials || []);
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

  return (
    <Box p={3}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/moderator/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          Kiểm duyệt
        </Link>
        <Typography color="text.primary">Tài liệu bị Flag</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        Danh sách tài liệu bị Flag
      </Typography>

      <Paper component="form" onSubmit={handleFilter} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Tìm kiếm..."
            value={filter.keyword}
            onChange={(e) => setFilter((f) => ({ ...f, keyword: e.target.value }))}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Loại</InputLabel>
            <Select
              value={filter.type}
              label="Loại"
              onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              <MenuItem value="slide">Slide</MenuItem>
              <MenuItem value="file">File</MenuItem>
              <MenuItem value="quiz">Quiz</MenuItem>
              <MenuItem value="2d_render">2D Render</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" type="submit">
            Lọc
          </Button>
        </Stack>
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
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không có tài liệu bị flag nào.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell sx={{ fontWeight: "medium" }}>{m.title}</TableCell>
                    <TableCell>
                      <Chip label={m.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {m.dateCreate ? new Date(m.dateCreate).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.status || "flagged"}
                        size="small"
                        color="warning"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => handleView(m)}>
                          Xem
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => handleVerify(m._id)}
                        >
                          Xác nhận lại
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleSuspend(m._id)}
                        >
                          Đình chỉ
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
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
