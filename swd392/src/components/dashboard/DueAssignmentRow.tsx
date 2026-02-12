import {
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import type { ChipProps } from "@mui/material/Chip";
import { MoreVert } from "@mui/icons-material";
import type { DueAssignment } from "../../types";

type DueAssignmentRowProps = {
  assignment: DueAssignment;
  statusColor: ChipProps["color"];
};

const statusLabelMap: Record<DueAssignment["status"], string> = {
  waiting: "Waiting submissions",
  ready: "Ready for grading",
  graded: "Graded successfully",
};

const DueAssignmentRow = ({
  assignment,
  statusColor,
}: DueAssignmentRowProps) => (
  <TableRow hover>
    <TableCell>
      <Typography variant="subtitle2">{assignment.course}</Typography>
      <Typography variant="caption" color="text.secondary">
        {assignment.unit}
      </Typography>
    </TableCell>
    <TableCell>{assignment.dueDate}</TableCell>
    <TableCell>{assignment.completionRate}%</TableCell>
    <TableCell>
      <Chip
        label={statusLabelMap[assignment.status]}
        color={statusColor}
        size="small"
      />
    </TableCell>
    <TableCell align="right">
      <IconButton size="small">
        <MoreVert fontSize="small" />
      </IconButton>
    </TableCell>
  </TableRow>
);

export default DueAssignmentRow;
