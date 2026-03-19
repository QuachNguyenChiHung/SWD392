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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success.main';
    case 'inactive': return 'warning.main';
    case 'archived': return 'error.main';
    default: return 'text.secondary';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Hoạt động';
    case 'inactive': return 'Tạm dừng';
    case 'archived': return 'Đã lưu trữ';
    default: return status;
  }
};

const ClassTableRow = ({
  class_name,
  course_id,
  course_name,
  status,
  date_create,
  keypass,
  _id,
}: Class) => {
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
      <TableCell>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {course_id}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{
            color: getStatusColor(status),
            fontWeight: 'medium'
          }}
        >
          {getStatusLabel(status)}
        </Typography>
      </TableCell>
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
            to={`/teacher/class/${_id}`}
          >
            Xem chi tiết
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default ClassTableRow;
