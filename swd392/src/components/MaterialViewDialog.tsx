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
      .then((data) => {
        if (cancelled) return;
        setResolvedMaterial(resolveApiMaterial(data));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Khong the tai chi tiet tai lieu.");
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
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" fontWeight={700}>
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
