import { Box, Paper, Typography } from "@mui/material";
import {
  flatCard,
  statValue,
  statLabel,
  COLORS,
  RADIUS,
} from "../../pages/teacher/teacherStyles";

type CourseProgressCardProps = {
  name: string;
  completed: number;
  total: number;
  onClick?: () => void;
};

const CourseProgressCard = ({
  name,
  completed,
  total,
  onClick,
}: CourseProgressCardProps) => {
  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        ...flatCard,
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? { borderColor: COLORS.accent }
          : {},
        transition: "border-color 0.15s ease",
      }}
    >
      <Typography sx={statLabel} gutterBottom>
        {name}
      </Typography>
      <Typography sx={statValue}>
        {completed}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: COLORS.textSecondary, mt: 0.5 }}
      >
        of {total} students finished
      </Typography>
      <Box
        sx={{
          mt: 1.5,
          height: 3,
          bgcolor: COLORS.borderLight,
          borderRadius: RADIUS,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${completionRate}%`,
            bgcolor: COLORS.accent,
            transition: "width 0.3s ease",
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: COLORS.textSecondary,
          mt: 0.5,
          letterSpacing: "0.05em",
        }}
      >
        {completionRate}%
      </Typography>
    </Paper>
  );
};

export default CourseProgressCard;
