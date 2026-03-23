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
import {
    pageTitle,
    sectionLabel,
    flatCard,
    flatButtonContained,
    flatButtonOutlined,
    flatChip,
    statusColors,
    loadingContainer,
    COLORS,
    RADIUS,
} from "./teacherStyles";

// ─── Type helpers ──────────────────────────────────────────────────────────────

const TYPE_META: Record<
    ClassMaterialType,
    { label: string; bg: string; text: string; icon: ReactElement }
> = {
    file: {
        label: "File",
        bg: COLORS.infoBg,
        text: COLORS.info,
        icon: <Description fontSize="small" />,
    },
    slide: {
        label: "Slide",
        bg: COLORS.accentLight,
        text: COLORS.accent,
        icon: <Slideshow fontSize="small" />,
    },
    "2d_render": {
        label: "2D Render",
        bg: "#F5F3FF",
        text: "#7C3AED",
        icon: <ViewInAr fontSize="small" />,
    },
    quiz: {
        label: "Quiz",
        bg: COLORS.warningBg,
        text: COLORS.warning,
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

            const mat = await classMaterialApi.getMaterialById(materialId);
            console.log('Material data:', mat);

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

    useEffect(() => {
        fetchMaterial();
    }, [materialId]);

    if (loading) {
        return (
            <Box sx={loadingContainer}>
                <CircularProgress sx={{ color: COLORS.accent }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        borderRadius: RADIUS,
                        border: `1px solid ${COLORS.error}`,
                        boxShadow: "none",
                    }}
                >
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    sx={flatButtonOutlined}
                >
                    Quay lại lớp học
                </Button>
            </Box>
        );
    }

    // Material not found
    if (!material) {
        return (
            <Box>
                <Alert
                    severity="warning"
                    sx={{
                        mb: 2,
                        borderRadius: RADIUS,
                        border: `1px solid ${COLORS.warning}`,
                        boxShadow: "none",
                    }}
                >
                    Không tìm thấy tài liệu
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/teacher/class/${classId}`)}
                    sx={flatButtonOutlined}
                >
                    Quay lại lớp học
                </Button>
            </Box>
        );
    }

    const meta = TYPE_META[material.type];
    const statusKey = material.status as keyof typeof statusColors;
    const sColors = statusColors[statusKey] || { bg: COLORS.bg, text: COLORS.textSecondary };

    // ─── Handlers ────────────────────────────────────────────────────────────────

    const handleSave = async (updated: ClassMaterial) => {
        try {
            if (!materialId) return;

            let contentId: string | undefined;
            if (updated.content && typeof updated.content === 'object' && '_id' in updated.content) {
                contentId = (updated.content as any)._id;
            }

            await classMaterialApi.updateMaterial(materialId, {
                title: updated.title,
                type: updated.type,
                status: updated.status,
                order_num: updated.order_num,
                is_ai_material: updated.is_ai_material,
                content_id: contentId,
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
            const updatedMaterial = {
                ...material,
                dateUpdate: new Date(),
                content: {
                    ...(material.content as QuizType),
                    questions,
                },
            };

            setMaterial(updatedMaterial);
        } catch (error) {
            console.error('Error updating quiz questions:', error);
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
                    sx={{
                        ...flatButtonOutlined,
                        borderColor: "transparent",
                        "&:hover": {
                            borderColor: COLORS.border,
                            bgcolor: COLORS.accentLight,
                            boxShadow: "none",
                        },
                    }}
                >
                    Quay lại lớp học
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditOpen(true)}
                        sx={flatButtonOutlined}
                    >
                        Cập nhật
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => setDeleteConfirmOpen(true)}
                        sx={{
                            ...flatButtonOutlined,
                            borderColor: COLORS.error,
                            color: COLORS.error,
                            "&:hover": {
                                bgcolor: COLORS.errorBg,
                                borderColor: COLORS.error,
                                boxShadow: "none",
                            },
                        }}
                    >
                        Xoá
                    </Button>
                </Stack>
            </Stack>

            {/* ── Main card ── */}
            <Paper elevation={0} sx={flatCard}>
                {/* Section label */}
                <Typography sx={sectionLabel}>Material Detail</Typography>

                {/* Title row */}
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    <Box sx={{ color: meta.text }}>{meta.icon}</Box>
                    <Typography sx={{ ...pageTitle, fontSize: "1.5rem" }}>
                        {material.title}
                    </Typography>
                    <Chip
                        label={meta.label}
                        size="small"
                        icon={meta.icon}
                        sx={flatChip(meta.bg, meta.text)}
                    />
                    {sColors && (
                        <Chip
                            label={material.is_ai_material ? `${material.status} · AI` : material.status}
                            size="small"
                            icon={material.is_ai_material ? <SmartToy fontSize="small" /> : undefined}
                            sx={flatChip(sColors.bg, sColors.text)}
                        />
                    )}
                </Stack>

                <Stack direction="row" spacing={3} mb={3}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textSecondary }}>
                        Được tạo: {formatDate(material.dateCreate)}
                    </Typography>
                    {material.dateUpdate && (
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textSecondary }}>
                            Cập nhật: {formatDate(material.dateUpdate)}
                        </Typography>
                    )}
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textSecondary }}>
                        Thứ tự #{material.order_num}
                    </Typography>
                </Stack>

                <Divider sx={{ mb: 3, borderColor: COLORS.borderLight }} />

                <MaterialTypeViewer
                    material={material}
                    onQuestionsChange={
                        material.type === "quiz" ? handleQuestionsChange : undefined
                    }
                />
            </Paper>

            <MaterialEditModal
                open={editOpen}
                material={material}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
            />

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: RADIUS,
                        border: `1px solid ${COLORS.border}`,
                        boxShadow: "none",
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: COLORS.textDark }}>
                    Xoá tài liệu?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: COLORS.textSecondary }}>
                        Bạn có chắc chắn muốn xoá <strong>{material.title}</strong>? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        sx={flatButtonOutlined}
                    >
                        Huỷ
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDelete}
                        sx={{
                            ...flatButtonContained,
                            bgcolor: COLORS.error,
                            "&:hover": {
                                bgcolor: "#DC2626",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Xoá
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
