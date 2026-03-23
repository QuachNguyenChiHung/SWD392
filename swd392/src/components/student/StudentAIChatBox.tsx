import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Stack, Paper, TextField, IconButton,
  Avatar, Chip, CircularProgress, Fade
} from '@mui/material';
import { Send, SmartToy, Person, AutoAwesome } from '@mui/icons-material';
import { apiService } from '../../services/api';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  'Giải thích khái niệm nguyên tử',
  'Tóm tắt bài học hóa học',
  'Ví dụ phản ứng hóa học',
  'Giải thích bảng tuần hoàn',
];

interface StudentAIChatProps {
  courseContext?: string;
}

export default function StudentAIChat({ courseContext }: StudentAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI học tập. Tôi có thể giúp bạn giải thích các khái niệm, tóm tắt bài học, hoặc trả lời câu hỏi về môn học. Bạn cần giúp gì?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: any = await apiService.post('/claude', { prompt: text.trim(), courseContext });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res?.message || 'Xin lỗi, tôi không thể trả lời lúc này.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32 }}>
          <SmartToy sx={{ fontSize: 18 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" fontWeight="bold">Trợ lý AI</Typography>
            <Chip label="Beta" size="small" sx={{ bgcolor: '#f0f7ff', color: '#6366f1', fontWeight: 'bold', height: 16, fontSize: '0.6rem' }} />
          </Stack>
          <Typography variant="caption" color="text.secondary">Hỏi bất cứ điều gì về bài học</Typography>
        </Box>
        <AutoAwesome sx={{ color: '#6366f1', fontSize: 18 }} />
      </Stack>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        <Stack spacing={1.5}>
          {messages.map((msg) => (
            <Fade key={msg.id} in timeout={300}>
              <Stack
                direction={msg.role === 'user' ? 'row-reverse' : 'row'}
                spacing={1}
                alignItems="flex-start"
              >
                <Avatar sx={{ width: 28, height: 28, flexShrink: 0, bgcolor: msg.role === 'assistant' ? '#6366f1' : '#0ea5e9' }}>
                  {msg.role === 'assistant'
                    ? <SmartToy sx={{ fontSize: 16 }} />
                    : <Person sx={{ fontSize: 16 }} />
                  }
                </Avatar>
                <Box sx={{ maxWidth: '78%' }}>
                  <Paper
                    sx={{
                      p: 1.25, borderRadius: 2,
                      bgcolor: msg.role === 'user' ? '#eff6ff' : '#f8fafc',
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                      borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 12,
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <Box sx={{
                        '& p': { m: 0, mb: 0.5, fontSize: '0.8rem', lineHeight: 1.5 },
                        '& p:last-child': { mb: 0 },
                        '& ul, & ol': { m: 0, pl: 2, mb: 0.5, fontSize: '0.8rem' },
                        '& li': { mb: 0.25 },
                        '& code': { bgcolor: '#e2e8f0', px: 0.5, borderRadius: 0.5, fontSize: '0.75rem', fontFamily: 'monospace' },
                        '& pre': { bgcolor: '#1e293b', color: '#e2e8f0', p: 1, borderRadius: 1, overflow: 'auto', mb: 0.5, fontSize: '0.75rem' },
                        '& pre code': { bgcolor: 'transparent', px: 0, color: 'inherit' },
                        '& strong': { fontWeight: 700 },
                        '& h1, & h2, & h3, & h4': { fontSize: '0.85rem', fontWeight: 700, mt: 0.5, mb: 0.25 },
                        '& blockquote': { borderLeft: '3px solid #6366f1', pl: 1, ml: 0, color: '#64748b', fontStyle: 'italic' },
                        '& table': { borderCollapse: 'collapse', width: '100%', fontSize: '0.75rem', mb: 0.5 },
                        '& th, & td': { border: '1px solid #e2e8f0', px: 1, py: 0.25 },
                        '& th': { bgcolor: '#f1f5f9', fontWeight: 700 },
                        wordBreak: 'break-word',
                      }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.5,
                          fontSize: '0.8rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </Typography>
                    )}
                  </Paper>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              </Stack>
            </Fade>
          ))}

          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#6366f1' }}>
                <SmartToy sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper sx={{ p: 1.25, borderRadius: 2, bgcolor: '#f8fafc' }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CircularProgress size={12} />
                  <Typography variant="caption" color="text.secondary">Đang trả lời...</Typography>
                </Stack>
              </Paper>
            </Stack>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <Box sx={{ px: 1.5, pb: 1, flexShrink: 0 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                onClick={() => sendMessage(prompt)}
                sx={{ cursor: 'pointer', bgcolor: '#f0f7ff', color: '#6366f1', fontSize: '0.65rem', '&:hover': { bgcolor: '#e0edff' } }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ p: 1, borderTop: '1px solid #e2e8f0', flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
        <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ width: '100%' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Nhập câu hỏi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, fontSize: '0.8rem',
                '& fieldset': { borderColor: '#e2e8f0' },
              }
            }}
          />
          <IconButton
            size="small"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            sx={{
              flexShrink: 0,
              bgcolor: input.trim() && !loading ? '#6366f1' : '#f1f5f9',
              color: input.trim() && !loading ? 'white' : '#94a3b8',
              borderRadius: 1.5,
              '&:hover': { bgcolor: '#4f46e5', color: 'white' },
              '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#94a3b8' }
            }}
          >
            <Send sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}