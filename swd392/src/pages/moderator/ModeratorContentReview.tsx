import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import moderationService from "../../services/moderation";
import ContentDetailDialog from "./ContentDetailDialog";

type ContentItem = {
  id: string;
  author: string;
  source: "user" | "ai";
  text: string;
  flagged?: boolean;
  status?: "pending" | "approved" | "rejected";
};

const ModeratorContentReview: React.FC<{ showOnlyFlagged?: boolean }> = ({
  showOnlyFlagged = false,
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const setLoading = (id: string, v: boolean) =>
    setLoadingIds((s) => ({ ...s, [id]: v }));

  // Fetch pending contents from the moderation service
  useEffect(() => {
    let mounted = true;
    const fetchItems = async () => {
      try {
        const list =
          await moderationService.getPendingContents(showOnlyFlagged);
        if (!mounted) return;
        setItems(list);
      } catch (err) {
        console.warn("Failed to load pending contents", err);
      }
    };

    fetchItems();

    return () => {
      mounted = false;
    };
  }, [showOnlyFlagged]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const confirmText =
      action === "approve"
        ? `Bạn có chắc muốn DUYỆT mục của ${item.author}?`
        : `Bạn có chắc muốn TỪ CHỐI mục của ${item.author}?`;

    if (!window.confirm(confirmText)) return;

    try {
      setLoading(id, true);
      if (action === "approve") {
        await moderationService.approveContent(id);
      } else {
        const reason = window.prompt(
          `Lý do từ chối nội dung của ${item.author}?`,
          "Vi phạm chính sách",
        );
        await moderationService.rejectContent(id, reason || undefined);
      }

      // refresh the pending list from the service (approved/rejected items
      // will no longer be pending)
      const list = await moderationService.getPendingContents(showOnlyFlagged);
      setItems(list);

      setSnack({
        open: true,
        message: `Đã ${action === "approve" ? "duyệt" : "từ chối"} thành công.`,
        severity: "success",
      });
    } catch (err: any) {
      console.error(err);
      setSnack({
        open: true,
        message: `Lỗi khi ${action}: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    } finally {
      setLoading(id, false);
    }
  };

  const handleSuspendAuthor = async (author: string) => {
    if (!window.confirm(`Đình chỉ tài khoản tác giả ${author}?`)) return;
    try {
      await moderationService.suspendUser(author, "Bị đình chỉ bởi moderator");
      setSnack({
        open: true,
        message: `Đã đình chỉ ${author}.`,
        severity: "success",
      });
    } catch (err: any) {
      console.error(err);
      setSnack({
        open: true,
        message: `Lỗi khi đình chỉ: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    }
  };

  // --- Modal (UI-only) handlers ---
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const openDetail = (item: ContentItem) => setSelected(item);
  const closeDetail = () => setSelected(null);

  // Local-only approve/reject/suspend used by the dialog (no API call)
  const handleApproveLocal = async (id: string) => {
    try {
      await moderationService.approveContent(id);
      const list = await moderationService.getPendingContents(showOnlyFlagged);
      setItems(list);
      setSnack({
        open: true,
        message: `Đã duyệt nội dung.`,
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi khi duyệt: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    }
    closeDetail();
  };

  const handleRejectLocal = async (id: string, reason?: string) => {
    try {
      await moderationService.rejectContent(id, reason);
      const list = await moderationService.getPendingContents(showOnlyFlagged);
      setItems(list);
      setSnack({
        open: true,
        message: `Đã từ chối nội dung. ${reason ? `(Lý do: ${reason})` : ""}`,
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi khi từ chối: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    }
    closeDetail();
  };

  const handleSuspendAuthorLocal = async (author: string) => {
    try {
      await moderationService.suspendUser(
        author,
        "(mô phỏng) đình chỉ từ dialog",
      );
      setSnack({
        open: true,
        message: `Đã (mô phỏng) đình chỉ ${author}.`,
        severity: "success",
      });
    } catch (err: any) {
      setSnack({
        open: true,
        message: `Lỗi khi đình chỉ: ${err?.message ?? "unknown"}`,
        severity: "error",
      });
    }
    closeDetail();
  };

  const visible = items.filter((i) => (showOnlyFlagged ? i.flagged : true));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Nội dung chờ duyệt
      </Typography>
      {visible.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Không có nội dung phù hợp.
        </Typography>
      )}

      <Stack spacing={2}>
        {visible.map((it) => (
          <Card key={it.id} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 36, height: 36 }}>
                  {it.author[0].toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight="bold">{it.author}</Typography>
                    <Chip
                      label={it.source === "ai" ? "AI" : "User"}
                      size="small"
                    />
                    {it.flagged && (
                      <Chip label="Đã báo cáo" color="warning" size="small" />
                    )}
                    <Chip label={it.status} size="small" />
                  </Stack>
                  <Typography sx={{ mt: 1 }}>{it.text}</Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    onClick={() => handleAction(it.id, "approve")}
                    disabled={it.status === "approved" || !!loadingIds[it.id]}
                  >
                    Duyệt
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleAction(it.id, "reject")}
                    disabled={it.status === "rejected" || !!loadingIds[it.id]}
                  >
                    Từ chối
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => handleSuspendAuthor(it.author)}
                  >
                    Đình chỉ tác giả
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openDetail(it)}
                  >
                    Xem chi tiết
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <ContentDetailDialog
        open={!!selected}
        item={selected}
        onClose={closeDetail}
        onApprove={(id: string) => handleApproveLocal(id)}
        onReject={(id: string, reason?: string) =>
          handleRejectLocal(id, reason)
        }
        onSuspend={(author: string) => handleSuspendAuthorLocal(author)}
      />
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Ghi chú: hành động này là mô phỏng; tích hợp với API thực tế nên gọi
        endpoint duyệt/từ chối và ghi log.
      </Typography>
    </Box>
  );
};

export default ModeratorContentReview;
