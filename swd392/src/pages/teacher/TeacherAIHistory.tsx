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
import type { AiHistoryRequest, AiSessionResponse } from '../../services/aiHistoryApi';

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return { bg: '#d1fae5', color: '#065f46', label: 'Đang hoạt động' };
    case 'expired': return { bg: '#fef3c7', color: '#92400e', label: 'Hết hạn' };
    case 'closed': return { bg: '#fee2e2', color: '#991b1b', label: 'Đã đóng' };
    default: return { bg: '#f3f4f6', color: '#6b7280', label: status };
  }
};

const getTimeRemaining = (createdAt: string): string => {
  const created = new Date(createdAt).getTime();
  const expiresAt = created + 12 * 60 * 60 * 1000;
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Đã hết hạn';
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m còn lại`;
};

const TeacherAIHistory = () => {
  const [session, setSession] = useState<AiSessionResponse | null>(null);
  const [history, setHistory] = useState<AiHistoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AiHistoryRequest | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sessionData, historyData] = await Promise.all([
          aiHistoryApi.getTeacherLatestSession(),
          aiHistoryApi.getTeacherHistory(),
        ]);
        setSession(sessionData);
        setHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch sử AI');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      title="Lịch sử AI của giáo viên"
      subtitle="Xem lại các yêu cầu bạn đã gửi cho AI"
      chipLabel="Khu vực giáo viên"
    >
      {/* Current Session Card */}
      {!loading && session && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            border: '1px solid #d6e7f4',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #f0fdf4 100%)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle1" fontWeight={700} color="#12344d">
              Phiên AI hiện tại
            </Typography>
            <Chip
              size="small"
              label={getStatusColor(session.status).label}
              sx={{
                bgcolor: getStatusColor(session.status).bg,
                color: getStatusColor(session.status).color,
                fontWeight: 700,
              }}
            />
          </Stack>
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <Box>
              <Typography variant="caption" color="text.secondary">Model</Typography>
              <Typography variant="body2" fontWeight={600}>{session.ai_model}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Tạo lúc</Typography>
              <Typography variant="body2" fontWeight={600}>{formatDateTime(session.created_at)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Hoạt động cuối</Typography>
              <Typography variant="body2" fontWeight={600}>{formatDateTime(session.last_activity)}</Typography>
            </Box>
            {session.status === 'active' && (
              <Box>
                <Typography variant="caption" color="text.secondary">Thời gian</Typography>
                <Typography variant="body2" fontWeight={600} color="#059669">
                  {getTimeRemaining(session.created_at)}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Số yêu cầu</Typography>
              <Typography variant="body2" fontWeight={600}>{session.requests?.length ?? 0}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Input tokens</Typography>
              <Typography variant="body2" fontWeight={600}>{(session.total_input_tokens ?? 0).toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Output tokens</Typography>
              <Typography variant="body2" fontWeight={600}>{(session.total_output_tokens ?? 0).toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Tổng tokens</Typography>
              <Typography variant="body2" fontWeight={600}>
                {((session.total_input_tokens ?? 0) + (session.total_output_tokens ?? 0)).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Chi phí ước tính</Typography>
              <Typography variant="body2" fontWeight={600} color="#b45309">
                {((session.estimated_cost_cents ?? 0) / 100).toFixed(4)} $
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

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
                    Tin nhắn
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
                    {(item.messages?.find(m => m.responder === 'user')?.content) || '(Không có tin nhắn)'}
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
                  Lịch sử hội thoại
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 300, overflow: 'auto' }}>
                  <Stack spacing={1}>
                    {selectedRequest.messages?.length ? selectedRequest.messages.map((msg, idx) => (
                      <Box key={idx} sx={{ p: 1, borderRadius: 1, bgcolor: msg.responder === 'user' ? '#eaf3ff' : '#f0fdf4' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: msg.responder === 'user' ? '#145ea1' : '#166534' }}>
                          {msg.responder === 'user' ? 'Bạn' : 'AI'} — {formatDateTime(msg.at)}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{msg.content}</Typography>
                      </Box>
                    )) : (
                      <Typography variant="body2" color="text.secondary">(Không có tin nhắn)</Typography>
                    )}
                  </Stack>
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
                    {readResponseText(selectedRequest) ?? 'Endpoint hiện không trả response chi tiết cho mục này.'}
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

export default TeacherAIHistory;
