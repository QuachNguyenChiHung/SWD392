import { Box, Typography, Stack, Paper, Grid, Tabs, Tab, CircularProgress, Alert } from "@mui/material";
import type { Class, Topic, Student } from "../../types/teacherType";
import ClassMaterial from "./teacherClassDetailTabs/classMaterial";
import StudentList from "./teacherClassDetailTabs/studentList";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import teacherClassApi from "../../services/teacherApi/teacherClassApi";
import { topicApi } from "../../services/teacherApi/topicApi";
import {
  pageTitle,
  pageSubtitle,
  sectionLabel,
  sectionTitle,
  flatCard,
  flatTabs,
  loadingContainer,
  COLORS,
  RADIUS,
} from "./teacherStyles";

const TeacherClassDetail = () => {
  const [tabValue, setTabValue] = useState(0);
  const { classId } = useParams<{ classId: string }>();

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
      <Box sx={loadingContainer}>
        <CircularProgress sx={{ color: COLORS.accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: RADIUS,
            border: `1px solid ${COLORS.error}`,
            boxShadow: "none",
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!classData) {
    return (
      <Box>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            borderRadius: RADIUS,
            border: `1px solid ${COLORS.warning}`,
            boxShadow: "none",
          }}
        >
          Class not found
        </Alert>
      </Box>
    );
  }

  const detailRow = (label: string, value: string) => (
    <Box
      sx={{
        display: "flex",
        py: 1,
        borderBottom: `1px solid ${COLORS.borderLight}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography
        sx={{
          width: 130,
          flexShrink: 0,
          fontWeight: 700,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: COLORS.textSecondary,
          pt: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.875rem", color: COLORS.textDark }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={sectionLabel}>Class Detail</Typography>
        <Typography sx={pageTitle}>
          {classData.class_name}
        </Typography>
        <Typography sx={pageSubtitle}>
          {classData.description || "Quản lý tài liệu học tập theo từng chủ đề, lịch phát hành và tài nguyên hỗ trợ."}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ── Tabs ── */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS,
              boxShadow: "none",
            }}
          >
            <Tabs value={tabValue} onChange={handleTabChange} sx={flatTabs}>
              <Tab label="Chủ đề & Tài liệu" />
              <Tab label="Học sinh" />
            </Tabs>
          </Paper>
        </Grid>

        {/* ── Main Content ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {tabValue === 0 && <ClassMaterial topics={topics} classId={classData._id} />}
            {tabValue === 1 && (
              <StudentList students={students} classData={classData} />
            )}
          </Stack>
        </Grid>

        {/* ── Sidebar ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ ...flatCard, mb: 3 }}>
            <Typography sx={sectionTitle}>
              Tổng quan lớp học
            </Typography>
            <Box>
              {detailRow("Mã khoá học", classData.course_name)}
              {detailRow("Học sinh", String(students.length))}
              {detailRow("Ngày tạo", new Date(classData.date_create).toLocaleDateString())}
              {detailRow("Trạng thái", classData.status)}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              ...flatCard,
              borderLeft: `3px solid ${COLORS.accent}`,
            }}
          >
            <Typography sx={sectionTitle}>
              Nhắc nhở sắp tới
            </Typography>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: "0.85rem", color: COLORS.textDark }}>
                • Phản hồi bài kiểm tra hạn vào thứ Sáu.
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: COLORS.textDark }}>
                • Danh sách thiết bị phòng lab cần xác nhận.
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: COLORS.textDark }}>
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
