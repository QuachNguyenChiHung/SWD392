import {
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import type { DueAssignment } from "../../types";

type DueAssignmentRowProps = {
  assignment: DueAssignment;
};

const formatDate = (value: Date | null) =>
  value ? value.toLocaleDateString() : "TBD";

const getQuizStatus = (assignment: DueAssignment) => {
  const now = new Date();

  if (assignment.end_date && now > assignment.end_date) {
    return { label: "Late", color: "error" } as const;
  }

  if (assignment.available_date && now < assignment.available_date) {
    return { label: "Due", color: "warning" } as const;
  }

  return { label: "Available", color: "success" } as const;
};

const DueAssignmentRow = ({ assignment }: DueAssignmentRowProps) => {
  const status = getQuizStatus(assignment);

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{assignment.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {assignment.keyword ?? "No keyword"} · {assignment.type} ·{" "}
          {assignment.max_attempt_number ?? "Unlimited"} attempts
        </Typography>
      </TableCell>
      <TableCell>{formatDate(assignment.available_date)}</TableCell>
      <TableCell>{formatDate(assignment.end_date)}</TableCell>
      <TableCell>
        <Chip label={status.label} color={status.color} size="small" />
      </TableCell>
      <TableCell align="right">
        <IconButton size="small">
          <MoreVert fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default DueAssignmentRow;
