import {
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";

export type QuizMaterial = {
  _id: string;
  title: string;
  type: string;
  dateCreate: string;
  status: string;
  class_assign_id: string;
  content_id?: string;
};

type DueAssignmentRowProps = {
  quiz: QuizMaterial;
  onClick?: () => void;
};

const getStatusChip = (status: string) => {
  switch (status) {
    case "published":
      return { label: "Published", color: "success" } as const;
    case "draft":
      return { label: "Draft", color: "default" } as const;
    case "reviewed":
      return { label: "Reviewed", color: "info" } as const;
    case "deleted":
      return { label: "Deleted", color: "error" } as const;
    default:
      return { label: status, color: "default" } as const;
  }
};

const DueAssignmentRow = ({ quiz, onClick }: DueAssignmentRowProps) => {
  const status = getStatusChip(quiz.status);

  return (
    <TableRow
      hover
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? {
          backgroundColor: "action.hover",
        } : {},
      }}
    >
      <TableCell>
        <Typography variant="subtitle2">{quiz.title}</Typography>
      </TableCell>
      <TableCell>{new Date(quiz.dateCreate).toLocaleDateString()}</TableCell>
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
