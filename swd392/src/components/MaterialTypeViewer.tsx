import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Download,
  OpenInNew,
  ViewInAr,
  Quiz,
  ExpandMore,
  CheckCircle,
  AddCircleOutline,
  EditOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import { useState } from "react";
import type {
  ClassMaterial,
  FileMaterial,
  SlideMaterial,
  Render2DMaterial,
  Quiz as QuizType,
  Question,
} from "../types/teacherType";
import QuestionFormModal from "./QuestionFormModal";

interface MaterialTypeViewerProps {
  material: ClassMaterial;
  onQuestionsChange?: (questions: Question[]) => void;
}

const isImageExtension = (path: string) =>
  /\.(gif|png|jpg|jpeg|webp|svg)$/i.test(path);

const isPdfExtension = (path: string) => /\.pdf$/i.test(path);

const isPptxExtension = (path: string) => /\.(ppt|pptx)$/i.test(path);

// ─── QuizViewer sub-component (owns modal state, needs useState) ──────────────

interface QuizViewerProps {
  content: QuizType;
  onQuestionsChange?: (questions: Question[]) => void;
}

function QuizViewer({ content, onQuestionsChange }: QuizViewerProps) {
  const [modalState, setModalState] = useState<{
    open: boolean;
    question: Question | null;
  }>({ open: false, question: null });

  if (!content) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="error">Dữ liệu quiz không hợp lệ</Typography>
      </Box>
    );
  }

  if (!content.title) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="error">Quiz thiếu tiêu đề</Typography>
      </Box>
    );
  }

  const canEdit = !!onQuestionsChange;
  const questions = content.questions ?? [];

  const formatDate = (d: Date | null) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "\u2014";

  const TYPE_LABEL: Record<Question["type"], string> = {
    "multiple-choice": "Trắc nghiệm",
    "true-false": "Đúng / Sai",
    "short-answer": "Tự luận",
  };
  const TYPE_COLOR: Record<
    Question["type"],
    "primary" | "secondary" | "default"
  > = {
    "multiple-choice": "primary",
    "true-false": "secondary",
    "short-answer": "default",
  };

  const handleSaveQuestion = (saved: Question) => {
    const updated = questions.some((q) => q._id === saved._id)
      ? questions.map((q) => (q._id === saved._id ? saved : q))
      : [...questions, saved];
    onQuestionsChange?.(updated);
  };

  const handleDeleteQuestion = (id: string) =>
    onQuestionsChange?.(questions.filter((q) => q._id !== id));

  return (
    <Box>
      {/* \u2500\u2500 Header chips \u2500\u2500 */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Quiz color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          {content.title}
        </Typography>
        <Chip
          label={content.type === "interactive" ? "Tương tác" : "Thông thường"}
          color={content.type === "interactive" ? "secondary" : "default"}
          size="small"
        />
        <Chip
          label={content.status ? "Đang hoạt động" : "Không hoạt động"}
          color={content.status ? "success" : "default"}
          size="small"
        />
      </Stack>

      {/* \u2500\u2500 Summary table \u2500\u2500 */}
      <Paper variant="outlined">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Ngày mở</TableCell>
              <TableCell>{formatDate(content.available_date)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Hạn nộp</TableCell>
              <TableCell>{formatDate(content.end_date)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Số lần thử tối đa</TableCell>
              <TableCell>
                {content.max_attempt_number ?? "Không giới hạn"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Câu hỏi</TableCell>
              <TableCell>{questions.length}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* \u2500\u2500 Questions section \u2500\u2500 */}
      <Box mt={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Câu hỏi
          </Typography>
          {canEdit && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddCircleOutline />}
              onClick={() => setModalState({ open: true, question: null })}
            >
              Thêm câu hỏi
            </Button>
          )}
        </Stack>
        <Divider sx={{ mb: 1 }} />

        {questions.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            py={3}
          >
            Chưa có câu hỏi nào.
            {canEdit ? ' Nhấn "Thêm câu hỏi" để bắt đầu.' : ""}
          </Typography>
        )}

        {questions.map((q, index) => (
          <Accordion
            key={q._id}
            disableGutters
            variant="outlined"
            sx={{ mb: 1 }}
          >
            <Box sx={{ position: "relative" }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    pr: canEdit ? 8 : 0, // Add padding when edit buttons are present
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  width="100%"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {q.content}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexShrink={0}
                    alignItems="center"
                  >
                    <Chip
                      label={TYPE_LABEL[q.type]}
                      color={TYPE_COLOR[q.type]}
                      size="small"
                    />
                    {q.has2DVisualization && (
                      <Chip
                        icon={<ViewInAr sx={{ fontSize: 14 }} />}
                        label="2D"
                        color="info"
                        size="small"
                      />
                    )}
                  </Stack>
                </Stack>
              </AccordionSummary>

              {/* Action buttons positioned absolutely outside the AccordionSummary */}
              {canEdit && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 32, // Position next to expand icon
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    gap: 0.5,
                    zIndex: 1,
                  }}
                >
                  <Tooltip title="Chỉnh sửa câu hỏi">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalState({
                          open: true,
                          question: q,
                        });
                      }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xoá câu hỏi">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(q._id as string);
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <AccordionDetails>
              <Stack spacing={1.5}>
                {q.type === "multiple-choice" && q.options && (
                  <List dense disablePadding>
                    {q.options.map((opt) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <ListItem
                          key={opt}
                          disableGutters
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: isCorrect ? "success.50" : "transparent",
                            border: isCorrect
                              ? "1px solid"
                              : "1px solid transparent",
                            borderColor: isCorrect
                              ? "success.light"
                              : "transparent",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {isCorrect && (
                              <CheckCircle
                                sx={{
                                  fontSize: 16,
                                  color: "success.main",
                                }}
                              />
                            )}
                            <Typography variant="body2">{opt}</Typography>
                          </Stack>
                        </ListItem>
                      );
                    })}
                  </List>
                )}

                {q.type === "true-false" && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Đáp án đúng:
                    </Typography>
                    <Chip
                      label={
                        String(q.correctAnswer).charAt(0).toUpperCase() +
                        String(q.correctAnswer).slice(1)
                      }
                      color={q.correctAnswer === "true" ? "success" : "error"}
                      size="small"
                    />
                  </Stack>
                )}

                {q.type === "short-answer" && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Câu trả lời mong đợi:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {String(q.correctAnswer)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <QuestionFormModal
        open={modalState.open}
        question={modalState.question}
        onClose={() => setModalState({ open: false, question: null })}
        onSave={handleSaveQuestion}
      />
    </Box>
  );
}

// ─── SlideViewer sub-component ─────────────────────────────────────────────

interface SlideViewerProps {
  content: SlideMaterial;
}

function SlideViewer({ content }: SlideViewerProps) {
  const isPdf = isPdfExtension(content.file_path);
  const isPptx = isPptxExtension(content.file_path);
  // Treat PPTX as PDF for viewing purposes
  const canPreview = isPdf || isPptx;

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Bộ slide: <strong>{content.slide_name}</strong>
      </Typography>

      {isPptx && (
        <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 1 }}>
          Tệp PowerPoint đang được hiển thị dưới dạng PDF
        </Typography>
      )}

      {/* PDF & PPTX Viewer using Google Docs Viewer (PPTX treated as PDF) */}
      {canPreview && (
        <Box>
          <Box
            component="iframe"
            src={`https://docs.google.com/gview?url=${encodeURIComponent(content.file_path)}&embedded=true`}
            title={content.slide_name}
            sx={{
              width: "100%",
              height: 600,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              mt: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {isPdf ? 'Nếu PDF không hiển thị, vui lòng tải về để xem' : 'Nếu slide không hiển thị, vui lòng tải về để xem'}
          </Typography>
        </Box>
      )}

      {/* Fallback for other formats */}
      {!canPreview && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Không thể xem trước định dạng này. Vui lòng tải về để xem.
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          href={content.file_path}
          download={content.slide_name}
        >
          Tải slide về
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNew />}
          href={content.file_path}
          target="_blank"
          rel="noopener noreferrer"
        >
          Mở tab mới
        </Button>
      </Stack>
    </Box>
  );
}

// ─── FileViewer sub-component ──────────────────────────────────────────────

interface FileViewerProps {
  content: FileMaterial;
}

function FileViewer({ content }: FileViewerProps) {
  const isPdf = isPdfExtension(content.file_path);
  const isPptx = isPptxExtension(content.file_path);
  const isImage = isImageExtension(content.file_path);
  // Treat PPTX as PDF for viewing purposes
  const canShowAsPdf = isPdf || isPptx;

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Tên tệp: <strong>{content.file_name}</strong>
      </Typography>

      {isPptx && (
        <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 1 }}>
          Tệp PowerPoint đang được hiển thị dưới dạng PDF
        </Typography>
      )}

      {/* Image Viewer */}
      {isImage && (
        <Box
          component="img"
          src={content.file_path}
          alt={content.file_name}
          sx={{
            maxWidth: "100%",
            maxHeight: 420,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            objectFit: "contain",
            display: "block",
            mt: 1,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const errorMsg = document.createElement("div");
            errorMsg.textContent = "Không thể tải hình ảnh";
            errorMsg.style.color = "red";
            errorMsg.style.textAlign = "center";
            errorMsg.style.padding = "20px";
            (e.target as HTMLImageElement).parentNode?.appendChild(errorMsg);
          }}
        />
      )}

      {/* PDF & PPTX Viewer using Google Docs Viewer (PPTX treated as PDF) */}
      {canShowAsPdf && (
        <Box>
          <Box
            component="iframe"
            src={`https://docs.google.com/gview?url=${encodeURIComponent(content.file_path)}&embedded=true`}
            title={content.file_name}
            sx={{
              width: "100%",
              height: 600,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              mt: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {isPdf ? 'Nếu PDF không hiển thị, vui lòng tải về để xem' : 'Nếu không hiển thị, vui lòng tải về để xem'}
          </Typography>
        </Box>
      )}

      {/* Fallback for other file types */}
      {!isImage && !canShowAsPdf && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Không thể xem trước loại tệp này. Vui lòng tải về để xem.
        </Typography>
      )}

      <Button
        variant="outlined"
        startIcon={<Download />}
        href={content.file_path}
        download={content.file_name}
        sx={{ mt: 2 }}
      >
        Tải tệp về
      </Button>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MaterialTypeViewer({
  material,
  onQuestionsChange,
}: MaterialTypeViewerProps) {
  // Log material data for debugging (dev only to avoid leaking data in production)
  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    console.log("MaterialTypeViewer rendering with material:", material);
  }

  // Early validation checks
  if (!material) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Dữ liệu tài liệu không hợp lệ: Material không tồn tại
        </Typography>
      </Box>
    );
  }

  if (!material.type) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Dữ liệu tài liệu không hợp lệ: Thiếu loại tài liệu
        </Typography>
      </Box>
    );
  }

  if (!material.content) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Dữ liệu tài liệu không hợp lệ: Thiếu nội dung tài liệu
        </Typography>
      </Box>
    );
  }

  try {
    // ── FILE ──────────────────────────────────────────────────────────────────
    if (material.type === "file") {
      const content = material.content as FileMaterial;

      if (!content.file_name || !content.file_path) {
        return (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="error">
              Dữ liệu tệp không hợp lệ: Thiếu tên hoặc đường dẫn tệp
            </Typography>
          </Box>
        );
      }

      return <FileViewer content={content} />;
    }

    // ── SLIDE ─────────────────────────────────────────────────────────────────
    if (material.type === "slide") {
      const content = material.content as SlideMaterial;

      if (!content.slide_name || !content.file_path) {
        return (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="error">
              Dữ liệu slide không hợp lệ: Thiếu tên hoặc đường dẫn slide
            </Typography>
          </Box>
        );
      }

      return <SlideViewer content={content} />;
    }

    // ── 2D RENDER ─────────────────────────────────────────────────────────────
    if (material.type === "2d_render") {
      const content = material.content as Render2DMaterial;
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            border: "2px dashed",
            borderColor: "primary.light",
            borderRadius: 2,
            bgcolor: "action.hover",
            minHeight: 200,
            gap: 2,
          }}
        >
          <ViewInAr sx={{ fontSize: 56, color: "primary.light" }} />
          <Typography variant="h6" color="text.secondary">
            Trình xem 2D Render
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Tính năng 2D tương tác sắp ra mắt.
          </Typography>
          {content?.render_data && content.render_data !== "{}" && (
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "background.default",
                borderRadius: 1,
                fontSize: 12,
                maxWidth: "100%",
                overflow: "auto",
              }}
            >
              {content.render_data}
            </Box>
          )}
        </Box>
      );
    }

    // ── QUIZ ──────────────────────────────────────────────────────────────────
    if (material.type === "quiz") {
      const content = material.content as QuizType;

      if (!content) {
        return (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="error">
              Dữ liệu quiz không hợp lệ: Thiếu nội dung quiz
            </Typography>
          </Box>
        );
      }

      return (
        <QuizViewer content={content} onQuestionsChange={onQuestionsChange} />
      );
    }

    // Unknown material type
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Loại tài liệu không được hỗ trợ: {material.type}
        </Typography>
      </Box>
    );
  } catch (error) {
    console.error("Error rendering material:", error);
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Đã xảy ra lỗi khi hiển thị tài liệu. Vui lòng thử lại sau.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Chi tiết lỗi:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Typography>
      </Box>
    );
  }
}
