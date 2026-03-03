import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  quickActions,
} from "../../../data/teacherMockData";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Giáo viên
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý lớp học và tạo nội dung học tập
      </Typography>
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container direction="column" spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thống kê lớp học
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chức năng này sẽ sớm được cập nhật với dữ liệu thực tế.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Bài kiểm tra sắp đến hạn
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chức năng này sẽ sớm được cập nhật với dữ liệu thực tế.
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tệp đã tải lên gần đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chức năng này sẽ sớm được cập nhật với dữ liệu thực tế.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container direction="column" spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Quick actions</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {quickActions.length} items
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {quickActions.map((action) => (
                      <Paper
                        key={action.title}
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                        <Button variant="contained" size="small">
                          {action.actionLabel}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default TeacherDashboard;
