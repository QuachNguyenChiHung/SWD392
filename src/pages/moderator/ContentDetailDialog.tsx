import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Chip,
  TextField,
  Box,
} from "@mui/material";

type ContentItem = {
  id: string;
  author: string;
  source: "user" | "ai";
  text: string;
  flagged?: boolean;
  status?: "pending" | "approved" | "rejected";
};

const ContentDetailDialog: React.FC<{
  open: boolean;
  item: ContentItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onSuspend: (author: string) => void;
}> = ({ open, item, onClose, onApprove, onReject, onSuspend }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    // reset reason when dialog opens or item changes
    if (open) setReason("");
  }, [open, item]);

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chi tiết nội dung</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={700}>{item.author}</Typography>
            <Chip label={item.source === "ai" ? "AI" : "User"} size="small" />
            {item.flagged && (
              <Chip label="Đã báo cáo" color="warning" size="small" />
            )}
            <Chip label={item.status} size="small" />
          </Stack>

          <Box sx={{ whiteSpace: "pre-wrap" }}>
            <Typography>{item.text}</Typography>
          </Box>

          <TextField
            label="Lý do (khi từ chối / tuỳ chọn)"
            size="small"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button
          color="error"
          variant="outlined"
          onClick={() => onReject(item.id, reason || undefined)}
        >
          Từ chối
        </Button>
        <Button
          color="warning"
          variant="text"
          onClick={() => onSuspend(item.author)}
        >
          Đình chỉ tác giả
        </Button>
        <Button
          color="success"
          variant="contained"
          onClick={() => onApprove(item.id)}
        >
          Duyệt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContentDetailDialog;
