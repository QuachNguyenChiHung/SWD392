import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Stack, Paper, Button,
    Radio, RadioGroup, FormControlLabel, LinearProgress,
    Divider, IconButton, Grid, // Sử dụng Grid2 để hỗ trợ prop 'size'
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
    Timer, ChevronLeft, ChevronRight, Send,
    FlagOutlined, Flag, WarningAmber
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

const QuizTakingInterface = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeLeft, setTimeLeft] = useState(1800);
    const [flagged, setFlagged] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);

    const questions = [
        { id: 1, text: "Axit nào sau đây là axit mạnh?", options: ["HCl", "CH3COOH", "H2S", "H2CO3"] },
        { id: 2, text: "Công thức hóa học của muối ăn là gì?", options: ["KCl", "NaCl", "MgCl2", "CaCl2"] },
        { id: 3, text: "Nguyên tố nào phổ biến nhất trong vỏ Trái Đất?", options: ["Sắt", "Nhôm", "Oxy", "Silic"] },
    ];

    const executeSubmit = useCallback(() => {
        setOpenConfirm(false);
        setIsFinished(true);
        console.log(`Quiz ${id} submitted:`, answers);
    }, [answers, id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    executeSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [executeSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (Object.keys(answers).length / questions.length) * 100;

    if (isFinished) {
        return (
            <Box sx={{ p: 5, textAlign: 'center', mt: 10 }}>
                <Paper elevation={0} sx={{ p: 5, border: '1px solid #e2e8f0', borderRadius: 4, maxWidth: 500, mx: 'auto' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>Hoàn thành!</Typography>
                    <Typography color="text.secondary" mb={3}>Bài làm của bạn đã được ghi nhận thành công.</Typography>
                    <Button variant="contained" size="large" onClick={() => navigate('/student/quizzes')}> 
                        Quay lại danh sách 
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            {/* Header Bar */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', position: 'sticky', top: 10, zIndex: 10 }}>
                <Grid container alignItems="center">
                    <Grid size={{ xs: 4 }}>
                        <Typography variant="subtitle2" color="text.secondary">Mã bài thi: {id}</Typography>
                        <Typography fontWeight="bold">Hóa đại cương A1</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <Timer color={timeLeft < 300 ? "error" : "primary"} />
                            <Typography variant="h5" fontWeight="900" color={timeLeft < 300 ? "error.main" : "text.primary"}>
                                {formatTime(timeLeft)}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
                        <Button variant="contained" startIcon={<Send />} onClick={() => setOpenConfirm(true)} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            Nộp bài
                        </Button>
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 6, borderRadius: 3 }} />
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, minHeight: 400 }}>
                        <Stack direction="row" justifyContent="space-between" mb={3}>
                            <Typography variant="h6" color="primary" fontWeight="bold">Câu {currentIdx + 1}</Typography>
                            <IconButton onClick={() => setFlagged(prev => prev.includes(currentIdx) ? prev.filter(i => i !== currentIdx) : [...prev, currentIdx])}>
                                {flagged.includes(currentIdx) ? <Flag color="error" /> : <FlagOutlined />}
                            </IconButton>
                        </Stack>

                        <Typography variant="h5" mb={4} sx={{ fontWeight: 500 }}>{questions[currentIdx].text}</Typography>

                        <RadioGroup value={answers[currentIdx] || ''} onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}>
                            <Stack spacing={2}>
                                {questions[currentIdx].options.map((opt) => (
                                    <Paper 
                                        key={opt} 
                                        variant="outlined" 
                                        sx={{ 
                                            borderRadius: 3, 
                                            borderColor: answers[currentIdx] === opt ? 'primary.main' : '#e2e8f0', 
                                            bgcolor: answers[currentIdx] === opt ? '#f0f7ff' : 'transparent',
                                            transition: '0.2s'
                                        }}
                                    >
                                        <FormControlLabel value={opt} control={<Radio />} label={opt} sx={{ width: '100%', m: 0, px: 2, py: 1 }} />
                                    </Paper>
                                ))}
                            </Stack>
                        </RadioGroup>

                        <Divider sx={{ my: 4 }} />
                        <Stack direction="row" justifyContent="space-between">
                            <Button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} startIcon={<ChevronLeft />}>Câu trước</Button>
                            <Button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(prev => prev + 1)} endIcon={<ChevronRight />} variant="outlined">Tiếp theo</Button>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Navigation Sidebar */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography fontWeight="bold" mb={2}>Tiến độ làm bài</Typography>
                        <Grid container spacing={1}>
                            {questions.map((_, idx) => (
                                <Grid size={{ xs: 2.4 }} key={idx}>
                                    <Button
                                        fullWidth
                                        variant={currentIdx === idx ? "contained" : "outlined"}
                                        onClick={() => setCurrentIdx(idx)}
                                        sx={{
                                            minWidth: 0,
                                            bgcolor: answers[idx] ? (currentIdx === idx ? '' : '#e0f2fe') : '',
                                            borderColor: flagged.includes(idx) ? '#ef4444' : (currentIdx === idx ? '' : '#e2e8f0'),
                                            borderWidth: flagged.includes(idx) ? 2 : 1,
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {idx + 1}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 3 }}>
                             <Typography variant="caption" color="text.secondary" display="block">● Xanh dương: Đã trả lời</Typography>
                             <Typography variant="caption" color="error" display="block">● Viền đỏ: Đã đánh dấu</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Confirm Dialog */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmber color="warning" /> Xác nhận nộp bài?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn đã hoàn thành {Object.keys(answers).length}/{questions.length} câu hỏi.
                        Sau khi nộp, bạn sẽ không thể chỉnh sửa câu trả lời.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenConfirm(false)} color="inherit">Kiểm tra lại</Button>
                    <Button onClick={executeSubmit} variant="contained" autoFocus> Xác nhận nộp </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuizTakingInterface;