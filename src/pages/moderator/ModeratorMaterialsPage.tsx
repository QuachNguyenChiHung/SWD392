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
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Chip,
} from "@mui/material";
import { Visibility, NavigateNext, Description, Slideshow, Quiz, ViewInAr } from "@mui/icons-material";
import { useParams, Link } from "react-router-dom";
import { getMaterialsByTopic, changeMaterialStatus } from "../../services/moderatorService";
import MaterialViewDialog from "../../components/MaterialViewDialog";

const ModeratorMaterialsPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  const fetchMaterials = async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const res = await getMaterialsByTopic(topicId);
      setMaterials(res || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [topicId]);

  const handleView = (material: any) => {
    setSelectedMaterial(material);
    setViewDialogOpen(true);
  };

  const handleSuspend = async (id: string) => {
    if (window.confirm("Bạn có muốn đình chỉ tài liệu này? Trạng thái sẽ chuyển thành 'rejected'.")) {
      try {
        await changeMaterialStatus(id, "rejected");
        setSnack({
          open: true,
          message: "Đã đình chỉ tài liệu",
          severity: "success",
        });
        fetchMaterials();
      } catch (err: any) {
        setSnack({
          open: true,
          message: err.message || "Lỗi khi đình chỉ tài liệu",
          severity: "error",
        });
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "slide": return <Slideshow color="primary" />;
      case "file": return <Description color="info" />;
      case "quiz": return <Quiz color="warning" />;
      case "2d_render": return <ViewInAr color="secondary" />;
      default: return <Description />;
    }
  };

  return (
    <Box p={3}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/moderator/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          Kiểm duyệt
        </Link>
        <Link to="/moderator/courses" style={{ textDecoration: "none", color: "inherit" }}>
          Khóa học
        </Link>
        <Typography color="text.primary">Tài liệu (Materials)</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        Xem và Đình chỉ Tài liệu
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}>Loại</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Chưa có tài liệu nào trong chủ đề này.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((mat) => (
                  <TableRow key={mat._id}>
                    <TableCell>{getTypeIcon(mat.type)}</TableCell>
                    <TableCell sx={{ fontWeight: "medium" }}>{mat.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={mat.status} 
                        size="small" 
                        color={mat.status === "reviewed" ? "success" : mat.status === "rejected" ? "error" : "default"} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleView(mat)}
                        sx={{ mr: 1, textTransform: "none" }}
                      >
                        {mat.type === "slide" ? "Xem Slide" : 
                         mat.type === "quiz" ? "Xem Quiz" : 
                         mat.type === "file" ? "Xem File" : 
                         mat.type === "2d_render" ? "Xem 2D" : "Xem"}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleSuspend(mat._id)}
                        disabled={mat.status === "rejected"}
                      >
                        Đình chỉ
                      </Button>
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

export default ModeratorMaterialsPage;
