import { Box, Typography, Stack, Paper, Grid, Tabs, Tab } from "@mui/material";
import type { Class } from "../../types/teacherType";
import ClassMaterial from "./teacherClassDetailTabs/classMaterial";
import StudentList from "./teacherClassDetailTabs/studentList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mockTopicsByClass, mockStudents, teacherClasses } from "../../../data/teacherMockData";

const TeacherClassDetail = () => {
  const [tabValue, setTabValue] = useState(0);
  const { classId } = useParams<{ classId: string }>();
  const mockClassData: Class = teacherClasses.find(c => c.class_id === classId) || teacherClasses[0]; // Assuming we are showing details for the first class


  useEffect(() => {
    if (classId) {
      //TEMP:
      const mockClassData = teacherClasses.find(c => c.class_id === classId);
      if (!mockClassData) {
        console.warn(`Class with id ${classId} not found in mock data`);
      }
    }
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {mockClassData?.class_name || "Chi tiết lớp học"}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý tài liệu học tập theo từng chủ đề, lịch phát hành và tài nguyên hỗ trợ.
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
            {tabValue === 0 && <ClassMaterial topics={mockTopicsByClass[mockClassData?.class_id || ""] || []} classId={mockClassData?.class_id || ""} />}
            {tabValue === 1 && (
              <StudentList students={mockStudents} classData={mockClassData} />
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
                <strong>Mã khoá học:</strong> {mockClassData?.course_name || "Chemistry 9 - 2022"}
              </Typography>
              <Typography variant="body2">
                <strong>Học sinh đã đăng ký:</strong> {mockStudents.filter(s => s.student_id.includes(mockClassData?.class_id || "")).length || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Ngày tạo:</strong> {mockClassData?.date_create?.toLocaleDateString() || "12/09/2025"}
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
