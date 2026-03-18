import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import MaterialTypeViewer from "./MaterialTypeViewer";
import { getMaterialById } from "../services/moderatorService";
import { suspendUser } from "../services/moderatorService";

interface MaterialViewDialogProps {
  open: boolean;
  onClose: () => void;
  material: any;
}

const MaterialViewDialog: React.FC<MaterialViewDialogProps> = ({
  open,
  onClose,
  material,
}) => {
  const [loading, setLoading] = useState(false);
  const [fullMaterial, setFullMaterial] = useState<any>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [suspending, setSuspending] = useState(false);

  const fetchContent = async () => {
    if (!material) return;

    setLoading(true);
    try {
      // Use the GET /api/class-materials/:id endpoint which returns
      // populated content based on material type (file, slide, quiz, 2d_render)
      const materialId = material._id || material.id;
      if (!materialId) {
        console.warn("Material missing _id:", material);
        setLoading(false);
        return;
      }

      const res = await getMaterialById(materialId);
      // The API returns { success, data: { ...material, content: {...} } }
      // or directly the material object with populated content
      const enrichedMaterial = res?.data || res;

      if (enrichedMaterial) {
        setFullMaterial(enrichedMaterial);
        // Extract teacher from class info if available
        if (enrichedMaterial.class_assign_id?.teacher_id) {
          const teacherId = typeof enrichedMaterial.class_assign_id.teacher_id === 'string'
            ? enrichedMaterial.class_assign_id.teacher_id
            : enrichedMaterial.class_assign_id.teacher_id._id;
          setAuthorId(teacherId);
        }
      } else {
        // Fallback: use the material data we already have
        setFullMaterial(material);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      // Fallback to original material data
      setFullMaterial(material);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && material) {
      fetchContent();
    } else {
      setFullMaterial(null);
      setAuthorId(null);
    }
    // eslint-disable-next-line
  }, [open, material?._id, material?.id]);

  const handleSuspendAuthor = async () => {
    if (!authorId) return;
    const reason = window.prompt("Nhập lý do đình chỉ tác giả:");
    if (reason === null) return;

    setSuspending(true);
    try {
      await suspendUser(authorId, reason);
      alert("Đã đình chỉ tác giả thành công!");
    } catch (error: any) {
      alert("Lỗi khi đình chỉ tác giả: " + error.message);
    } finally {
      setSuspending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{material?.title || "Xem tài liệu"}</Typography>
          {authorId && (
            <Button
              color="error"
              size="small"
              variant="outlined"
              onClick={handleSuspendAuthor}
              disabled={suspending}
            >
              {suspending ? "Đang xử lý..." : "Đình chỉ tác giả"}
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : fullMaterial ? (
          <MaterialTypeViewer material={fullMaterial} />
        ) : (
          <Typography>Không có nội dung để hiển thị.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialViewDialog;
