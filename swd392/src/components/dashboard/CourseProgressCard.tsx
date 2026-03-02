import { Box, Paper, Typography } from "@mui/material";
import type { ClassCompletionStat } from "../../types/teacherType";

type CourseProgressCardProps = ClassCompletionStat & {
  onClick?: () => void;
};

const CourseProgressCard = ({
  class_name,
  completed,
  enrolled,
  onClick,
}: CourseProgressCardProps) => {
  const completionRate =
    enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        height: "100%",
        scrollSnapAlign: "start",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              backgroundColor: "action.hover",
            }
          : {},
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {class_name}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {completed}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        of {enrolled} students finished
      </Typography>
      <Box mt={1}>
        <Typography variant="caption" color="text.secondary">
          {completionRate}% completion
        </Typography>
      </Box>
    </Paper>
  );
};

export default CourseProgressCard;
