import {
    Paper,
    TableContainer,
    TableHead,
    Table,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { type Student } from "../../../types/teacherType";
import { useState, useEffect } from "react";
import { classMaterialProgressionApi } from "../../../services/teacherApi/classMaterialProgressionApi";
import {
    sectionTitle,
    flatCard,
    tableContainer,
    tableHeadRow,
    tableBodyRow,
    loadingContainer,
    COLORS,
} from "../teacherStyles";

interface StudentProgressProp {
    enrollId: string;
    student: Student;
}

interface ProgressRow {
    materialId: string;
    completionStatus: string;
    dateCompleted: string | null;
}

export default function StudentProgress({ enrollId, student }: StudentProgressProp) {
    const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true);
            try {
                const progressList = await classMaterialProgressionApi.getClassProgressForTeacher(enrollId);
                const rows: ProgressRow[] = progressList.map((progress: any) => ({
                    materialId: progress.classmaterial_id?._id || progress.classmaterial_id || "N/A",
                    completionStatus: progress.completion_status,
                    dateCompleted: progress.date_completed
                        ? new Date(progress.date_completed).toLocaleString()
                        : null,
                }));
                setProgressRows(rows);
            } catch (error) {
                console.error("Error fetching progress:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [enrollId]);

    if (loading) {
        return (
            <Paper elevation={0} sx={{ ...flatCard, ...loadingContainer } as SxProps<Theme>}>
                <CircularProgress sx={{ color: COLORS.accent }} />
            </Paper>
        );
    }

    return (
        <Paper elevation={0} sx={flatCard}>
            <Typography sx={sectionTitle}>
                Progress: {student.username} ({student.email})
            </Typography>

            <TableContainer sx={tableContainer}>
                <Table>
                    <TableHead>
                        <TableRow sx={tableHeadRow}>
                            <TableCell>Index</TableCell>
                            <TableCell>Class Material</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date Completed</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {progressRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, border: "none" }}>
                                    <Typography sx={{ color: COLORS.textSecondary }}>
                                        No progress records found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            progressRows.map((row, index) => (
                                <TableRow key={index} sx={tableBodyRow}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                            {row.materialId}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color:
                                                    row.completionStatus === "completed"
                                                        ? COLORS.success
                                                        : row.completionStatus === "in_progress"
                                                            ? COLORS.accent
                                                            : COLORS.textSecondary,
                                            }}
                                        >
                                            {row.completionStatus}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{row.dateCompleted ?? "—"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
