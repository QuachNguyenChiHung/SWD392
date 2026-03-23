import { Outlet } from 'react-router-dom';
import { Box, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { AutoAwesome, Biotech, Science, Timeline } from '@mui/icons-material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 3, md: 4 },
        background:
          'radial-gradient(circle at 10% 15%, #dbf2ff 0%, transparent 35%), radial-gradient(circle at 90% 10%, #fce7cf 0%, transparent 40%), linear-gradient(145deg, #ecf6ff 0%, #f8fbff 45%, #fff9ef 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            border: '1px solid #d4e4f5',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(19, 61, 104, 0.12)',
          }}
        >
          <Grid container>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                minHeight: { xs: 320, md: 620 },
                p: { xs: 3, md: 5 },
                color: '#f2f8ff',
                backgroundImage: 'url(/loginImage.png)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden',
              }}
            >
              <Stack
                spacing={2.2}
                sx={{
                  maxWidth: 500,
                  p: { xs: 2, md: 2.6 },
                  borderRadius: 3,
                  backgroundColor: 'rgba(6, 33, 58, 0.45)',
                  backdropFilter: 'blur(2px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Chip
                  icon={<Biotech sx={{ color: '#1f4b2f !important' }} />}
                  label="Nền tảng LMS Hóa học THPT"
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: '#d9f6e9',
                    color: '#1f4b2f',
                    fontWeight: 700,
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ fontSize: 38, mr: 1.1 }} />
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontFamily: '"Space Grotesk", "Nunito", sans-serif',
                    }}
                  >
                    Hóa học THPT
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: { xs: '1rem', md: '1.06rem' }, color: '#d8ecff' }}>
                  Học sâu hơn với AI có kiểm soát, trực quan hóa 2D và lớp học bám sát chương trình chính thức.
                </Typography>

                <Stack spacing={1.2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome fontSize="small" />
                    <Typography>Tạo học liệu AI theo yêu cầu giáo viên</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline fontSize="small" />
                    <Typography>Theo dõi tiến độ và phản hồi học tập</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Biotech fontSize="small" />
                    <Typography>Hoạt động trực quan 2D cho chủ đề trừu tượng</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 430 }}>
                <Outlet />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
