import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FlagIcon from "@mui/icons-material/Flag";
import moderationService from "../../services/moderation";

type MaterialItem = {
  material_id: string;
  class_id: string;
  title: string;
  type?: string;
  dateCreate?: string;
  flagged?: boolean;
  description?: string;
  violations?: string[];
  status?: "pending" | "approved" | "rejected";
  is_ai_material?: boolean;
};

const ModeratorMaterialReview: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [classesMap, setClassesMap] = useState<Record<string, any>>({});
  const [teachersMap, setTeachersMap] = useState<Record<string, any>>({});
  const [classFilter, setClassFilter] = useState<string | "">("");
  const [showOnlyFlagged, setShowOnlyFlagged] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await moderationService.getMaterials(
          classFilter || undefined,
          showOnlyFlagged,
        );
        if (!mounted) return;
        // apply client-side text search
        const filtered = list.filter((m: any) =>
          searchText
            ? m.title.toLowerCase().includes(searchText.toLowerCase())
            : true,
        );
        setMaterials(filtered);
        // also load classes and teachers for name mapping
        try {
          const classes = await moderationService.getClasses();
          const classMap: Record<string, any> = {};
          (classes || []).forEach((c: any) => (classMap[c.class_id] = c));
          if (mounted) setClassesMap(classMap);
        } catch (e) {
          console.warn("Failed to load classes", e);
        }

        try {
          const teachers = await moderationService.getTeachers();
          const tmap: Record<string, any> = {};
          (teachers || []).forEach((t: any) => (tmap[t.id] = t));
          if (mounted) setTeachersMap(tmap);
        } catch (e) {
          console.warn("Failed to load teachers", e);
        }
      } catch (err) {
        console.warn(err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [classFilter, showOnlyFlagged, searchText]);

  const setLoading = (id: string, v: boolean) =>
    setLoadingIds((s) => ({ ...s, [id]: v }));

  const handleApprove = async (id: string) => {
    try {
      setLoading(id, true);
      await moderationService.approveMaterial(id);
      const list = await moderationService.getMaterials();
      setMaterials(list);
      setSnack({
        open: true,
        message: "Đã duyệt tài liệu.",
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt(
      "Lý do từ chối (tùy chọn):",
      "Vi phạm nội dung",
    );
    try {
      setLoading(id, true);
      await moderationService.rejectMaterial(id, reason || undefined);
      const list = await moderationService.getMaterials();
      setMaterials(list);
      setSnack({
        open: true,
        message: "Đã từ chối tài liệu.",
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  const handleToggleFlag = async (id: string, current: boolean | undefined) => {
    try {
      setLoading(id, true);
      await moderationService.flagMaterial(id, !current);
      const list = await moderationService.getMaterials();
      setMaterials(list);
      setSnack({
        open: true,
        message: `Đã ${!current ? "gắn cờ" : "bỏ cờ"} tài liệu.`,
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  const viewAttachments = async (id: string) => {
    // open the detail dialog which will also show attachments and violations
    openDetail(id);
  };

  // Detail dialog state
  const [selected, setSelected] = useState<MaterialItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Array<any>>([]);
  const [selectedSlides, setSelectedSlides] = useState<Record<string, any[]>>(
    {},
  );
  const [selectedRenders, setSelectedRenders] = useState<Record<string, any[]>>(
    {},
  );
  const openDetail = async (id: string) => {
    try {
      const m = await moderationService.getMaterialById(id);
      const files = await moderationService.getFilesForMaterial(id);
      setSelected(m);
      setSelectedFiles(files || []);
      // fetch slides and renders for each file
      const slidesMap: Record<string, any[]> = {};
      const rendersMap: Record<string, any[]> = {};
      for (const f of files || []) {
        try {
          const slides = await moderationService.getSlidesForFile(f.file_id);
          slidesMap[f.file_id] = slides || [];
        } catch (e) {
          slidesMap[f.file_id] = [];
        }
        try {
          const renders = await moderationService.getRendersForFile(f.file_id);
          rendersMap[f.file_id] = renders || [];
        } catch (e) {
          rendersMap[f.file_id] = [];
        }
      }
      setSelectedSlides(slidesMap);
      setSelectedRenders(rendersMap);
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi khi tải chi tiết: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setSelectedFiles([]);
  };

  const handleApproveFromDialog = async (id: string) => {
    try {
      setLoading(id, true);
      await moderationService.approveMaterial(id);
      const list = await moderationService.getMaterials();
      setMaterials(list);
      setSnack({
        open: true,
        message: "Đã duyệt tài liệu.",
        severity: "success",
      });
      closeDetail();
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  const handleRejectFromDialog = async (id: string) => {
    const reason = window.prompt(
      "Lý do từ chối (tùy chọn):",
      "Vi phạm nội dung",
    );
    try {
      setLoading(id, true);
      await moderationService.rejectMaterial(id, reason || undefined);
      const list = await moderationService.getMaterials();
      setMaterials(list);
      setSnack({
        open: true,
        message: "Đã từ chối tài liệu.",
        severity: "success",
      });
      closeDetail();
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  const handleFlagFromDialog = async (id: string, current?: boolean) => {
    try {
      setLoading(id, true);
      await moderationService.flagMaterial(id, !current);
      const list = await moderationService.getMaterials();
      setMaterials(list);
      if (selected) {
        // refresh selected details
        const m = await moderationService.getMaterialById(id);
        setSelected(m);
      }
      setSnack({
        open: true,
        message: `Đã ${!current ? "gắn cờ" : "bỏ cờ"} tài liệu.`,
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review materials
      </Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="class-filter-label">Lọc theo lớp</InputLabel>
            <Select
              labelId="class-filter-label"
              value={classFilter}
              label="Lọc theo lớp"
              onChange={(e) => setClassFilter(e.target.value as string)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {Object.values(classesMap).map((c: any) => (
                <MenuItem key={c.class_id} value={c.class_id}>
                  {c.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Tìm theo tiêu đề"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 260 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyFlagged}
                onChange={(e) => setShowOnlyFlagged(e.target.checked)}
              />
            }
            label="Chỉ hiển thị đã báo cáo"
          />
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {materials.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Không có tài liệu chờ duyệt.
          </Typography>
        )}

        {materials.map((m) => (
          <Card key={m.material_id} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                {classesMap[m.class_id]?.img_cover_link ? (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={classesMap[m.class_id].img_cover_link}
                      alt={`${classesMap[m.class_id]?.class_name ?? "class"} cover`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ) : (
                  <Avatar>{m.title?.[0]?.toUpperCase() ?? "M"}</Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight="bold">{m.title}</Typography>
                    <Chip label={m.type} size="small" />
                    {m.flagged && (
                      <Chip label="Đã báo cáo" color="warning" size="small" />
                    )}
                    <Chip label={m.status} size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Lớp: {classesMap[m.class_id]?.class_name ?? m.class_id}
                    {m.is_ai_material ? " (AI)" : ""}
                    {classesMap[m.class_id]?.teacher_id
                      ? ` — GV: ${teachersMap[classesMap[m.class_id].teacher_id]?.name ?? classesMap[m.class_id].teacher_id}`
                      : ""}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    title="Xem tệp"
                    onClick={() => viewAttachments(m.material_id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    title="Gắn/Bỏ cờ"
                    onClick={() => handleToggleFlag(m.material_id, m.flagged)}
                  >
                    <FlagIcon color={m.flagged ? "error" : "inherit"} />
                  </IconButton>
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    onClick={() => handleApprove(m.material_id)}
                    disabled={loadingIds[m.material_id]}
                  >
                    Duyệt
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleReject(m.material_id)}
                    disabled={loadingIds[m.material_id]}
                  >
                    Từ chối
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Detail dialog */}
      <Dialog open={!!selected} onClose={closeDetail} fullWidth maxWidth="sm">
        <DialogTitle>Chi tiết tài liệu</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6">{selected.title}</Typography>
              {selected.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selected.description}
                </Typography>
              )}

              {/* class and teacher info */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Lớp:{" "}
                {classesMap[selected.class_id]?.class_name ?? selected.class_id}
                {classesMap[selected.class_id]?.teacher_id
                  ? ` — GV: ${teachersMap[classesMap[selected.class_id].teacher_id]?.name ?? classesMap[selected.class_id].teacher_id}`
                  : ""}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2">Các vấn đề / vi phạm</Typography>
              {selected.violations && selected.violations.length > 0 ? (
                <List dense>
                  {selected.violations.map((v, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={v} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có vi phạm rõ ràng.
                </Typography>
              )}

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2">Tệp đính kèm</Typography>
              {selectedFiles.length > 0 ? (
                <List dense>
                  {selectedFiles.map((f: any) => (
                    <Box key={f.file_id} sx={{ mb: 1 }}>
                      <ListItem
                        secondaryAction={
                          <Button
                            size="small"
                            onClick={() =>
                              f.file_path && window.open(f.file_path, "_blank")
                            }
                          >
                            Mở
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={f.file_name}
                          secondary={f.file_path}
                        />
                      </ListItem>

                      {/* Slides preview (if any) */}
                      {selectedSlides[f.file_id] &&
                        selectedSlides[f.file_id].length > 0 && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ px: 2, pt: 1, flexWrap: "wrap" }}
                          >
                            {selectedSlides[f.file_id].map((s: any) => (
                              <Box
                                key={s.slide_id}
                                sx={{
                                  width: 120,
                                  height: 90,
                                  overflow: "hidden",
                                  borderRadius: 1,
                                  border: "1px solid #eee",
                                }}
                              >
                                {/* image preview */}
                                {s.file_path ? (
                                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                  <img
                                    src={s.file_path}
                                    alt={`slide-${s.slide_id}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : null}
                              </Box>
                            ))}
                          </Stack>
                        )}

                      {/* Renders preview (if any) */}
                      {selectedRenders[f.file_id] &&
                        selectedRenders[f.file_id].length > 0 && (
                          <Box sx={{ px: 2, pt: 1 }}>
                            {selectedRenders[f.file_id].map((r: any) => (
                              <Box key={r.render_id} sx={{ mb: 1 }}>
                                <Typography variant="caption">
                                  Render {r.render_id}
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    maxHeight: 140,
                                    overflow: "auto",
                                    bgcolor: "#fafafa",
                                    p: 1,
                                    borderRadius: 1,
                                  }}
                                >
                                  {typeof r.render_data === "string"
                                    ? r.render_data
                                    : JSON.stringify(r.render_data, null, 2)}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có tệp đính kèm.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selected && (
            <>
              <Button
                onClick={() =>
                  handleFlagFromDialog(selected.material_id, selected.flagged)
                }
                color={selected.flagged ? "warning" : "error"}
              >
                {selected.flagged ? "Bỏ cờ" : "Gắn cờ"}
              </Button>
              <Button
                onClick={() => handleRejectFromDialog(selected.material_id)}
                color="error"
              >
                Từ chối
              </Button>
              <Button
                onClick={() => handleApproveFromDialog(selected.material_id)}
                color="success"
                variant="contained"
              >
                Duyệt
              </Button>
            </>
          )}
          <Button onClick={closeDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorMaterialReview;
