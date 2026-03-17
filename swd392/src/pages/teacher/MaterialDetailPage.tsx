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
    CircularProgress,
    Alert,
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
import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, Quiz as QuizType, Question } from "../../types/teacherType";
import MaterialTypeViewer from "../../components/MaterialTypeViewer";
import MaterialEditModal from "../../components/MaterialEditModal";
import { fileApiService } from "../../services/teacherApi/materialApi/fileApi";
import { quizApiService } from "../../services/teacherApi/materialApi/quizApi";
import { questionApiService } from "../../services/teacherApi/materialApi/questionApi";
import classMaterialApi from "../../services/teacherApi/classMaterialApi";
import { slideApiService } from "../../services/teacherApi/materialApi";

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
    const { classId, materialId } = useParams<{ classId: string; materialId: string }>();

    // State management
    const [material, setMaterial] = useState<ClassMaterial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const fetchMaterial = async () => {
        if (!materialId) {
            setError("Material ID is required");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Use navigation state or fetch from API
            const mat = material ?? await classMaterialApi.getMaterialById(materialId);
            console.log('Material data:', mat);

            // content_id is a string reference from the backend, not an embedded object
            const contentId = (mat as any).content_id as string | undefined;

            if (contentId) {
                switch (mat.type) {
                    case "file": {
                        const fileData = await fileApiService.getFileById(contentId);
                        setMaterial({ ...mat, content: fileData });
                        break;
                    }
                    case "slide": {
                        const slideData = await slideApiService.getSlideById(contentId);
                        setMaterial({ ...mat, content: slideData });
                        break;
                    }
                    case "quiz": {
                        const quizData = await quizApiService.getQuizById(contentId);
                        const questionData = await questionApiService.getQuestionsByQuizId(contentId);
                        setMaterial({ ...mat, content: { ...quizData, questions: questionData } });
                        break;
                    }
                    default:
                        setMaterial(mat);
                }
            } else {
                setMaterial(mat);
            }
        } catch (err) {
            console.error('Error fetching material:', err);
            setError('Không thể tải thông tin tài liệu');
        } finally {
            setLoading(false);
        }
    };

    // Fetch material by ID (skip if already loaded from location state)
    useEffect(() => {


        fetchMaterial();
    }, [materialId]);

    // Loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box p={4}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    variant="outlined"
                >
                    Quay lại lớp học
                </Button>
            </Box>
        );
    }

    // Material not found
    if (!material) {
        return (
            <Box p={4}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Không tìm thấy tài liệu
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    variant="outlined"
                >
                    Quay lại lớp học
                </Button>
            </Box>
        );
    }

    const meta = TYPE_META[material.type];

    // ─── Handlers ────────────────────────────────────────────────────────────────

    const handleSave = async (updated: ClassMaterial) => {
        try {
            if (!materialId) return;

            // Extract content_id from the updated content
            let contentId: string | undefined;
            if (updated.content && typeof updated.content === 'object' && '_id' in updated.content) {
                contentId = (updated.content as any)._id;
            }

            await classMaterialApi.updateMaterial(materialId, {
                title: updated.title,
                type: updated.type,
                order_num: updated.order_num,
                is_ai_material: updated.is_ai_material,
                content_id: contentId, // Pass the updated content_id
            });

            setMaterial(updated);
            setEditOpen(false);
        } catch (error) {
            console.error('Error updating material:', error);
            alert('Có lỗi xảy ra khi cập nhật tài liệu');
        }
    };

    const handleQuestionsChange = async (questions: Question[]) => {
        if (!material || !materialId) return;

        try {
            // Update local state optimistically
            const updatedMaterial = {
                ...material,
                dateUpdate: new Date(),
                content: {
                    ...(material.content as QuizType),
                    questions,
                },
            };

            setMaterial(updatedMaterial);
            // TODO: Persist question changes via a dedicated quiz/question API endpoint
        } catch (error) {
            console.error('Error updating quiz questions:', error);
            // Revert the local state change on error
            setMaterial(material);
            alert('Có lỗi xảy ra khi cập nhật câu hỏi');
        }
    };

    const handleDelete = async () => {
        try {
            if (!materialId) return;

            await classMaterialApi.deleteMaterial(materialId);
            setDeleteConfirmOpen(false);
            navigate(`/teacher/class/${classId}`);
        } catch (error) {
            console.error('Error deleting material:', error);
            alert('Có lỗi xảy ra khi xóa tài liệu');
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────────

    return (
        <Box>
            {/* ── Back + actions header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    variant="text"
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
                    {/* status: 'published' | 'draft' | 'reviewed' | 'deleted' */}
                    {material.status=='deleted' && (
                        <Chip
                            label="Đã xoá"
                            color="error"
                            size="small"
                        />
                    )}
                    {material.status=='draft' && (
                        <Chip
                            label="Bản nháp"
                            color="secondary"
                            size="small"
                        />
                    )}
                    {material.status=='reviewed' && (
                        <Chip
                            label="Đã duyệt"
                            color="info"
                            size="small"
                        />
                    )}
                    {material.status=='published' && (
                        <Chip
                            label="Đã xuất bản"
                            color="success"
                            size="small"
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
