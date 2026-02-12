import { useState } from "react";
import {
  IconButton,
  TableCell,
  TableRow,
  Typography,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export type ClassTableRowProps = {
  title: string;
  courseCode: string;
  studentCount: number;
  createdAt: string;
  classKey: string;
  classId: string;
};

const maskKey = (key: string) => "•".repeat(Math.max(4, key.length));

const ClassTableRow = ({
  title,
  courseCode,
  studentCount,
  createdAt,
  classKey,
  classId,
}: ClassTableRowProps) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {courseCode}
        </Typography>
      </TableCell>
      <TableCell>{studentCount}</TableCell>
      <TableCell>{createdAt}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {showKey ? classKey : maskKey(classKey)}
          </Typography>
          <Tooltip title={showKey ? "Hide class key" : "Show class key"}>
            <IconButton
              size="small"
              onClick={() => setShowKey((prev) => !prev)}
            >
              {showKey ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small">Quản lý</Button>
          <Button
            size="small"
            component={RouterLink}
            to={`/teacher/class/${classId}`}
          >
            Xem chi tiết
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default ClassTableRow;
