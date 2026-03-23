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
  TextField,
  CircularProgress
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff, Edit, Check, Close } from "@mui/icons-material";
import type { Class } from "../../types/teacherType";
import { useEffect } from "react";
import {
  flatButton,
  flatButtonContained,
  tableBodyRow,
  COLORS,
  RADIUS,
} from "../../pages/teacher/teacherStyles";

interface ClassTableRowProps extends Class {
  onStatusChange?: (
    classItem: Class,
    status: "active" | "inactive" | "archived" | "deleted",
  ) => void;
  onChangeImage?: (classItem: Class) => void;
  onEditName?: (classId: string, newName: string) => Promise<void>;
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
  onEditName,
}: ClassTableRowProps) => {
  const [showKey, setShowKey] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "inactive" | "archived" | "deleted">(status);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(class_name);
  const [isSavingName, setIsSavingName] = useState(false);
  const createdAt = formatDate(date_create);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  const handleClickSaveName = async () => {
    if (!editName.trim() || editName.trim() === class_name) {
      setIsEditingName(false);
      setEditName(class_name);
      return;
    }
    try {
      setIsSavingName(true);
      if (onEditName) await onEditName(_id, editName.trim());
      setIsEditingName(false);
    } catch (err) {
      setEditName(class_name);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <TableRow sx={tableBodyRow}>
      <TableCell>
        {isEditingName ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TextField
              size="small"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={isSavingName}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleClickSaveName();
                if (e.key === "Escape") {
                  setIsEditingName(false);
                  setEditName(class_name);
                }
              }}
              sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: RADIUS, fontSize: '0.875rem', py: 0, height: 32 } }}
            />
            {isSavingName ? (
              <CircularProgress size={16} sx={{ ml: 1 }} />
            ) : (
              <>
                <IconButton size="small" color="success" onClick={handleClickSaveName} sx={{ p: 0.5 }}>
                  <Check fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => {
                  setIsEditingName(false);
                  setEditName(class_name);
                }} sx={{ p: 0.5 }}>
                  <Close fontSize="small" />
                </IconButton>
              </>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: COLORS.textDark }}>
              {class_name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                setEditName(class_name);
                setIsEditingName(true);
              }} 
              sx={{ 
                color: COLORS.textSecondary, 
                padding: 0.5,
                '&:hover': { color: COLORS.accent, bgcolor: COLORS.accentLight }
              }}
            >
              <Edit sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        )}
      </TableCell>
      <TableCell>
        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            color: COLORS.textSecondary,
          }}
        >
          {course_id}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: "0.85rem", color: COLORS.textDark }}>
          {createdAt}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              color: COLORS.textDark,
            }}
          >
            {showKey ? keypass : maskKey(keypass)}
          </Typography>
          <Tooltip title={showKey ? "Hide class key" : "Show class key"}>
            <IconButton
              size="small"
              onClick={() => setShowKey((prev) => !prev)}
              sx={{ color: COLORS.textSecondary }}
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
              borderRadius: RADIUS,
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.8rem',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: COLORS.border,
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
            sx={flatButtonContained}
          >
            Xem chi tiết
          </Button>
          <Button
            size="small"
            variant="outlined"
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
            sx={{
              ...flatButton,
              borderColor: COLORS.border,
              color: COLORS.textDark,
              "&:hover": {
                borderColor: COLORS.accent,
                bgcolor: COLORS.accentLight,
                boxShadow: "none",
              },
            }}
          >
            Đổi ảnh
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default ClassTableRow;
