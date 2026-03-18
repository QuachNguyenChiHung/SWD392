import { Box, Typography, Stack, Paper, Grid, Tabs, Tab, CircularProgress, Alert } from "@mui/material";
import type { Class, Topic, Student } from "../../types/teacherType";
import ClassMaterial from "./teacherClassDetailTabs/classMaterial";
import StudentList from "./teacherClassDetailTabs/studentList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import teacherClassApi from "../../services/teacherApi/teacherClassApi";
import { topicApi } from "../../services/teacherApi/topicApi";

const TeacherClassDetail = () => {
  const [tabValue, setTabValue] = useState(0);
  const { classId } = useParams<{ classId: string }>();

  // State for actual data
  const [classData, setClassData] = useState<Class | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) {
        setError("Class ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const classResponse = await teacherClassApi.getClassById(classId);
        setClassData(classResponse);

        const studentsResponse = await teacherClassApi.getStudentsByClass(classId);
        setStudents(studentsResponse);

        if (classResponse.course_id) {
          const topicsResponse = await topicApi.getTopicsByCourse(classResponse.course_id);
          setTopics(topicsResponse.topics || []);
        }

      } catch (err) {
        console.error('Error fetching class data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch class data');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!classData) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Class not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {classData.class_name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {classData.description || "Quản lý tài liệu học tập theo từng chủ đề, lịch phát hành và tài nguyên hỗ trợ."}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Chủ đề & Tài liệu" />
              <Tab label="Học sinh" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {tabValue === 0 && <ClassMaterial topics={topics} classId={classData._id} />}
            {tabValue === 1 && (
              <StudentList students={students} classData={classData} />
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tổng quan lớp học
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Mã khoá học:</strong> {classData.course_name}
              </Typography>
              <Typography variant="body2">
                <strong>Học sinh đã đăng ký:</strong> {students.length}
              </Typography>
              <Typography variant="body2">
                <strong>Ngày tạo:</strong> {new Date(classData.date_create).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Trạng thái:</strong> {classData.status}
              </Typography>
            </Stack>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nhắc nhở sắp tới
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Phản hồi bài kiểm tra hạn vào thứ Sáu.
              </Typography>
              <Typography variant="body2">
                • Danh sách thiết bị phòng lab cần xác nhận.
              </Typography>
              <Typography variant="body2">
                • Bản nháp bản tin phụ huynh đang chờ hoàn thiện.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherClassDetail;
