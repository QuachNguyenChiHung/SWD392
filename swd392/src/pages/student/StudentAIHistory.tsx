import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import StudentPageShell from '../../components/student/StudentPageShell';
import { aiHistoryApi } from '../../services/aiHistoryApi';
import type { AiHistoryRequest } from '../../services/aiHistoryApi';

const formatDateTime = (value?: string): string => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('vi-VN');
};

const readResponseText = (item: AiHistoryRequest): string | null => {
  const nestedContents = Array.isArray(item.contents) ? item.contents : [];

  for (const contentRecord of nestedContents) {
    const nestedCandidates = [
      contentRecord?.record_json?.full_response,
      contentRecord?.record_json?.response,
      contentRecord?.record_json,
    ] as unknown[];

    for (const candidate of nestedCandidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }

      if (candidate && typeof candidate === 'object') {
        try {
          return JSON.stringify(candidate, null, 2);
        } catch {
          return String(candidate);
        }
      }
    }
  }

  const candidates = [item.response, item.result, item.output, item.content, item.answer, item.message] as unknown[];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }

    if (candidate && typeof candidate === 'object') {
      try {
        return JSON.stringify(candidate, null, 2);
      } catch {
        return String(candidate);
      }
    }
  }

  return null;
};

const markdownToPlainText = (value: string): string => {
  return value
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, '').trim())
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^\s{0,3}#{1,6}\s?/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^\s{0,3}[-*+]\s+/gm, '- ')
    .replace(/^\s{0,3}\d+\.\s+/gm, (match) => match.trim())
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const StudentAIHistory = () => {
  const [history, setHistory] = useState<AiHistoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AiHistoryRequest | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await aiHistoryApi.getStudentHistory();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch sử AI');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const aTime = new Date(a.date ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.date ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
  }, [history]);

  return (
    <StudentPageShell
      title="Lịch sử AI của học sinh"
      subtitle="Xem lại các yêu cầu bạn đã gửi cho AI"
      chipLabel="Khu vực học sinh"
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid #d6e7f4',
          backgroundColor: '#fff',
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && sortedHistory.length === 0 && (
          <Alert severity="info">Bạn chưa có lịch sử yêu cầu AI.</Alert>
        )}

        {!loading && !error && sortedHistory.length > 0 && (
          <Stack spacing={2}>
            {sortedHistory.map((item) => (
              <Paper
                key={item._id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: '0.2s',
                  '&:hover': {
                    borderColor: '#4f8ecb',
                    boxShadow: '0 6px 14px rgba(17, 88, 154, 0.08)',
                  },
                }}
                onClick={() => setSelectedRequest(item)}
              >
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      size="small"
                      label={`Loại: ${item.type ?? 'unknown'}`}
                      sx={{ bgcolor: '#eaf3ff', color: '#145ea1', fontWeight: 700 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.date ?? item.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ color: '#12344d' }}>
                    Prompt
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#254c6a',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.prompt || '(Không có prompt)'}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Chi tiết yêu cầu AI</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip size="small" label={`ID: ${selectedRequest._id}`} />
                <Chip size="small" label={`Loại: ${selectedRequest.type ?? 'unknown'}`} />
                <Chip size="small" label={formatDateTime(selectedRequest.date ?? selectedRequest.createdAt)} />
              </Stack>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#12344d' }}>
                  Prompt đã gửi
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, whiteSpace: 'pre-wrap' }}>
                  <Typography variant="body2">{selectedRequest.prompt || '(Không có prompt)'}</Typography>
                </Paper>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#12344d' }}>
                  Response AI
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, backgroundColor: '#f8fbff', whiteSpace: 'pre-wrap', maxHeight: 360, overflow: 'auto' }}
                >
                  <Typography variant="body2">
                    {(() => {
                      const responseText = readResponseText(selectedRequest);
                      if (!responseText) {
                        return 'Endpoint hiện không trả response chi tiết cho mục này.';
                      }
                      return markdownToPlainText(responseText);
                    })()}
                  </Typography>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </StudentPageShell>
  );
};

export default StudentAIHistory;
