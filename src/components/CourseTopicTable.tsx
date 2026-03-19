import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
} from "@mui/material";
import type { CourseTopicInfo } from "../types/teacherType";

interface CourseTopicTableProps {
    topics: CourseTopicInfo[];
    courseName: string;
}

const truncateDescription = (description: string | undefined, maxLength: number = 60): string => {
    if (!description) return "Chưa có mô tả";
    return description.length > maxLength
        ? `${description.substring(0, maxLength)}...`
        : description;
};

export default function CourseTopicTable({ topics, courseName }: CourseTopicTableProps) {
    if (!topics || topics.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    Khóa học này chưa có chủ đề nào
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Chủ đề trong khóa học "{courseName}" ({topics.length} chủ đề)
            </Typography>
            <Paper sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>STT</TableCell>
                            <TableCell>Tên chủ đề</TableCell>
                            <TableCell>Mô tả</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topics
                            .sort((a, b) => a.order_num - b.order_num)
                            .map((topic, index) => (
                                <TableRow key={topic.topic_id} hover>
                                    <TableCell>
                                        <Chip
                                            label={topic.order_num || index + 1}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {topic.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            title={topic.description || "Chưa có mô tả"}
                                        >
                                            {truncateDescription(topic.description)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}