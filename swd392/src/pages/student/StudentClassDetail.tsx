import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Stack, Paper, Button, Chip, Skeleton, Grid, Divider,
    LinearProgress, Alert, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    ArrowBack, MenuBook, CalendarToday, CheckCircle
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Topic, Enrollment, ProgressData } from '../../types/studentType';
import ClassTopicsTab from '../../components/student/ClassTopicsTab';
import ClassMaterialsTab from '../../components/student/ClassMaterialsTab';

interface ClassMaterial {
    _id: string;
    title: string;
    type: string;
    file_url?: string;
    description?: string;
    order?: number;
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

const calcProgress = (progress: ProgressData) => {
    const total = progress.length;
    const completed = progress.filter(p => p.completion_status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
};

export default function StudentClassDetail() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    const [cls, setCls] = useState<ClassItem | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [courseName, setCourseName] = useState('');
    const [gradeLevel, setGradeLevel] = useState<number | undefined>(undefined);
    const [materials, setMaterials] = useState<ClassMaterial[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [expandedTopic, setExpandedTopic] = useState<string | false>(false);
    const [previewMaterial, setPreviewMaterial] = useState<ClassMaterial | null>(null);

    useEffect(() => {
        if (!classId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const classData: ClassItem = await apiService.get(`/class/${classId}`);
                setCls(classData);

                if (classData.course_id) {
                    const courseData: any = await apiService.get(
                        `/topics/course/${classData.course_id}?page=1`
                    );
                    setTopics(courseData?.topics || []);
                    setCourseName(courseData?.course_name || '');
                    setGradeLevel(courseData?.grade_level);
                }

                try {
                    const materialsData: ClassMaterial[] = await apiService.get(
                        `/class-materials?class_id=${classId}`
                    );
                    setMaterials(materialsData);
                } catch {
                    console.warn('Failed to fetch materials');
                }

                try {
                    const enrollmentsData: Enrollment[] = await apiService.get('/enroll/student');
                    const classEnrollment = enrollmentsData.find(
                        e => getEnrollClassId(e) === classId
                    );
                    if (classEnrollment) {
                        setEnrollment(classEnrollment);
                        try {
                            const progressData: ProgressData = await apiService.get(
                                `/progress/${classEnrollment._id}`
                            );
                            setProgress(progressData);
                        } catch {
                            console.warn('Failed to fetch progress');
                        }
                    }
                } catch {
                    console.warn('Failed to fetch enrollment');
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
    const progressStats = progress ? calcProgress(progress) : null;

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

                            {progressStats && (
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
                            <Tab label={`Nội dung khóa học (${topics.length})`} />
                            <Tab label={`Tài liệu (${materials.length})`} />
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
                            materials={materials}
                            onPreviewMaterial={setPreviewMaterial}
                        />
                    </TabPanel>
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
                                <Typography variant="caption" color="text.secondary">Tài liệu</Typography>
                                <Typography variant="body2" fontWeight="600">{materials.length} tài liệu</Typography>
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
                            fullWidth variant="contained" size="large"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                            onClick={() => setTabValue(0)}
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

            <Dialog
                open={!!previewMaterial}
                onClose={() => setPreviewMaterial(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle fontWeight="bold">{previewMaterial?.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Loại: {previewMaterial?.type}</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {previewMaterial?.description || 'Chưa có mô tả'}
                        </Typography>
                        {previewMaterial?.file_url && (
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                                <Typography variant="body2" gutterBottom>Liên kết tài liệu:</Typography>
                                <Typography
                                    component="a"
                                    href={previewMaterial.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: '#6366f1', textDecoration: 'none', wordBreak: 'break-all', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    {previewMaterial.file_url}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewMaterial(null)}>Đóng</Button>
                    {previewMaterial?.file_url && (
                        <Button variant="contained" component="a" href={previewMaterial.file_url} download target="_blank">
                            Tải về
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}