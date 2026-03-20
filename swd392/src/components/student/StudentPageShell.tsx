import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StudentPageShellProps {
  title: string;
  subtitle?: string;
  chipLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const StudentPageShell = ({
  title,
  subtitle,
  chipLabel = 'Khu vực học tập học sinh',
  actions,
  children,
}: StudentPageShellProps) => {
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: { xs: 2, md: 2.5 },
        background:
          'radial-gradient(circle at 0% 0%, #dff5f2 0%, transparent 34%), radial-gradient(circle at 100% 30%, #ffe9cd 0%, transparent 36%), linear-gradient(160deg, #f6fbff 0%, #eef6ff 55%, #fef8ef 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 2.5,
          borderRadius: 4,
          border: '1px solid #d5e3f8',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(244,249,255,0.96))',
          boxShadow: '0 14px 30px rgba(14, 65, 119, 0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Chip
              label={chipLabel}
              sx={{
                mb: 1.5,
                fontWeight: 700,
                bgcolor: '#d9f6e9',
                color: '#175c45',
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Space Grotesk", "Nunito", sans-serif',
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.65rem', md: '2rem' },
                color: '#12344d',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  mt: 0.7,
                  color: '#2f5169',
                  fontFamily: '"Nunito", sans-serif',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions ? <Box sx={{ width: { xs: '100%', md: 'auto' } }}>{actions}</Box> : null}
        </Stack>
      </Paper>

      {children}
    </Box>
  );
};

export default StudentPageShell;
