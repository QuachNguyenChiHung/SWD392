import { Stack, Typography, Alert, Box, Chip, Accordion, AccordionSummary, AccordionDetails, Divider, Paper, Button } from '@mui/material';
import { ExpandMore, Info, CheckCircle, MenuBook, School, FileDownload, Visibility as Eye, Brush, Quiz, Flag, Timer, ChevronRight, Slideshow, VideoFile, Article, PictureAsPdf, AttachFile } from '@mui/icons-material';
import type { Topic } from '../../types/studentType';

const TOPIC_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface MaterialItem {
  _id: string;
  title: string;
  type: string;
  file_path?: string;
  topic_id?: string;
  content_id?: string;
  status?: string;
  isFlagged?: boolean;
  isFlaggable?: boolean;
}

interface TopicWithContent extends Topic {
  content_json?: {
    sections?: string[];
    learning_objectives?: string[];
  } | null;
}

interface ClassTopicsTabProps {
  topics: TopicWithContent[];
  materials?: MaterialItem[];
  completedMaterials?: string[];
  courseName?: string;
  gradeLevel?: number;
  expandedTopic: string | false;
  onExpandTopic: (topicId: string) => void;
  onPreviewMaterial?: (material: MaterialItem) => void;
  onOpenQuiz?: (material: MaterialItem, isCompleted: boolean) => void;
  onFlagMaterial?: (material: MaterialItem) => void;
  quizAttempts?: any[];
}

const getMaterialMuiIcon = (type: string) => {
  switch (type) {
    case 'slide': case 'slides': return <Slideshow sx={{ fontSize: 20 }} />;
    case '2d_render': return <Brush sx={{ fontSize: 20 }} />;
    case 'quiz': return <Quiz sx={{ fontSize: 20 }} />;
    case 'pdf': return <PictureAsPdf sx={{ fontSize: 20 }} />;
    case 'video': return <VideoFile sx={{ fontSize: 20 }} />;
    case 'file': return <Article sx={{ fontSize: 20 }} />;
    default: return <AttachFile sx={{ fontSize: 20 }} />;
  }
};

export default function ClassTopicsTab({
  topics, materials = [], completedMaterials = [],
  courseName, gradeLevel, expandedTopic, onExpandTopic,
  onPreviewMaterial, onOpenQuiz, onFlagMaterial, quizAttempts
}: ClassTopicsTabProps) {
  if (!topics.length) {
    return <Alert severity="info" icon={<Info />}>Chưa có chủ đề nào trong khóa học này</Alert>;
  }

  return (
    <Stack spacing={2}>
      {/* Course Header */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, bgcolor: '#6366f115', borderRadius: 1.5, display: 'flex' }}>
            <School sx={{ color: '#6366f1', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight="bold">
              {courseName || 'Khóa học'}
              {gradeLevel && <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>(Lớp {gradeLevel})</Typography>}
            </Typography>
            <Typography variant="caption" color="text.secondary">{topics.length} chủ đề</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Topics List */}
      <Box sx={{ pl: 2, borderLeft: '2px dashed #e2e8f0', overflow: 'hidden' }}>
        <Stack spacing={1.5}>
          {topics.map((topic, index) => {
            const color = TOPIC_COLORS[index % 6];
            const hasSections = !!topic.content_json?.sections?.length;
            const hasObjectives = !!topic.content_json?.learning_objectives?.length;
            const isLast = index === topics.length - 1;
            const topicMaterials = materials.filter(m => m.topic_id === topic._id);

            return (
              <Box key={topic._id} sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', left: -18, top: 20, width: 8, height: 8, borderRadius: '50%', bgcolor: color, zIndex: 1 }} />

                <Accordion expanded={expandedTopic === topic._id} onChange={() => onExpandTopic(topic._id)} variant="outlined"
                  sx={{ borderRadius: '8px !important', borderColor: expandedTopic === topic._id ? color : '#e2e8f0', borderWidth: expandedTopic === topic._id ? 1.5 : 1, '&:before': { display: 'none' }, transition: '0.2s' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, pr: 1 }}>
                      <Typography sx={{ fontWeight: 'bold', color, fontSize: 12, bgcolor: `${color}15`, px: 1, py: 0.25, borderRadius: 1, flexShrink: 0 }}>
                        {isLast ? '└' : '├'} {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight="bold">{topic.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>{topic.description || 'Chưa có mô tả'}</Typography>
                      </Stack>
                      {topicMaterials.length > 0 && (
                        <Chip label={`${topicMaterials.length} tài liệu`} size="small" sx={{ bgcolor: `${color}10`, color, fontSize: '0.65rem', flexShrink: 0 }} />
                      )}
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ bgcolor: `${color}05`, pt: 0 }}>
                    <Stack spacing={2}>
                      {/* Learning objectives */}
                      {hasObjectives && (
                        <>
                          <Divider />
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <CheckCircle sx={{ fontSize: 16, color }} />
                              <Typography variant="subtitle2" fontWeight="bold">Mục tiêu học tập</Typography>
                            </Stack>
                            <Stack spacing={0.5}>
                              {topic.content_json!.learning_objectives!.map((obj, i) => (
                                <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                                  <Typography variant="body2" color={color} sx={{ mt: 0.1 }}>•</Typography>
                                  <Typography variant="body2">{obj}</Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        </>
                      )}

                      {/* Sections */}
                      {hasSections && (
                        <>
                          <Divider />
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <MenuBook sx={{ fontSize: 16, color }} />
                              <Typography variant="subtitle2" fontWeight="bold">Nội dung</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {topic.content_json!.sections!.map((s, i) => (
                                <Chip key={i} label={s} size="small" sx={{ bgcolor: `${color}15`, color, fontWeight: 600 }} />
                              ))}
                            </Stack>
                          </Box>
                        </>
                      )}

                      {/* Materials */}
                      {topicMaterials.length > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>Tài liệu</Typography>
                            <Stack spacing={1}>
                              {topicMaterials.map(mat => {
                                const isRender2D = mat.type === '2d_render';
                                const isQuiz = mat.type === 'quiz';
                                const isCompleted = completedMaterials.includes(mat._id);

                                if (isQuiz) {
                                  const attempt = quizAttempts?.find(a => {
                                    const qId = typeof a.quiz_id === 'object' ? a.quiz_id._id : a.quiz_id;
                                    return qId === mat.content_id;
                                  });
                                  
                                  return (
                                    <Paper key={mat._id} variant="outlined" sx={{ mb: 1, p: 2, borderRadius: 2, transition: '0.2s', '&:hover': { borderColor: color, transform: 'translateX(4px)', boxShadow: `0 4px 12px ${color}15` } }}>
                                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                          <Box sx={{ p: 1, bgcolor: isCompleted ? '#d1fae520' : `${color}12`, borderRadius: 1.5, display: 'flex', color: isCompleted ? '#059669' : color }}>
                                            {isCompleted ? <CheckCircle sx={{ fontSize: 20 }} /> : <Quiz sx={{ fontSize: 20 }} />}
                                          </Box>
                                          <Box>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <Typography fontWeight="700" variant="body2">{mat.title}</Typography>
                                              {isCompleted && <Chip label="Đã làm" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                                            </Stack>
                                            {attempt && (
                                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <Timer sx={{ fontSize: 12, color: 'text.disabled' }} />
                                                <Typography variant="caption" color="text.secondary">Lần {attempt.attempt_number} • {new Date(attempt.date).toLocaleDateString('vi-VN')}</Typography>
                                              </Stack>
                                            )}
                                          </Box>
                                        </Stack>
                                        {onOpenQuiz && (
                                          <Button size="small" variant={isCompleted ? 'outlined' : 'contained'} endIcon={!isCompleted ? <ChevronRight /> : undefined}
                                            onClick={() => onOpenQuiz(mat, isCompleted)}
                                            sx={{ borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 700, borderColor: isCompleted ? color : undefined, color: isCompleted ? color : undefined, bgcolor: !isCompleted ? color : undefined, '&:hover': { bgcolor: !isCompleted ? `${color}dd` : undefined } }}>
                                            {isCompleted ? 'Xem lại' : 'Làm bài'}
                                          </Button>
                                        )}
                                      </Stack>
                                    </Paper>
                                  );
                                }

                                return (
                                  <Paper key={mat._id} variant="outlined" sx={{ mb: 1, p: 2, borderRadius: 2, transition: '0.2s', '&:hover': { borderColor: color, transform: 'translateX(4px)', boxShadow: `0 4px 12px ${color}15` } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                                        <Box sx={{ p: 1, bgcolor: isCompleted ? '#d1fae520' : `${color}12`, borderRadius: 1.5, display: 'flex', color: isCompleted ? '#059669' : color }}>
                                          {getMaterialMuiIcon(mat.type)}
                                        </Box>
                                        <Box>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography fontWeight="700" variant="body2">{mat.title}</Typography>
                                            {isCompleted && <Chip label="Đã xem" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                                          </Stack>
                                          <Typography variant="caption" color="text.secondary">
                                            {isRender2D ? '2D Render • Coming soon' : mat.type}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                      {isRender2D ? (
                                        <Chip label="Coming soon" size="small" icon={<Brush sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: '#f0f7ff', color: '#6366f1', fontSize: '0.65rem' }} />
                                      ) : (
                                      <Stack direction="row" spacing={1}>
                                          {onPreviewMaterial && (
                                            <Button size="small" variant="contained" onClick={() => onPreviewMaterial(mat)} startIcon={<Eye />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: color, color: '#fff', '&:hover': { bgcolor: `${color}dd` }, boxShadow: 'none' }}>Xem</Button>
                                          )}
                                          {mat.file_path && (
                                            <Button size="small" variant="outlined" component="a" href={mat.file_path} download target="_blank" startIcon={<FileDownload />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: `${color}80`, color: color, '&:hover': { borderColor: color, bgcolor: `${color}10` } }}>Tải</Button>
                                          )}
                                          {onFlagMaterial && mat.status === 'published' && mat.isFlaggable !== false && !mat.isFlagged && (
                                            <Button size="small" variant="outlined" onClick={() => onFlagMaterial(mat)} startIcon={<Flag />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#ef444480', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' } }}>Báo cáo</Button>
                                          )}
                                          {mat.isFlagged && (
                                            <Chip label="Đã báo cáo" size="small" icon={<Flag sx={{ fontSize: '14px !important' }} />} sx={{ borderRadius: 2, bgcolor: '#fee2e2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }} />
                                          )}
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Paper>
                                );
                              })}
                            </Stack>
                          </Box>
                        </>
                      )}

                      {!hasSections && !hasObjectives && !topicMaterials.length && (
                        <Typography variant="body2" color="text.secondary">Chủ đề này chưa có nội dung chi tiết.</Typography>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}