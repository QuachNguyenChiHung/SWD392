import {
    Stack,
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
import { type Student } from "../../../types/teacherType";
import { useState, useEffect } from "react";
import { classMaterialProgressionApi } from "../../../services/teacherApi/classMaterialProgressionApi";

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
            <Paper sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Progress: {student.username} ({student.email})
            </Typography>
            <TableContainer component={Stack} p={2} spacing={2}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Index</TableCell>
                            <TableCell>Class Material</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date Completed</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {progressRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No progress records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            progressRows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.materialId}</TableCell>
                                    <TableCell>{row.completionStatus}</TableCell>
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
