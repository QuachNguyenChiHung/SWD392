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
  Avatar,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  NavigateNext,
  Description,
  Slideshow,
  Quiz,
  ViewInAr,
  Block,
} from "@mui/icons-material";
import { useParams, Link } from "react-router-dom";
import { getClassMaterials, changeMaterialStatus, getTopicsByCourse, getMaterialsByTopic } from "../../services/moderatorService";
import { adminSystemApi } from "../../services/adminApi";
import MaterialViewDialog from "../../components/MaterialViewDialog";

const ModeratorClassMaterialsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [materials, setMaterials] = useState<any[]>([]);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  const fetchMaterials = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      // 1. Get Class details to find course_id
      const classRes = await adminSystemApi.getClassById(classId);
      const courseId = classRes?.course_id;
      
      if (courseId) {
        // 2. Get Course info and Topics
        const topicsRes = await getTopicsByCourse(courseId);
        setCourseInfo({
          course_name: topicsRes?.course_name || "Khóa học",
          class_name: classRes?.class_name
        });

        const topics = topicsRes?.topics || [];
        
        // 3. Fetch materials for each topic
        const allMaterialsPromises = topics.map((topic: any) => getMaterialsByTopic(topic._id));
        const materialsResponses = await Promise.all(allMaterialsPromises);
        
        // Flatten materials from all topics
        const flattenedMaterials: any[] = [];
        materialsResponses.forEach((res: any) => {
          const mats = Array.isArray(res) ? res : (res?.data || res?.materials || []);
          flattenedMaterials.push(...mats);
        });

        // Add materials belonging directly to the class (if any)
        const directRes = await getClassMaterials(classId);
        const directMats = Array.isArray(directRes) ? directRes : (directRes?.data || directRes?.materials || []);
        
        // Merge and remove duplicates by _id
        const combined = [...flattenedMaterials, ...directMats];
        const unique = Array.from(new Map(combined.map(m => [m._id, m])).values());
        
        console.log(`Đã tìm thấy tổng cộng ${unique.length} tài liệu liên quan.`);
        setMaterials(unique);
      } else {
        // Fallback to direct class materials only if courseId not found
        const res = await getClassMaterials(classId);
        setMaterials(Array.isArray(res) ? res : (res?.data || res?.materials || []));
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài liệu lớp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [classId]);

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
        <Link to="/moderator/classes" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography color="text.secondary" sx={{ "&:hover": { textDecoration: "underline" } }}>Lớp học</Typography>
        </Link>
        <Typography color="text.primary" fontWeight="medium">Tài liệu lớp</Typography>
      </Breadcrumbs>

      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "primary.main" }}>
          Tài liệu trong lớp học
        </Typography>
        {courseInfo && (
          <Typography variant="body1" color="text.secondary" mt={1}>
            Lớp: <strong>{courseInfo.class_name}</strong> | Khóa học: <strong>{courseInfo.course_name}</strong>
          </Typography>
        )}
      </Box>

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
                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">Chưa có tài liệu nào trong lớp này.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((mat) => {
                  const colors = getTypeColor(mat.type);
                  return (
                  <TableRow key={mat._id} hover sx={{ transition: "0.2s" }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: colors.bg, color: colors.color }}>
                          {getTypeIcon(mat.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {mat.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {mat._id?.substring(mat._id.length - 6).toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                         {getTypeLabel(mat.type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          mat.status === "published" ? (mat.isFlagged ? "Bị báo cáo" : "Chờ duyệt") : 
                          mat.status === "reviewed" ? "Đã duyệt" : 
                          mat.status === "rejected" ? "Bị đình chỉ" : 
                          mat.status === "draft" ? "Nháp" : mat.status
                        }
                        size="small"
                        color={
                          mat.status === "reviewed" ? "success" : 
                          mat.isFlagged ? "warning" : 
                          mat.status === "published" ? "info" : "default"
                        }
                        sx={{ fontWeight: "medium" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Xem chi tiết nội dung ${getTypeLabel(mat.type).toLowerCase()}`}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleView(mat)}
                          sx={{ mr: 1, textTransform: "none", borderRadius: 2 }}
                          variant="outlined"
                          color="info"
                        >
                          Xem
                        </Button>
                      </Tooltip>
                      <Tooltip title={mat.status === "rejected" ? "Tài liệu này đã bị can thiệp" : "Đình chỉ hiển thị tài liệu này"}>
                        <span>
                          <Button
                            size="small"
                            color="error"
                            variant="contained"
                            startIcon={<Block fontSize="small" />}
                            onClick={() => handleSuspend(mat._id)}
                            disabled={mat.status === "rejected"}
                            sx={{ textTransform: "none", borderRadius: 2, boxShadow: 0 }}
                          >
                            Đình chỉ
                          </Button>
                        </span>
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

export default ModeratorClassMaterialsPage;
