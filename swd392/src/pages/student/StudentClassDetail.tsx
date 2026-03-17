import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Stack, Paper, Button, Chip, Skeleton, Grid, Divider,
    LinearProgress, Alert, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions,
    Fab, IconButton
} from '@mui/material';
import {
    ArrowBack, MenuBook, CalendarToday, CheckCircle, SmartToy, Close
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Topic, Enrollment } from '../../types/studentType';
import ClassTopicsTab from '../../components/student/ClassTopicsTab';
import ClassMaterialsTab from '../../components/student/ClassMaterialsTab';
import ClassRender2D from '../../components/student/ClassRender2D';
import StudentAIChat from '../../components/student/StudentAIChatBox';

interface FileItem {
    _id: string;
    file_name: string;
    file_path: string;
}

interface Slide {
    _id: string;
    slide_name: string;
    file_path: string;
}

interface ProgressRecord {
    _id: string;
    enroll_id: string;
    classmaterial_id: string;
    completion_status: 'completed' | 'in_progress';
    date_completed: string | null;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const getEnrollClassId = (enrollment: Enrollment): string => {
    if (typeof enrollment.class_id === 'object' && enrollment.class_id !== null) {
        return (enrollment.class_id as any)._id;
    }
    return enrollment.class_id as string;
};

export default function StudentClassDetail() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    const [cls, setCls] = useState<ClassItem | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [courseName, setCourseName] = useState('');
    const [gradeLevel, setGradeLevel] = useState<number | undefined>(undefined);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
    const [render2dIds, setRender2dIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [expandedTopic, setExpandedTopic] = useState<string | false>(false);
    const [previewItem, setPreviewItem] = useState<{ file: FileItem | Slide; type: 'file' | 'slide' } | null>(null);
    const [chatOpen, setChatOpen] = useState(false);

    // completedMaterials = list of classmaterial_id that are completed
    const completedMaterials = useMemo(() => {
        return progressRecords
            .filter(p => p.completion_status === 'completed')
            .map(p => p.classmaterial_id);
    }, [progressRecords]);
    // Note: progressStats uses allMaterialIds to filter correctly

    // Progress stats — only count materials (files + slides). Exclude 2D renders (placeholder)
    const allMaterialIds = useMemo(() => [
        ...files.map(f => f._id),
        ...slides.map(s => s._id),
    ], [files, slides]);

    const progressStats = useMemo(() => {
        const total = allMaterialIds.length;
        const completed = progressRecords.filter(
            p => p.completion_status === 'completed' && allMaterialIds.includes(p.classmaterial_id)
        ).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    }, [progressRecords, allMaterialIds]);

    useEffect(() => {
        if (!classId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Get class details
                const classData: ClassItem = await apiService.get(`/class/${classId}`);
                setCls(classData);

                // 2. Get topics
                if (classData.course_id) {
                    try {
                        const courseData: any = await apiService.get(
                            `/topics/course/${classData.course_id}?page=1`
                        );
                        setTopics(courseData?.topics || []);
                        setCourseName(courseData?.course_name || '');
                        setGradeLevel(courseData?.grade_level);
                    } catch (err) {
                        console.warn('Failed to fetch topics:', err);
                    }
                }

                // 3. Get materials + fetch file_path from /files or /slides
                try {
                    const materialsData: any[] = await apiService.get(
                        `/class-materials?class_id=${classId}`
                    );

                    const fileItems: FileItem[] = [];
                    const slideItems: Slide[] = [];
                    const render2dList: string[] = [];

                    await Promise.all(materialsData.map(async (m) => {
                        if (m.type === '2d_render') {
                            render2dList.push(m._id);
                            return;
                        }
                        // Skip quiz type - handled separately
                        if (m.type === 'quiz') return;
                        const isSlide = m.type === 'slide' || m.type === 'slides';
                        // Skip nếu content_id là null
                        if (!m.content_id) {
                            if (isSlide) {
                                slideItems.push({ _id: m._id, slide_name: m.title, file_path: '' });
                            } else {
                                fileItems.push({ _id: m._id, file_name: m.title, file_path: '' });
                            }
                            return;
                        }
                        try {
                            if (isSlide) {
                                const slideData: any = await apiService.get(`/slides/${m.content_id}`);
                                slideItems.push({
                                    _id: m._id,
                                    slide_name: m.title,
                                    file_path: slideData?.file_path || ''
                                });
                            } else {
                                const fileData: any = await apiService.get(`/files/${m.content_id}`);
                                fileItems.push({
                                    _id: m._id,
                                    file_name: m.title,
                                    file_path: fileData?.file_path || ''
                                });
                            }
                        } catch {
                            // fallback nếu fetch content thất bại (404, etc)
                            if (isSlide) {
                                slideItems.push({ _id: m._id, slide_name: m.title, file_path: '' });
                            } else {
                                fileItems.push({ _id: m._id, file_name: m.title, file_path: '' });
                            }
                        }
                    }));

                    setFiles(fileItems);
                    setSlides(slideItems);
                    setRender2dIds(render2dList);
                } catch (err) {
                    console.warn('Failed to fetch materials:', err);
                }

                // 4. Get enrollment
                try {
                    const enrollmentsData: Enrollment[] = await apiService.get('/enroll/student');
                    const classEnrollment = enrollmentsData.find(
                        e => getEnrollClassId(e) === classId
                    );
                    if (classEnrollment) {
                        setEnrollment(classEnrollment);

                        // 5. Get progress — API returns array directly
                        try {
                            const progressData: ProgressRecord[] = await apiService.get(
                                `/progress/${classEnrollment._id}`
                            );
                            const records = Array.isArray(progressData) ? progressData : [];
                            setProgressRecords(records);

                            // Note: PATCH /enroll/{id}/completed is Teacher-only
                            // enrollment status update handled by backend
                        } catch (err) {
                            console.warn('Failed to fetch progress:', err);
                        }
                    }
                } catch (err) {
                    console.warn('Failed to fetch enrollment:', err);
                }
            } catch (err: any) {
                setError(err.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classId]);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

    const handleExpandTopic = (topicId: string) => {
        setExpandedTopic(prev => prev === topicId ? false : topicId);
    };

    const handleMarkMaterialCompleted = async (item: FileItem | Slide, type: 'file' | 'slide') => {
        if (!classId || !enrollment) return;

        // Đã completed rồi thì không làm gì
        if (completedMaterials.includes(item._id)) return;

        try {
            // Create progress record (ignore if already exists)
            try {
                await apiService.post(`/progress/${classId}/${item._id}`, {});
            } catch (err: any) {
                const errorMessage = err.response?.data?.error || '';
                if (!errorMessage.includes('already exists')) throw err;
            }

            // Mark as completed
            await apiService.patch(`/progress/${classId}/${item._id}/completed`);

            // Refresh progress
            const freshRecords: ProgressRecord[] = await apiService.get(
                `/progress/${enrollment._id}`
            );
            const records = Array.isArray(freshRecords) ? freshRecords : [];
            setProgressRecords(records);

            // Note: enrollment status update is Teacher-only, handled by backend
        } catch (err: any) {
            console.error('Failed to mark material as completed:', err);
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" height={40} width="20%" sx={{ mb: 3 }} />
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Stack direction="row" spacing={2}>
                        <Skeleton variant="rounded" width={80} height={80} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton width="60%" />
                            <Skeleton width="40%" />
                        </Box>
                    </Stack>
                </Paper>
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
                ))}
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/student/classes')} sx={{ mb: 3 }}>
                    Quay lại
                </Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const isCompleted = enrollment?.status === 'completed';

    return (
        <Box>
            <Stack direction="row" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/student/classes')}
                    sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                >
                    Quay lại
                </Button>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {cls && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Stack direction="row" spacing={3} alignItems="center">
                                <Box sx={{
                                    width: 100, height: 100, borderRadius: 2,
                                    bgcolor: '#f1f5f9', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', flexShrink: 0
                                }}>
                                    {cls.img_cover_link ? (
                                        <img
                                            title={cls.class_name}
                                            src={cls.img_cover_link}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <MenuBook sx={{ fontSize: 50, color: '#6366f1' }} />
                                    )}
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {cls.class_name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" alignItems="center">
                                        <Chip
                                            label={isCompleted ? 'Hoàn thành' : 'Đang học'}
                                            size="small"
                                            sx={{
                                                bgcolor: isCompleted ? '#d1fae5' : '#dbeafe',
                                                color: isCompleted ? '#065f46' : '#1d4ed8',
                                                fontWeight: 700
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography sx={{ mr: 0.5 }}>Ngày tạo:</Typography> {formatDate(cls.date_create)}
                                        </Typography>
                                    </Stack>
                                    {cls.keywords && (
                                        <Typography variant="body2" color="text.secondary">
                                            {cls.keywords}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>

                            {progressStats.total > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Tiến độ học tập</Typography>
                                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                            {progressStats.percentage}% ({progressStats.completed}/{progressStats.total})
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progressStats.percentage}
                                        sx={{
                                            height: 8, borderRadius: 4, bgcolor: '#e5e7eb',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: progressStats.percentage === 100 ? '#10b981' : '#6366f1'
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </Paper>
                    )}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
                            <Tab label={`Nội dung khóa học`} />
                            <Tab label={`Tài liệu & Slide`} />
                            {render2dIds.length > 0 && <Tab label={`2D Render`} />}
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <ClassTopicsTab
                            courseName={courseName}
                            gradeLevel={gradeLevel}
                            topics={topics}
                            expandedTopic={expandedTopic}
                            onExpandTopic={handleExpandTopic}
                        />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <ClassMaterialsTab
                            files={files}
                            slides={slides}
                            onPreview={(item, type) => setPreviewItem({ file: item, type })}
                            onMarkCompleted={handleMarkMaterialCompleted}
                            completedMaterials={completedMaterials}
                            isLoading={false}
                        />
                    </TabPanel>

                    {render2dIds.length > 0 && (
                        <TabPanel value={tabValue} index={2}>
                            <ClassRender2D materialIds={render2dIds} />
                        </TabPanel>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, mb: 2, bgcolor: '#f8fafc' }}>
                        <Typography fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                            Thông tin lớp học
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Mã lớp</Typography>
                                <Typography variant="body2" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                                    {classId}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Chủ đề</Typography>
                                <Typography variant="body2" fontWeight="600">{topics.length} chủ đề</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Tài liệu & Slide</Typography>
                                <Typography variant="body2" fontWeight="600">{files.length + slides.length} tài liệu</Typography>
                            </Box>

                            {enrollment && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Ngày tham gia</Typography>
                                        <Typography variant="body2" fontWeight="600">
                                            {formatDate(enrollment.date_join)}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </Paper>

                    <Stack spacing={2}>
                        <Button
                            fullWidth variant="outlined" color="inherit"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                            onClick={() => setTabValue([0, 1, 2].find(i => i !== tabValue) || 0)}
                        >
                            Bắt đầu học
                        </Button>
                        <Button
                            fullWidth variant="outlined" color="inherit"
                            onClick={() => navigate('/student/classes')}
                        >
                            Quay về danh sách lớp
                        </Button>
                    </Stack>
                </Grid>
            </Grid>

            {/* Preview Dialog */}
            <Dialog
                open={!!previewItem}
                onClose={() => setPreviewItem(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle fontWeight="bold">
                    {previewItem ? (
                        previewItem.type === 'file'
                            ? (previewItem.file as FileItem).file_name
                            : (previewItem.file as Slide).slide_name
                    ) : 'Preview'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Loại: {previewItem?.type === 'file' ? 'Tài liệu' : 'Slide'}
                        </Typography>
                        {previewItem && previewItem.file.file_path && (
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                                <Typography variant="body2" gutterBottom>Liên kết:</Typography>
                                <Typography
                                    component="a"
                                    href={previewItem.file.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: '#6366f1', textDecoration: 'none', wordBreak: 'break-all', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    {previewItem.file.file_path}
                                </Typography>
                            </Box>
                        )}
                        {previewItem && !previewItem.file.file_path && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Tài liệu này chưa có file đính kèm
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewItem(null)}>Đóng</Button>
                    {previewItem?.file.file_path && (
                        <Button
                            variant="contained"
                            component="a"
                            href={previewItem.file.file_path}
                            download
                            target="_blank"
                        >
                            Tải về
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Floating AI Chat Button */}
            <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}>
                {chatOpen && (
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'absolute', bottom: 64, right: 0,
                            width: 380, height: 560, borderRadius: 3,
                            overflow: 'hidden', display: 'flex', flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <StudentAIChat />
                        </Box>
                    </Paper>
                )}
                <Fab
                    color="primary"
                    onClick={() => setChatOpen(prev => !prev)}
                    sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
                >
                    {chatOpen ? <Close /> : <SmartToy />}
                </Fab>
            </Box>
        </Box>
    );
}