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
import { COLORS, tableContainer, tableHeadRow, tableBodyRow, flatChip } from "../../pages/teacher/teacherStyles";

interface QuizAttemptResultsTableProps {
    attempts: QuizAttemptWithResults[];
    loading: boolean;
}

export default function QuizAttemptResultsTable({ attempts, loading }: QuizAttemptResultsTableProps) {
    return (
        <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textDark, mt: 4, mb: 1 }}>
                Kết quả làm bài
            </Typography>
            <Divider sx={{ mb: 3, borderColor: COLORS.borderLight }} />

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress size={28} sx={{ color: COLORS.info }} />
                </Box>
            ) : attempts.length === 0 ? (
                <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, textAlign: "center", py: 4 }}>
                    Chưa có học sinh nào làm bài.
                </Typography>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={tableContainer}>
                    <Table size="small">
                        <TableHead sx={tableHeadRow}>
                            <TableRow>
                                <TableCell sx={{ borderBottomColor: COLORS.info }}>Học sinh</TableCell>
                                <TableCell sx={{ borderBottomColor: COLORS.info }}>Email</TableCell>
                                <TableCell sx={{ borderBottomColor: COLORS.info }}>Lần thử</TableCell>
                                <TableCell sx={{ borderBottomColor: COLORS.info }}>Ngày nộp</TableCell>
                                <TableCell sx={{ borderBottomColor: COLORS.info }}>Điểm</TableCell>
                                <TableCell sx={{ borderBottomColor: COLORS.info }}>Tỉ lệ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attempts.map((item) => (
                                <TableRow key={item.attempt._id} sx={tableBodyRow}>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: COLORS.textDark }}>
                                            {item.attempt.user_id?.username ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: "0.8rem", color: COLORS.textSecondary }}>
                                            {item.attempt.user_id?.email ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.85rem", color: COLORS.textDark }}>
                                        {item.attempt.attempt_number}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.85rem", color: COLORS.textDark }}>
                                        {new Date(item.attempt.date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: item.score && item.score.percentage >= 50 ? COLORS.success : COLORS.error,
                                            }}
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
                                            sx={
                                                item.score && item.score.percentage >= 80
                                                    ? flatChip(COLORS.successBg, COLORS.success)
                                                    : item.score && item.score.percentage >= 50
                                                        ? flatChip(COLORS.warningBg, COLORS.warning)
                                                        : flatChip(COLORS.errorBg, COLORS.error)
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
