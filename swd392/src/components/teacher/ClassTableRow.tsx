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
import type { Class } from "../../types/teacherType";

const maskKey = (key: string) => "•".repeat(Math.max(4, key.length));

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const ClassTableRow = ({
  class_name,
  course_id,
  course_name,
  studentCount,
  date_create,
  keypass,
  class_id,
}: Class & { studentCount: number }) => {
  const [showKey, setShowKey] = useState(false);
  const createdAt = formatDate(date_create);

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{class_name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {course_name || course_id}
        </Typography>
      </TableCell>
      <TableCell>{studentCount}</TableCell>
      <TableCell>{createdAt}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {showKey ? keypass : maskKey(keypass)}
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
            to={`/teacher/class/${class_id}`}
          >
            Xem chi tiết
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default ClassTableRow;
