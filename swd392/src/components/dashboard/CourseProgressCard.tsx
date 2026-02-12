import { Box, Paper, Typography } from "@mui/material";
import type { ClassCompletionStat } from "../../types";

type CourseProgressCardProps = ClassCompletionStat;

const CourseProgressCard = ({
  course,
  completed,
  enrolled,
}: CourseProgressCardProps) => {
  const completionRate =
    enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
        scrollSnapAlign: "start",
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {course}
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
