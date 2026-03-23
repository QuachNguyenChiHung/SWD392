import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import StudentPageShell from '../../components/student/StudentPageShell';
import type { AdminUser } from '../../types/adminType';
import { UserRole } from '../../types/adminType';
import { adminUsersApi } from '../../services/adminApi';
import { aiHistoryApi } from '../../services/aiHistoryApi';
import type { AiContentRecord, AiHistoryRequest } from '../../services/aiHistoryApi';

const PAGE_SIZE = 20;

const formatDateTime = (value?: string): string => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('vi-VN');
};

const stringifyUnknown = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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

const getContentRecordText = (record: AiContentRecord): string => {
  const recordJson = record.record_json;
  const recordJsonObj = recordJson && typeof recordJson === 'object' ? (recordJson as Record<string, unknown>) : null;

  const candidates = [
    recordJsonObj?.full_response,
    recordJsonObj?.response,
    record.content,
    record.response,
    record.output,
    record.result,
    record.record_json,
    record.message,
  ] as unknown[];

  for (const candidate of candidates) {
    const text = stringifyUnknown(candidate);
    if (text.trim()) {
      return markdownToPlainText(text);
    }
  }
  return '(Không có content)';
};

const AdminAIHistory = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [history, setHistory] = useState<AiHistoryRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AiHistoryRequest | null>(null);
  const [contents, setContents] = useState<AiContentRecord[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    const fetchTargetUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);

        const mergedUsers: AdminUser[] = [];
        const visitedIds = new Set<string>();

        let currentPage = 1;
        let expectedTotal = Number.POSITIVE_INFINITY;
        const MAX_PAGES = 30;

        while (currentPage <= MAX_PAGES && mergedUsers.length < expectedTotal) {
          const response = await adminUsersApi.getAllUsers({ page: currentPage, limit: 50 });
          expectedTotal = response.total || expectedTotal;

          if (!response.users.length) {
            break;
          }

          for (const user of response.users) {
            if (visitedIds.has(user._id)) {
              continue;
            }
            visitedIds.add(user._id);

            if (user.role === UserRole.STUDENT || user.role === UserRole.TEACHER) {
              mergedUsers.push(user);
            }
          }

          currentPage += 1;
        }

        setUsers(mergedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchTargetUsers();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedUserId) {
        setHistory([]);
        setTotal(0);
        return;
      }

      try {
        setLoadingHistory(true);
        setError(null);
        const response = await aiHistoryApi.getAdminHistoryByUser(selectedUserId, page);
        setHistory(response.data);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải lịch sử AI của người dùng');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedUserId, page]);

  const selectedUser = useMemo(
    () => users.find((item) => item._id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleViewDetail = async (request: AiHistoryRequest) => {
    setSelectedRequest(request);
    setContents([]);
    setDetailOpen(true);

    try {
      setLoadingContent(true);
      const records = await aiHistoryApi.getAdminRequestContent(request._id);
      setContents(records);
    } catch (err) {
      setContents([
        {
          message: err instanceof Error ? err.message : 'Không thể tải content của request',
        },
      ]);
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <StudentPageShell
      title="Lịch sử AI người dùng"
      subtitle="Admin xem lịch sử AI của học sinh và giáo viên, gồm prompt và response"
      chipLabel="Khu vực quản trị"
    >
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1px solid #d6e7f4',
            backgroundColor: '#fff',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <FormControl sx={{ minWidth: 320 }} size="small">
              <InputLabel id="ai-history-user">Chọn học sinh/giáo viên</InputLabel>
              <Select
                labelId="ai-history-user"
                label="Chọn học sinh/giáo viên"
                value={selectedUserId}
                onChange={(event) => {
                  setSelectedUserId(event.target.value);
                  setPage(1);
                }}
                disabled={loadingUsers}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} - {user.email} ({user.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedUser && (
              <Chip
                label={`Đang xem: ${selectedUser.username} (${selectedUser.role})`}
                sx={{ bgcolor: '#eaf3ff', color: '#145ea1', fontWeight: 700 }}
              />
            )}
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {!selectedUserId && !loadingUsers && (
          <Alert severity="info">Vui lòng chọn user để xem lịch sử AI.</Alert>
        )}

        {loadingUsers && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #d6e7f4' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          </Paper>
        )}

        {selectedUserId && !loadingUsers && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #d6e7f4',
              backgroundColor: '#fff',
            }}
          >
            {loadingHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : history.length === 0 ? (
              <Alert severity="info">User này chưa có lịch sử AI.</Alert>
            ) : (
              <Stack spacing={2}>
                {history.map((item) => (
                  <Paper key={item._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={`ID: ${item._id}`} />
                        <Chip size="small" label={`Loại: ${item.type ?? 'unknown'}`} />
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
                        {(item.messages?.find(m => m.responder === 'user')?.content) || '(Không có tin nhắn)'}
                      </Typography>

                      <Box>
                        <Button variant="outlined" size="small" onClick={() => handleViewDetail(item)}>
                          Xem prompt + response
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {history.length > 0 && pageCount > 1 && (
              <Stack alignItems="center" mt={2.5}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, nextPage) => setPage(nextPage)}
                  color="primary"
                  size="small"
                />
              </Stack>
            )}
          </Paper>
        )}
      </Stack>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Chi tiết request AI</DialogTitle>
        <DialogContent>
          {!selectedRequest ? null : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip size="small" label={`Request ID: ${selectedRequest._id}`} />
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
                          {msg.responder === 'user' ? 'Người dùng' : 'AI'} — {formatDateTime(msg.at)}
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

              <Typography variant="subtitle2" sx={{ color: '#12344d' }}>
                Content records
              </Typography>

              {loadingContent ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : contents.length === 0 ? (
                <Alert severity="info">Không có content record cho request này.</Alert>
              ) : (
                <Stack spacing={1.4}>
                  {contents.map((record, index) => (
                    <Paper key={`${record._id ?? 'record'}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip size="small" label={`Record ${index + 1}`} />
                          {record._id && <Chip size="small" label={`ID: ${record._id}`} />}
                          {record.ai_request_id && <Chip size="small" label={`ai_request_id: ${record.ai_request_id}`} />}
                          {record.content_type && <Chip size="small" label={`content_type: ${record.content_type}`} />}
                          {record.review_status && <Chip size="small" label={`review_status: ${record.review_status}`} />}
                          {(record.date || record.createdAt) && (
                            <Chip size="small" label={formatDateTime(record.date ?? record.createdAt)} />
                          )}
                        </Stack>
                        <Paper
                          variant="outlined"
                          sx={{ p: 1.25, backgroundColor: '#f8fbff', whiteSpace: 'pre-wrap', maxHeight: 320, overflow: 'auto' }}
                        >
                          <Typography variant="body2">{getContentRecordText(record)}</Typography>
                        </Paper>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </StudentPageShell>
  );
};

export default AdminAIHistory;
