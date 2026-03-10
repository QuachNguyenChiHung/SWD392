import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Paper, Button, Chip, Skeleton, Grid, Divider } from '@mui/material';
import { ArrowBack, MenuBook, CalendarToday, PlayCircleOutline } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Topic } from '../../types/studentType';

const TOPIC_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function StudentClassDetail() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [cls, setCls] = useState<ClassItem | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!classId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const classData: ClassItem = await apiService.get(`/class/${classId}`);
                setCls(classData);
                if (classData.course_id) {
                    const topicsData: Topic[] = await apiService.get(`/topics/course/${classData.course_id}?page=1`);
                    setTopics(topicsData);
                }
            } catch (err: any) {
                setError(err.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classId]);

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
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
                    <Paper sx={{ p: 3, mb: 3 }}>
                        {loading ? (
                            <Stack direction="row" spacing={2}>
                                <Skeleton variant="rounded" width={80} height={80} />
                                <Box sx={{ flex: 1 }}><Skeleton width="60%" /><Skeleton width="40%" /></Box>
                            </Stack>
                        ) : cls && (
                            <Stack direction="row" spacing={3} alignItems="center">
                                <Box sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {cls.img_cover_link ? <img title={cls.class_name} src={cls.img_cover_link} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <MenuBook sx={{ fontSize: 40, color: '#6366f1' }} />}
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{cls.class_name}</Typography>
                                    <Stack direction="row" spacing={1} mt={0.5}>
                                        <Chip label="Đang học" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700 }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} /> {new Date(cls.date_create).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        )}
                    </Paper>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>Nội dung khóa học</Typography>
                    <Stack spacing={2}>
                        {loading ? [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />) :
                            topics.map((topic, index) => (
                                <Paper key={topic._id} variant="outlined" sx={{ p: 2, '&:hover': { borderColor: TOPIC_COLORS[index % 6], bgcolor: 'rgba(0,0,0,0.01)' }, cursor: 'pointer' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h6" fontWeight="bold" color="text.disabled" sx={{ minWidth: 30 }}>{String(index + 1).padStart(2, '0')}</Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography fontWeight="bold">{topic.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>{topic.description || 'Không có mô tả'}</Typography>
                                        </Box>
                                        <PlayCircleOutline color="action" />
                                    </Stack>
                                </Paper>
                            ))
                        }
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}>
                        <Typography fontWeight="bold" gutterBottom>Thông tin lớp học</Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={2}>
                            <Box><Typography variant="caption" color="text.secondary">Mã lớp</Typography><Typography variant="body2" fontWeight="600">{classId}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Tài liệu</Typography><Typography variant="body2" fontWeight="600">{topics.length} Chủ đề</Typography></Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}