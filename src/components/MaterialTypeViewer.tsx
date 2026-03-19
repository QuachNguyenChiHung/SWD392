import { Box, Typography } from "@mui/material";
import type {
  ClassMaterial,
  FileMaterial,
  SlideMaterial,
  Render2DMaterial,
  Quiz as QuizType,
  Question,
} from "../types/teacherType";
import FileViewer from "./materialViewers/FileViewer";
import SlideViewer from "./materialViewers/SlideViewer";
import Render2DViewer from "./materialViewers/Render2DViewer";
import QuizViewer from "./materialViewers/QuizViewer";

interface MaterialTypeViewerProps {
  material: ClassMaterial;
  onQuestionsChange?: (questions: Question[]) => void;
}

export default function MaterialTypeViewer({
  material,
  onQuestionsChange,
}: MaterialTypeViewerProps) {
  if (!material) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Dữ liệu tài liệu không hợp lệ: Material không tồn tại
        </Typography>
      </Box>
    );
  }

  if (!material.type || !material.content) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          Dữ liệu tài liệu không hợp lệ: Thiếu loại tài liệu
        </Typography>
      </Box>
    );
  }

  try {
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

    if (material.type === "2d_render") {
      return <Render2DViewer content={material.content as Render2DMaterial} />;
    }

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
      return <QuizViewer content={content} onQuestionsChange={onQuestionsChange} />;
    }

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
