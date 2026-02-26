import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Stack, Paper, Button, Chip, Skeleton, Avatar
} from '@mui/material';
import { ArrowBack, MenuBook, ErrorOutline, CalendarToday } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Topic } from '../../types/studentType';


const TOPIC_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function StudentClassDetail() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    const [cls, setCls] = useState<ClassItem | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loadingClass, setLoadingClass] = useState(true);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch class detail
    useEffect(() => {
        if (!classId) return;
        const fetchClass = async () => {
            setLoadingClass(true);
            try {
                const data: ClassItem = await apiService.get(`/class/${classId}`);
                setCls(data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin lớp học');
            } finally {
                setLoadingClass(false);
            }
        };
        fetchClass();
    }, [classId]);

    // Fetch topics after class loaded
    useEffect(() => {
        if (!cls?.course_id) return;
        const fetchTopics = async () => {
            setLoadingTopics(true);
            try {
                const data: Topic[] = await apiService.get(`/topics/course/${cls.course_id}?page=1`);
                setTopics(data);
            } catch (err: any) {
                setError(err.message || 'Không thể tải danh sách chủ đề');
            } finally {
                setLoadingTopics(false);
            }
        };
        fetchTopics();
    }, [cls?.course_id]);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            p: { xs: 2, md: 4 },
        }}>
            {/* Back button */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/student/classes')}
                sx={{
                    mb: 3, textTransform: 'none', color: '#64748b', fontWeight: 600,
                    '&:hover': { background: '#f1f5f9' }
                }}
            >
                Quay lại
            </Button>

            {/* Error */}
            {error && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #fecaca', background: '#fff5f5', mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ErrorOutline sx={{ color: '#ef4444' }} />
                        <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{error}</Typography>
                    </Stack>
                </Paper>
            )}

            {/* Class header */}
            {loadingClass ? (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white', mb: 3 }}>
                    <Stack direction="row" spacing={2}>
                        <Skeleton variant="rounded" width={80} height={80} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton width="50%" height={28} />
                            <Skeleton width="30%" height={20} sx={{ mt: 1 }} />
                        </Box>
                    </Stack>
                </Paper>
            ) : cls && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white', mb: 3 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                        <Box sx={{
                            width: 80, height: 80, borderRadius: 3, overflow: 'hidden', flexShrink: 0,
                            background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {cls.img_cover_link ? (
                                <img src={cls.img_cover_link} alt={cls.class_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <MenuBook sx={{ fontSize: 36, color: '#6366f1' }} />
                            )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: 18, md: 22 }, color: '#0f172a' }}>
                                    {cls.class_name}
                                </Typography>
                                <Chip
                                    label={cls.status === 'active' ? 'Đang học' : cls.status}
                                    size="small"
                                    sx={{
                                        background: cls.status === 'active' ? '#d1fae5' : '#f1f5f9',
                                        color: cls.status === 'active' ? '#065f46' : '#64748b',
                                        fontWeight: 700, fontSize: 11,
                                    }}
                                />
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <CalendarToday sx={{ fontSize: 13, color: '#94a3b8' }} />
                                <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                                    Tham gia: {formatDate(cls.date_create)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {/* Topics */}
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#0f172a', mb: 2 }}>
                Chủ đề học ({loadingTopics ? '...' : topics.length})
            </Typography>

            {/* Topic skeletons */}
            {loadingTopics && (
                <Stack spacing={2}>
                    {[1, 2, 3, 4].map(i => (
                        <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Skeleton variant="circular" width={44} height={44} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton width="55%" height={20} />
                                    <Skeleton width="80%" height={16} sx={{ mt: 0.5 }} />
                                </Box>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            {/* Topic cards */}
            {!loadingTopics && (
                <Stack spacing={2}>
                    {topics.map((topic, index) => {
                        const color = TOPIC_COLORS[index % TOPIC_COLORS.length];
                        return (
                            <Paper key={topic._id} elevation={0} sx={{
                                p: 3, borderRadius: 3,
                                border: '1px solid #e2e8f0', background: 'white',
                                transition: 'all 0.2s', cursor: 'pointer',
                                '&:hover': { transform: 'translateX(4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: color },
                            }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{
                                        width: 44, height: 44, borderRadius: 2,
                                        background: `${color}18`,
                                        color, fontWeight: 700, fontSize: 16,
                                        flexShrink: 0,
                                    }}>
                                        {index + 1}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                                            {topic.title}
                                        </Typography>
                                        {topic.description && (
                                            <Typography sx={{
                                                fontSize: 13, color: '#94a3b8', mt: 0.3,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {topic.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <MenuBook sx={{ color: '#cbd5e1', fontSize: 20, flexShrink: 0 }} />
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            {/* Empty topics */}
            {!loadingTopics && topics.length === 0 && !error && (
                <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <MenuBook sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Chưa có chủ đề nào</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: 13, mt: 0.5 }}>
                        Giáo viên chưa thêm nội dung cho lớp này
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}