import {
  Stack, Typography, Alert, Box, Chip,
  Accordion, AccordionSummary, AccordionDetails, Divider, Paper
} from '@mui/material';
import { ExpandMore, Info, CheckCircle, MenuBook, School } from '@mui/icons-material';
import type { Topic } from '../../types/studentType';

const TOPIC_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface TopicWithContent extends Topic {
  content_json?: {
    sections?: string[];
    learning_objectives?: string[];
  } | null;
}

interface ClassTopicsTabProps {
  topics: TopicWithContent[];
  courseName?: string;
  gradeLevel?: number;
  expandedTopic: string | false;
  onExpandTopic: (topicId: string) => void;
}

export default function ClassTopicsTab({ topics, courseName, gradeLevel, expandedTopic, onExpandTopic }: ClassTopicsTabProps) {
  if (topics.length === 0) {
    return (
      <Alert severity="info" icon={<Info />}>
        Chưa có chủ đề nào trong khóa học này
      </Alert>
    );
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
              {gradeLevel && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  (Lớp {gradeLevel})
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {topics.length} chủ đề
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Topics List */}
      <Box sx={{ pl: 2, borderLeft: '2px dashed #e2e8f0' }}>
        <Stack spacing={1.5}>
          {topics.map((topic, index) => {
            const color = TOPIC_COLORS[index % 6];
            const hasSections = topic.content_json?.sections && topic.content_json.sections.length > 0;
            const hasObjectives = topic.content_json?.learning_objectives && topic.content_json.learning_objectives.length > 0;
            const isLast = index === topics.length - 1;

            return (
              <Box key={topic._id} sx={{ position: 'relative' }}>
                {/* Tree connector dot */}
                <Box sx={{
                  position: 'absolute',
                  left: -18,
                  top: 20,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  zIndex: 1
                }} />

                <Accordion
                  expanded={expandedTopic === topic._id}
                  onChange={() => onExpandTopic(topic._id)}
                  variant="outlined"
                  sx={{
                    borderRadius: '8px !important',
                    borderColor: expandedTopic === topic._id ? color : '#e2e8f0',
                    borderWidth: expandedTopic === topic._id ? 1.5 : 1,
                    '&:before': { display: 'none' },
                    transition: '0.2s'
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography sx={{
                        fontWeight: 'bold', color, fontSize: 12,
                        bgcolor: `${color}15`, px: 1, py: 0.25, borderRadius: 1
                      }}>
                        {isLast ? '└' : '├'} {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Stack>
                        <Typography fontWeight="bold" variant="body1">{topic.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {topic.description || 'Chưa có mô tả'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ bgcolor: `${color}05`, pt: 0 }}>
                    <Stack spacing={2}>
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

                      {hasSections && (
                        <>
                          <Divider />
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <MenuBook sx={{ fontSize: 16, color }} />
                              <Typography variant="subtitle2" fontWeight="bold">Nội dung</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {topic.content_json!.sections!.map((section, i) => (
                                <Chip
                                  key={i}
                                  label={section}
                                  size="small"
                                  sx={{ bgcolor: `${color}15`, color, fontWeight: 600 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </>
                      )}

                      {!hasSections && !hasObjectives && (
                        <Typography variant="body2" color="text.secondary">
                          Chủ đề này chưa có nội dung chi tiết.
                        </Typography>
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