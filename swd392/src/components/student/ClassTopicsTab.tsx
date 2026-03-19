import { Stack, Typography, Alert, Box, Chip, Accordion, AccordionSummary, AccordionDetails, Divider, Paper, Button } from '@mui/material';
import { ExpandMore, Info, CheckCircle, MenuBook, School, FileDownload, Visibility as Eye, Brush, Quiz, Flag } from '@mui/icons-material';
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
  onOpenQuiz?: (material: MaterialItem) => void;
  onFlagMaterial?: (material: MaterialItem) => void;
}

const getMaterialIcon = (type: string) => {
  switch (type) {
    case 'slide': case 'slides': return '🎯';
    case '2d_render': return '🎨';
    case 'quiz': return '📝';
    case 'pdf': return '📄';
    case 'video': return '🎥';
    default: return '📎';
  }
};

export default function ClassTopicsTab({
  topics, materials = [], completedMaterials = [],
  courseName, gradeLevel, expandedTopic, onExpandTopic,
  onPreviewMaterial, onOpenQuiz, onFlagMaterial
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
      <Box sx={{ pl: 2, borderLeft: '2px dashed #e2e8f0' }}>
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
                      <Typography sx={{ fontWeight: 'bold', color, fontSize: 12, bgcolor: `${color}15`, px: 1, py: 0.25, borderRadius: 1 }}>
                        {isLast ? '└' : '├'} {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Stack sx={{ flex: 1 }}>
                        <Typography fontWeight="bold">{topic.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{topic.description || 'Chưa có mô tả'}</Typography>
                      </Stack>
                      {topicMaterials.length > 0 && (
                        <Chip label={`${topicMaterials.length} tài liệu`} size="small" sx={{ bgcolor: `${color}10`, color, fontSize: '0.65rem' }} />
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
                                return (
                                  <Paper key={mat._id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                                      <Typography variant="body2">{getMaterialIcon(mat.type)}</Typography>
                                      <Box>
                                        <Typography variant="body2" fontWeight="600">{mat.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {isRender2D ? '2D Render • Coming soon' : mat.type}
                                          {isCompleted && ' ✅'}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                    {isRender2D ? (
                                      <Chip label="Coming soon" size="small" icon={<Brush sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: '#f0f7ff', color: '#6366f1', fontSize: '0.65rem' }} />
                                    ) : isQuiz ? (
                                      <Stack direction="row" spacing={0.5}>
                                        {onOpenQuiz && (
                                          <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => onOpenQuiz(mat)}
                                            startIcon={<Quiz />}
                                            sx={{ bgcolor: color, '&:hover': { bgcolor: `${color}dd` } }}
                                          >
                                            Làm bài
                                          </Button>
                                        )}
                                      </Stack>
                                    ) : (
                                      <Stack direction="row" spacing={0.5}>
                                        {onPreviewMaterial && (
                                          <Button size="small" variant="outlined" onClick={() => onPreviewMaterial(mat)} startIcon={<Eye />} sx={{ borderColor: color, color }}>Xem</Button>
                                        )}
                                        {mat.file_path && (
                                          <Button size="small" variant="outlined" component="a" href={mat.file_path} download target="_blank" startIcon={<FileDownload />} sx={{ borderColor: color, color }}>Tải</Button>
                                        )}
                                        {onFlagMaterial && mat.status === 'published' && mat.isFlaggable !== false && !mat.isFlagged && (
                                          <Button size="small" variant="outlined" onClick={() => onFlagMaterial(mat)} startIcon={<Flag />} sx={{ borderColor: '#ef4444', color: '#ef4444' }}>Báo cáo</Button>
                                        )}
                                        {mat.isFlagged && (
                                          <Chip label="Đã báo cáo" size="small" icon={<Flag sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontSize: '0.65rem' }} />
                                        )}
                                      </Stack>
                                    )}
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