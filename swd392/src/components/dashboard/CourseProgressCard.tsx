import { Box, Paper, Typography } from "@mui/material";

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
        {name}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {completed}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        of {total} students finished
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
