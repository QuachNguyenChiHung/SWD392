import {
    Box,
    Typography,
    Chip,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Divider,
    CircularProgress,
} from "@mui/material";
import type { QuizAttemptWithResults } from "../../services/teacherApi/materialApi/quizAttemptResultApi";

interface QuizAttemptResultsTableProps {
    attempts: QuizAttemptWithResults[];
    loading: boolean;
}

export default function QuizAttemptResultsTable({ attempts, loading }: QuizAttemptResultsTableProps) {
    return (
        <Box>
            <Typography variant="subtitle1" fontWeight={600} mt={4} mb={1}>
                Kết quả làm bài
            </Typography>
            <Divider sx={{ mb: 1 }} />

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : attempts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    Chưa có học sinh nào làm bài.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Học sinh</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Lần thử</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ngày nộp</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Điểm</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Tỉ lệ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attempts.map((item) => (
                                <TableRow key={item.attempt._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">
                                            {item.attempt.user_id?.username ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.attempt.user_id?.email ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{item.attempt.attempt_number}</TableCell>
                                    <TableCell>
                                        {new Date(item.attempt.date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            color={
                                                item.score && item.score.percentage >= 50
                                                    ? "success.main"
                                                    : "error.main"
                                            }
                                        >
                                            {item.score
                                                ? `${item.score.correct}/${item.score.total}`
                                                : "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                item.score
                                                    ? `${item.score.percentage}%`
                                                    : "—"
                                            }
                                            size="small"
                                            color={
                                                item.score && item.score.percentage >= 80
                                                    ? "success"
                                                    : item.score && item.score.percentage >= 50
                                                        ? "warning"
                                                        : "error"
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
