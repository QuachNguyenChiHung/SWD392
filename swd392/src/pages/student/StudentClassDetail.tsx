

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Stack, Paper, Button, Chip, Skeleton, Grid, Divider,
    LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Fab, Snackbar
} from '@mui/material';
import {
    ArrowBack, MenuBook, CalendarToday, CheckCircle, SmartToy, Close
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Topic, Enrollment } from '../../types/studentType';
import ClassTopicsTab from '../../components/student/ClassTopicsTab';
import StudentAIChat from '../../components/student/StudentAIChatBox';
import FileViewer from '../../components/materialViewers/FileViewer';
import SlideViewer from '../../components/materialViewers/SlideViewer';

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

interface QuizItem {
    _id: string;
    title: string;
    content_id?: string;
    topic_id?: string;
}

interface ProgressRecord {
    _id: string;
    enroll_id: string;
    classmaterial_id: string;
    completion_status: 'completed' | 'in_progress';
    date_completed: string | null;
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
    const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
    const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
    const [allMaterials, setAllMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTopic, setExpandedTopic] = useState<string | false>(false);
    const [previewItem, setPreviewItem] = useState<{ file: FileItem | Slide; type: 'file' | 'slide' } | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [flagMessage, setFlagMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [isContentFitInOne, setIsContentFitInOne] = useState(true);

    // completedMaterials = list of classmaterial_id that are completed
    const completedMaterials = useMemo(() => {
        const quizMaterialIds = quizzes.map(q => q._id);
        
        // Exclude quizzes from generic progress records to prevent old "Mark Complete" clicks from skewing progress
        const fromProgress = progressRecords
            .filter(p => p.completion_status === 'completed' && !quizMaterialIds.includes(p.classmaterial_id))
            .map(p => p.classmaterial_id);
            
        const fromQuizzes = quizzes
            .filter(q => quizAttempts.some(a => {
                const qId = typeof a.quiz_id === 'object' ? a.quiz_id._id : a.quiz_id;
                return qId === q.content_id;
            }))
            .map(q => q._id);

        return [...fromProgress, ...fromQuizzes];
    }, [progressRecords, quizzes, quizAttempts]);
    // Note: progressStats uses allMaterialIds to filter correctly

    // Progress stats — only count materials that belong to this class
    const allMaterialIds = useMemo(() => [
        ...allMaterials
            .filter(m => m.type !== '2d_render')
            .map(m => m._id),
    ], [allMaterials]);

    const progressStats = useMemo(() => {
        const total = allMaterialIds.length;
        const completed = completedMaterials.filter(id => allMaterialIds.includes(id)).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    }, [completedMaterials, allMaterialIds]);

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
                    const quizItems: QuizItem[] = [];
                    const render2dList: string[] = [];

                    await Promise.all(materialsData.map(async (m) => {
                        if (m.type === '2d_render') {
                            render2dList.push(m._id);
                            return;
                        }
                        if (m.type === 'quiz') {
                            quizItems.push({
                                _id: m._id,
                                title: m.title,
                                content_id: m.content_id,
                                topic_id: m.topic_id,
                            });
                            return;
                        }
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
                    setQuizzes(quizItems);

                    // Build allMaterials with resolved file_path for ClassTopicsTab
                    const resolvedMaterials = await Promise.all(materialsData.map(async (m) => {
                        if (m.type === 'quiz') return { _id: m._id, title: m.title, type: m.type, topic_id: m.topic_id, content_id: m.content_id, file_path: '', status: m.status, isFlagged: m.isFlagged, isFlaggable: m.isFlaggable };
                        if (m.type === '2d_render') return { _id: m._id, title: m.title, type: m.type, topic_id: m.topic_id, file_path: '', status: m.status, isFlagged: m.isFlagged, isFlaggable: m.isFlaggable };
                        if (!m.content_id) return { _id: m._id, title: m.title, type: m.type, topic_id: m.topic_id, file_path: '', status: m.status, isFlagged: m.isFlagged, isFlaggable: m.isFlaggable };
                        try {
                            const isSlide = m.type === 'slide' || m.type === 'slides';
                            const data: any = await apiService.get(isSlide ? `/slides/${m.content_id}` : `/files/${m.content_id}`);
                            return { _id: m._id, title: m.title, type: m.type, topic_id: m.topic_id, file_path: data?.file_path || '', status: m.status, isFlagged: m.isFlagged, isFlaggable: m.isFlaggable };
                        } catch {
                            return { _id: m._id, title: m.title, type: m.type, topic_id: m.topic_id, file_path: '', status: m.status, isFlagged: m.isFlagged, isFlaggable: m.isFlaggable };
                        }
                    }));
                    setAllMaterials(resolvedMaterials.filter(Boolean));
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

                        // 5. Get progress
                        try {
                            const progressData: ProgressRecord[] = await apiService.get(
                                `/progress/${classEnrollment._id}`
                            );
                            const records = Array.isArray(progressData) ? progressData : [];
                            setProgressRecords(records);
                        } catch (err) {
                            console.warn('Failed to fetch progress:', err);
                        }
                        
                        // 6. Get quiz attempts
                        try {
                            const myAttempts: any[] = await apiService.get('/my-quiz-attempts');
                            const attemptsData = myAttempts.map(item => item.attempt);
                            setQuizAttempts(attemptsData);
                        } catch (err) {
                            console.warn('Failed to fetch quiz attempts:', err);
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

    const handleMarkMaterialCompleted = async (item: FileItem | Slide, _type: 'file' | 'slide' | 'quiz') => {
        if (!classId || !enrollment) return;

        // Đã completed rồi thì không làm gì
        if (completedMaterials.includes(item._id)) return;

        try {
            // Create progress record (ignore if already exists)
            try {
                await apiService.post(`/progress/${classId}/${item._id}`, {});
            } catch (err: any) {
                /* ignore already exists */
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
        } catch {
            // Ignore errors for mark complete
        }
    };

    const handleFlagMaterial = async (mat: any) => {
        if (!classId) return;
        try {
            const response = await apiService.patch(`/class-materials/${mat._id}/flag`, {});
            console.log('Flag response:', response);
            setAllMaterials(prev => prev.map(m => m._id === mat._id ? { ...m, isFlagged: true } : m));
            setFlagMessage({ type: 'success', text: 'Báo cáo thành công!' });
        } catch (err: any) {
            console.error('Failed to flag material:', err);
            setFlagMessage({ type: 'error', text: err.message || 'Báo cáo thất bại' });
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
                                            <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                                            {formatDate(cls.date_create)}
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

                    <ClassTopicsTab
                        courseName={courseName}
                        gradeLevel={gradeLevel}
                        topics={topics}
                        materials={allMaterials}
                        completedMaterials={completedMaterials}
                        expandedTopic={expandedTopic}
                        onExpandTopic={handleExpandTopic}
                        onPreviewMaterial={(mat) => setPreviewItem({ 
                            file: { _id: mat._id, file_name: mat.title, slide_name: mat.title, file_path: mat.file_path || '' } as any, 
                            type: (mat.type === 'slide' || mat.type === 'slides') ? 'slide' : 'file' 
                        })}
                        onOpenQuiz={(mat, isDone) => navigate(isDone ? `/student/quiz-result/${mat._id}?classId=${classId}` : `/student/take-quiz/${mat._id}`)}
                        onFlagMaterial={handleFlagMaterial}
                        quizAttempts={quizAttempts}
                    />
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
                                <Typography variant="body2" fontWeight="600">{files.length + slides.length + quizzes.length} tài liệu</Typography>
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
                onClose={() => {
                    setPreviewItem(null);
                    setScrolled(false);
                }}
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
                <DialogContent 
                    dividers
                    onScroll={(e) => {
                        const target = e.target as HTMLElement;
                        const hasScrolbar = target.scrollHeight > target.clientHeight;
                        const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 10;
                        
                        // Nếu không có scrollbar (fit 1 trang) thì luôn mark as scrolled
                        if (!hasScrolbar) {
                            setIsContentFitInOne(true);
                            setScrolled(true);
                        } else {
                            setIsContentFitInOne(false);
                            setScrolled(isAtBottom);
                        }
                    }}
                >
                    <Box sx={{ mt: 1, minHeight: '600px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                        {previewItem && previewItem.file.file_path ? (
                            previewItem.type === 'file' ? (
                                <FileViewer content={previewItem.file as any} />
                            ) : (
                                <SlideViewer content={previewItem.file as any} />
                            )
                        ) : (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Tài liệu này chưa có file đính kèm
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        {previewItem && previewItem.file.file_path && (scrolled || isContentFitInOne) && (
                            !completedMaterials.includes(previewItem.file._id) ? (
                                <Button 
                                    variant="contained" 
                                    color="success"
                                    startIcon={<CheckCircle />}
                                    onClick={() => handleMarkMaterialCompleted(previewItem.file, previewItem.type)}
                                >
                                    Đánh dấu hoàn thành
                                </Button>
                            ) : (
                                <Button variant="outlined" color="success" disabled startIcon={<CheckCircle />}>
                                    Đã hoàn thành
                                </Button>
                            )
                        )}
                    </Box>
                    <Button onClick={() => {
                        setPreviewItem(null);
                        setScrolled(false);
                    }}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* Flag Notification Snackbar */}
            <Snackbar
                open={!!flagMessage}
                autoHideDuration={3000}
                onClose={() => setFlagMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setFlagMessage(null)}
                    severity={flagMessage?.type}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {flagMessage?.text}
                </Alert>
            </Snackbar>

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
                            <StudentAIChat courseContext={
                                (() => {
                                    const parts: string[] = [];
                                    if (courseName) parts.push(`Course: ${courseName}`);
                                    if (cls?.class_name) parts.push(`Class: ${cls.class_name}`);
                                    if (gradeLevel) parts.push(`Grade level: ${gradeLevel}`);
                                    if (topics.length > 0) {
                                        parts.push(`Topics:\n${topics.map((t, i) => {
                                            const topicMats = allMaterials.filter(m => m.topic_id === t._id);
                                            const matList = topicMats.length > 0
                                                ? topicMats.map(m => `  - ${m.title} (${m.type})`).join('\n')
                                                : '  (no materials)';
                                            return `${i + 1}. ${t.title}${t.description ? ': ' + t.description : ''}\n${matList}`;
                                        }).join('\n')}`);
                                    }
                                    return parts.join('\n') || undefined;
                                })()
                            } />
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