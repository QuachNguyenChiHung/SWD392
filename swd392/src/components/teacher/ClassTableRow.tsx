import { useState } from "react";
import {
  IconButton,
  TableCell,
  TableRow,
  Typography,
  Tooltip,
  Button,
  Stack,
  Select,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { Class } from "../../types/teacherType";
import { useEffect } from "react";

interface ClassTableRowProps extends Class {
  onStatusChange?: (
    classItem: Class,
    status: "active" | "inactive" | "archived" | "deleted",
  ) => void;
  onChangeImage?: (classItem: Class) => void;
}

const maskKey = (key: string) => "•".repeat(Math.max(4, key.length));

const formatDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const ClassTableRow = ({
  class_name,
  course_id,
  course_name,
  status,
  date_create,
  keypass,
  _id,
  teacher_id,
  img_cover_link,
  image_cover_id,
  date_update,
  onStatusChange,
  onChangeImage,
}: ClassTableRowProps) => {
  const [showKey, setShowKey] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive" | "archived" | "deleted">(status);
  const createdAt = formatDate(date_create);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2">{class_name}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {course_id}
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
          <Select
            size="small"
            value={selectedStatus}
            onChange={(e) => {
              const nextStatus = e.target.value as "active" | "inactive" | "archived" | "deleted";
              setSelectedStatus(nextStatus);
              onStatusChange?.({
                _id,
                class_name,
                course_id,
                course_name,
                status,
                date_create,
                date_update,
                keypass,
                teacher_id,
                img_cover_link,
                image_cover_id,
              }, nextStatus);
            }}
            sx={{
              minWidth: 100,
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.8rem',
              },
            }}
          >
            <MenuItem value="active">Hoạt động</MenuItem>
            <MenuItem value="inactive">Tạm dừng</MenuItem>
            <MenuItem value="archived">Lưu trữ</MenuItem>
            <MenuItem value="deleted">Đã xóa</MenuItem>
          </Select>
          <Button
            size="medium"
            variant="contained"
            component={RouterLink}
            to={`/teacher/class/${_id}`}
          >
            Xem chi tiết
          </Button>
          <Button
            size="small"
            color="success"
            variant="contained"
            onClick={() =>
              onChangeImage?.({
                _id,
                class_name,
                course_id,
                course_name,
                status,
                date_create,
                date_update,
                keypass,
                teacher_id,
                img_cover_link,
                image_cover_id,
              })
            }
          >
            Đổi ảnh
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default ClassTableRow;
