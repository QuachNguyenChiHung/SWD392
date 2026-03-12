import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, Button, Chip, Skeleton, Grid, Divider,
  LinearProgress, Accordion, AccordionSummary, AccordionDetails, Alert,
  Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  ArrowBack, MenuBook, CalendarToday, ExpandMore,
  FileDownload, CheckCircle, Info, Visibility as Eye
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Topic, Enrollment, ProgressData } from '../../types/studentType';

const TOPIC_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

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

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function StudentClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [expandedTopic, setExpandedTopic] = useState<string | false>(false);
  const [previewMaterial, setPreviewMaterial] = useState<ClassMaterial | null>(null);

  // Fetch all class data
  useEffect(() => {
    if (!classId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get class details
        const classData: ClassItem = await apiService.get(`/class/${classId}`);
        setCls(classData);

        // 2. Get topics for this class's course
        if (classData.course_id) {
          const topicsData: Topic[] = await apiService.get(
            `/topics/course/${classData.course_id}?page=1`
          );
          setTopics(topicsData);
        }

        // 3. Get class materials
        try {
          const materialsData: ClassMaterial[] = await apiService.get(
            `/class-materials?class_id=${classId}`
          );
          setMaterials(materialsData);
        } catch (err) {
          console.warn('Failed to fetch materials');
        }

        // 4. Get enrollment info
        try {
          const enrollmentsData: Enrollment[] = await apiService.get('/enroll/student');
          const classEnrollment = enrollmentsData.find(e => e.class_id === classId);
          if (classEnrollment) {
            setEnrollment(classEnrollment);

            // 5. Get progress if enrolled
            try {
              const progressData: ProgressData = await apiService.get(
                `/progress/${classEnrollment._id}`
              );
              setProgress(progressData);
            } catch (err) {
              console.warn('Failed to fetch progress');
            }
          }
        } catch (err) {
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const getMaterialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      case 'document':
        return '📝';
      case 'link':
        return '🔗';
      default:
        return '📎';
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
        <Skeleton variant="text" height={30} width="30%" sx={{ mb: 2 }} />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student/classes')}
          sx={{ mb: 3 }}
        >
          Quay lại
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
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
          {/* Class Header */}
          {cls && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                {/* Class Cover */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    bgcolor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
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

                {/* Class Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {cls.class_name}
                  </Typography>
                  <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                    <Chip
                      label={enrollment?.completed ? 'Hoàn thành' : 'Đang học'}
                      size="small"
                      sx={{
                        bgcolor: enrollment?.completed ? '#d1fae5' : '#d1fae5',
                        color: enrollment?.completed ? '#065f46' : '#065f46',
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

              {/* Progress Bar */}
              {progress && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Tiến độ học tập
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {progress.percentage}% ({progress.completed}/{progress.total})
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: progress.percentage === 100 ? '#10b981' : '#6366f1'
                      }
                    }}
                  />
                </Box>
              )}
            </Paper>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
              <Tab label={`Nội dung khóa học (${topics.length})`} />
              <Tab label={`Tài liệu (${materials.length})`} />
            </Tabs>
          </Box>

          {/* Topics Tab */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={2}>
              {topics.length > 0 ? (
                topics.map((topic, index) => (
                  <Accordion
                    key={topic._id}
                    expanded={expandedTopic === topic._id}
                    onChange={() =>
                      setExpandedTopic(expandedTopic === topic._id ? false : topic._id)
                    }
                    sx={{
                      borderLeft: `4px solid ${TOPIC_COLORS[index % 6]}`
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            color: TOPIC_COLORS[index % 6],
                            minWidth: 30
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight="bold">{topic.title}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {topic.description || 'Chưa có mô tả'}
                          </Typography>
                        </Box>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
                      <Stack spacing={2}>
                        <Typography variant="body2">
                          {topic.description || 'Chủ đề này chưa có nội dung mô tả.'}
                        </Typography>

                        {/* Topic Materials */}
                        {materials.filter(m => m.description?.includes(topic._id)).length >
                          0 && (
                          <>
                            <Divider />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Tài liệu liên quan
                            </Typography>
                            <Stack spacing={1}>
                              {materials
                                .filter(m => m.description?.includes(topic._id))
                                .map(material => (
                                  <Paper
                                    key={material._id}
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                    }}
                                  >
                                    <Box>
                                      <Typography variant="body2" fontWeight="600">
                                        {getMaterialIcon(material.type)} {material.title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {material.type}
                                      </Typography>
                                    </Box>
                                    <Button
                                      size="small"
                                      onClick={() => setPreviewMaterial(material)}
                                      endIcon={<Eye />}
                                    >
                                      Xem
                                    </Button>
                                  </Paper>
                                ))}
                            </Stack>
                          </>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Alert severity="info">
                  <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Chưa có chủ đề nào trong khóa học này
                </Alert>
              )}
            </Stack>
          </TabPanel>

          {/* Materials Tab */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={2}>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <Paper
                    key={material._id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="600">
                        {getMaterialIcon(material.type)} {material.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {material.type} {material.description && `• ${material.description}`}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPreviewMaterial(material)}
                        startIcon={<Eye />}
                      >
                        Xem
                      </Button>
                      {material.file_url && (
                        <Button
                          size="small"
                          variant="outlined"
                          component="a"
                          href={material.file_url}
                          download
                          target="_blank"
                          startIcon={<FileDownload />}
                        >
                          Tải
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Alert severity="info">
                  <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Chưa có tài liệu nào trong lớp này
                </Alert>
              )}
            </Stack>
          </TabPanel>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Class Info Card */}
          <Paper sx={{ p: 3, mb: 2, bgcolor: '#f8fafc' }}>
            <Typography fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              Thông tin lớp học
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Mã lớp
                </Typography>
                <Typography variant="body2" fontWeight="600" sx={{ wordBreak: 'break-all' }}>
                  {classId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Chủ đề
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {topics.length} chủ đề
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tài liệu
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {materials.length} tài liệu
                </Typography>
              </Box>
              {enrollment && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ngày tham gia
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {formatDate(enrollment.date_join)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {enrollment.completed ? (
                        <Chip
                          label="Hoàn thành"
                          size="small"
                          sx={{ bgcolor: '#d1fae5', color: '#065f46' }}
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip
                          label="Đang học"
                          size="small"
                          sx={{ bgcolor: '#d1fae5', color: '#065f46' }}
                        />
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>

          {/* Progress Card */}
          {progress && (
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Typography fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                📊 Tiến độ học tập
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Hoàn thành
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {progress.completed}/{progress.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress.percentage}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {progress.percentage === 100
                    ? '✅ Bạn đã hoàn thành khóa học này!'
                    : `${Math.ceil(100 - progress.percentage)} phần trăm còn lại để hoàn thành`}
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ textTransform: 'none', fontWeight: 600 }}
              onClick={() => setTabValue(0)}
            >
              Bắt đầu học
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/student/classes')}
            >
              Quay về danh sách lớp
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Material Preview Dialog */}
      <Dialog
        open={!!previewMaterial}
        onClose={() => setPreviewMaterial(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {previewMaterial?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Loại: {previewMaterial?.type}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {previewMaterial?.description || 'Chưa có mô tả'}
            </Typography>

            {previewMaterial?.file_url && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f3f4f6', borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Liên kết tài liệu:
                </Typography>
                <Typography
                  component="a"
                  href={previewMaterial.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#6366f1',
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    '&:hover': { textDecoration: 'underline' }
                  }}
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
            <Button
              variant="contained"
              component="a"
              href={previewMaterial.file_url}
              download
              target="_blank"
            >
              Tải về
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}