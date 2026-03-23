import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import MaterialTypeViewer from "./MaterialTypeViewer";
import { getMaterialById } from "../services/moderatorService";
import { adminMaterialsApi } from "../services/adminApi";
import type { ClassMaterial } from "../types/teacherType";

interface MaterialViewDialogProps {
  open: boolean;
  onClose: () => void;
  material: unknown;
}

const resolveApiMaterial = (data: unknown): ClassMaterial | null => {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as ClassMaterial) ?? null;

  const maybeObj = data as Record<string, unknown>;
  if (maybeObj.material && typeof maybeObj.material === "object") {
    return maybeObj.material as ClassMaterial;
  }

  return data as ClassMaterial;
};

export default function MaterialViewDialog({
  open,
  onClose,
  material,
}: MaterialViewDialogProps) {
  const [resolvedMaterial, setResolvedMaterial] = useState<ClassMaterial | null>(
    resolveApiMaterial(material)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const materialId = useMemo(() => {
    if (typeof material === "string") return material;
    if (material && typeof material === "object") {
      const maybeObj = material as Record<string, unknown>;
      if (typeof maybeObj._id === "string") return maybeObj._id;
    }
    return "";
  }, [material]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const initialMaterial = resolveApiMaterial(material);
    setResolvedMaterial(initialMaterial);

    const needsFetch =
      Boolean(materialId) &&
      (typeof material === "string" || !initialMaterial?.content);

    if (!needsFetch) {
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    getMaterialById(materialId)
      .then(async (data) => {
        if (cancelled) return;
        const mat = resolveApiMaterial(data);
        if (!mat) {
          setError("Không tìm thấy tài liệu.");
          return;
        }

        // If content is missing, enrich it using specific admin APIs
        if (!mat.content && mat.type && mat.content_id) {
          try {
            let enrichedContent: any = null;
            if (mat.type === "file") {
              enrichedContent = await adminMaterialsApi.getFileById(mat.content_id);
            } else if (mat.type === "slide") {
              enrichedContent = await adminMaterialsApi.getSlideById(mat.content_id);
            } else if (mat.type === "quiz") {
              const quiz = await adminMaterialsApi.getQuizById(mat.content_id);
              const questions = await adminMaterialsApi.getQuestionsByQuizId(mat.content_id);
              enrichedContent = { ...quiz, questions };
            }

            if (enrichedContent) {
              mat.content = enrichedContent;
            }
          } catch (enrichError) {
            console.error("Lỗi khi làm giàu dữ liệu tài liệu:", enrichError);
            // We can still try to show what we have, or show an error
          }
        }

        setResolvedMaterial(mat);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Lỗi khi tải chi tiết tài liệu:", err);
        setError("Không thể tải chi tiết tài liệu.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, material, materialId]);

  const title = resolvedMaterial?.title || "Chi tiet tai lieu";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 6 }} component="div">
        <Typography variant="h6" fontWeight={700} component="h2">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : resolvedMaterial ? (
          <MaterialTypeViewer material={resolvedMaterial} />
        ) : (
          <Typography color="text.secondary">Khong co du lieu de hien thi.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
