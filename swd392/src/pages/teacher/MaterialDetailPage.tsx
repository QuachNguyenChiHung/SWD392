import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Chip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {
    ArrowBack,
    Edit,
    Delete,
    Description,
    Slideshow,
    ViewInAr,
    Quiz,
    SmartToy,
} from "@mui/icons-material";
import { useState } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, Quiz as QuizType, Question } from "../../types/teacherType";
import MaterialTypeViewer from "../../components/MaterialTypeViewer";
import MaterialEditModal from "../../components/MaterialEditModal";

// ─── Type helpers ──────────────────────────────────────────────────────────────

const TYPE_META: Record<
    ClassMaterialType,
    { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"; icon: ReactElement }
> = {
    file: {
        label: "File",
        color: "info",
        icon: <Description fontSize="small" />,
    },
    slide: {
        label: "Slide",
        color: "primary",
        icon: <Slideshow fontSize="small" />,
    },
    "2d_render": {
        label: "2D Render",
        color: "secondary",
        icon: <ViewInAr fontSize="small" />,
    },
    quiz: {
        label: "Quiz",
        color: "warning",
        icon: <Quiz fontSize="small" />,
    },
};

const formatDate = (d: Date | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaterialDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { classId } = useParams<{ classId: string }>();

    // Material is passed via router state from the list
    const [material, setMaterial] = useState<ClassMaterial>(
        location.state?.material as ClassMaterial
    );

    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!material) {
        return (
            <Box p={4}>
                <Typography variant="h6" color="error">
                    Không tìm thấy dữ liệu tài liệu. Vui lòng quay lại và chọn tài liệu khác.
                </Typography>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    sx={{ mt: 2 }}
                >
                    Quay lại
                </Button>
            </Box>
        );
    }

    const meta = TYPE_META[material.type];

    // ─── Handlers ────────────────────────────────────────────────────────────────

    const handleSave = (updated: ClassMaterial) => {
        setMaterial(updated);
        // TODO: call API to persist changes
    };

    const handleQuestionsChange = (questions: Question[]) => {
        setMaterial((prev) => ({
            ...prev,
            dateUpdate: new Date(),
            content: {
                ...(prev.content as QuizType),
                questions,
            },
        }));
        // TODO: call API to persist question changes
    };

    const handleDelete = () => {
        setDeleteConfirmOpen(false);
        // TODO: call API to delete material
        navigate(`/teacher/class/${classId}`);
    };

    // ─── Render ───────────────────────────────────────────────────────────────────

    return (
        <Box>
            {/* ── Back + actions header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(`/teacher/class/${classId}`)}
                >
                    Quay lại lớp học
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditOpen(true)}
                    >
                        Cập nhật
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteConfirmOpen(true)}
                    >
                        Xoá
                    </Button>
                </Stack>
            </Stack>

            {/* ── Main card ── */}
            <Paper sx={{ p: 4 }}>
                {/* Title row */}
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    {meta.icon}
                    <Typography variant="h5" fontWeight={700}>
                        {material.title}
                    </Typography>
                    <Chip
                        label={meta.label}
                        color={meta.color}
                        size="small"
                        icon={meta.icon}
                    />
                    {material.is_ai_material && (
                        <Chip
                            label="AI generated"
                            color="success"
                            size="small"
                            icon={<SmartToy fontSize="small" />}
                        />
                    )}
                </Stack>

                {/* Meta row */}
                <Stack direction="row" spacing={3} mb={3}>
                    <Typography variant="caption" color="text.secondary">
                        Được tạo : {formatDate(material.dateCreate)}
                    </Typography>
                    {material.dateUpdate && (
                        <Typography variant="caption" color="text.secondary">
                            Cập nhật lần cuối: {formatDate(material.dateUpdate)}
                        </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                        Thứ tự #{material.order_num}
                    </Typography>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {/* Type-specific viewer */}
                <MaterialTypeViewer
                    material={material}
                    onQuestionsChange={
                        material.type === "quiz" ? handleQuestionsChange : undefined
                    }
                />
            </Paper>

            {/* ── Edit modal ── */}
            <MaterialEditModal
                open={editOpen}
                material={material}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
            />

            {/* ── Delete confirmation dialog ── */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Xoá tài liệu?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xoá <strong>{material.title}</strong>? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Huỷ</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        Xoá
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
