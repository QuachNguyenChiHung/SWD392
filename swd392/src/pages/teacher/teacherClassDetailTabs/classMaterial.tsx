import { Box, Typography, Stack, Paper, Button, TextField, Modal, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material";
import {
  Add,
  Description,
  Slideshow,
  ViewInAr,
  Quiz,
  AutoAwesome,
  CloudUpload,
} from "@mui/icons-material";
import { type Topic, type ClassMaterialType, type Question } from "../../../types/teacherType";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionManager from "../../../components/QuestionManager";

const getMaterialIcon = (type: ClassMaterialType) => {
  switch (type) {
    case "file":
      return <Description fontSize="small" />;
    case "slide":
      return <Slideshow fontSize="small" />;
    case "2d_render":
      return <ViewInAr fontSize="small" />;
    case "quiz":
      return <Quiz fontSize="small" />;
    default:
      return <Description fontSize="small" />;
  }
};

interface ClassMaterialProps {
  topics: Topic[];
  classId: string;
}

export default function ClassMaterial({ topics, classId }: ClassMaterialProps) {
  const navigate = useNavigate();
  const [modalClassMaterialCreation, setModalClassMaterialCreation] = useState(false);
  const [selectedMaterialType, setSelectedMaterialType] = useState<ClassMaterialType | "">("");
  const [selectedQuizType, setSelectedQuizType] = useState("standard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [currentTopicId, setCurrentTopicId] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleModalClose = () => {
    setModalClassMaterialCreation(false);
    setSelectedMaterialType("");
    setSelectedQuizType("standard");
    setSelectedFile(null);
    setMaterialName("");
    setMaterialDescription("");
    setCurrentTopicId("");
    setQuizQuestions([]);
  };

  const handleOpenModal = (topicTitle: string) => {
    setCurrentTopicId(topicTitle);
    setModalClassMaterialCreation(true);
  };

  const handleCreateMaterial = () => {
    // Basic validation
    if (!materialName.trim()) {
      alert("Vui lòng nhập tên tài liệu");
      return;
    }
    if (!selectedMaterialType) {
      alert("Vui lòng chọn loại tài liệu");
      return;
    }
    if ((selectedMaterialType === "file" || selectedMaterialType === "slide") && !selectedFile) {
      alert("Vui lòng chọn tệp để tải lên");
      return;
    }
    if (selectedMaterialType === "quiz" && quizQuestions.length === 0) {
      alert("Vui lòng thêm ít nhất một câu hỏi cho bài kiểm tra");
      return;
    }

    // TODO: Implement actual API call to create material
    console.log("Creating material:", {
      name: materialName,
      description: materialDescription,
      type: selectedMaterialType,
      quizType: selectedQuizType,
      questions: quizQuestions,
      file: selectedFile,
      topicId: currentTopicId,
      classId
    });

    // Close modal and reset form
    handleModalClose();
  };

  const handleMaterialClick = (material: any) => {
    navigate(`/teacher/class/${classId}/materials/${material.material_id}`, { state: { material } });
  };
  return (
    <>
      {topics.map((topic) => (
        <Paper key={topic.title} sx={{ p: 3 }}>
          <Stack spacing={2} mb={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{topic.title}</Typography>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="contained" size="small" startIcon={<Add />} onClick={() => handleOpenModal(topic.title)}>
                  Thêm tài liệu
                </Button>
                <Button variant="contained" startIcon={<AutoAwesome />}>
                  Tạo với AI
                </Button>
              </div>

            </Stack>
            <Modal
              open={modalClassMaterialCreation}
              onClose={handleModalClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '80%', md: 800 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                maxHeight: '85vh',
                overflowY: 'auto'
              }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
                  Tạo tài liệu cho chủ đề {currentTopicId}
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Tên tài liệu"
                    variant="outlined"
                    required
                    fullWidth
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                  />
                  <TextField
                    label="Mô tả tài liệu"
                    variant="outlined"
                    multiline
                    rows={3}
                    fullWidth
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                  />
                  <FormControl fullWidth>
                    <InputLabel id="material-type-select-label">Loại tài liệu</InputLabel>
                    <Select
                      labelId="material-type-select-label"
                      id="material-type-select"
                      value={selectedMaterialType}
                      onChange={(e) => setSelectedMaterialType(e.target.value as ClassMaterialType)}
                      label="Loại tài liệu"
                      required
                    >
                      <MenuItem value={"file"}>File</MenuItem>
                      <MenuItem value={"slide"}>Slide</MenuItem>
                      <MenuItem value={"2d_render"}>2D Render</MenuItem>
                      <MenuItem value={"quiz"}>Quiz</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Conditional rendering based on material type */}
                  {(selectedMaterialType === "file" || selectedMaterialType === "slide") && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tải lên {selectedMaterialType === "file" ? "Tệp" : "Slide"}
                      </Typography>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 1 }}
                      >
                        Chọn tệp
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                          accept={selectedMaterialType === "file" ? "*/*" : ".ppt,.pptx,.pdf"}
                        />
                      </Button>
                      {selectedFile && (
                        <Typography variant="body2" color="text.secondary">
                          Đã chọn: {selectedFile.name}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {selectedMaterialType === "2d_render" && (
                    <Box sx={{ p: 2, border: "1px dashed grey", borderRadius: 1, textAlign: 'center' }}>
                      <ViewInAr sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Tính năng 2D Render sắp ra mắt...
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Sẽ hỗ trợ tạo mô hình hóa học 3D tương tác
                      </Typography>
                    </Box>
                  )}

                  {selectedMaterialType === "quiz" && (
                    <Box>
                      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                        <FormLabel component="legend">Loại bài kiểm tra</FormLabel>
                        <RadioGroup
                          value={selectedQuizType}
                          onChange={(e) => setSelectedQuizType(e.target.value)}
                        >
                          <FormControlLabel
                            value="interactive"
                            control={<Radio />}
                            label="Câu hỏi tương tác (có thể có 2D visualization)"
                          />
                          <FormControlLabel
                            value="standard"
                            control={<Radio />}
                            label="Chỉ câu hỏi thông thường"
                          />
                        </RadioGroup>
                      </FormControl>

                      <QuestionManager
                        questions={quizQuestions}
                        onChange={setQuizQuestions}
                        quizType={selectedQuizType as 'interactive' | 'standard'}
                      />
                    </Box>
                  )}

                </Stack>

                <Stack direction="row" spacing={2} justifyContent="end" sx={{ mt: 4 }}>
                  <Button variant="outlined" onClick={handleModalClose}>
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateMaterial}
                    disabled={!materialName.trim() || !selectedMaterialType ||
                      (selectedMaterialType === "quiz" && quizQuestions.length === 0)}
                  >
                    Tạo tài liệu
                  </Button>
                </Stack>
              </Box>
            </Modal>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {topic.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topic.class} · {topic.belongToCourse}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1}>
            {topic?.ClassMaterialType?.map((material) => (
              <Box
                key={material.material_id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  py: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleMaterialClick(material)}
                >
                  {getMaterialIcon(material.type)}
                  <Box>
                    <Typography variant="subtitle2">{material.title}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {{
                        file: "Tệp",
                        slide: "Slide",
                        "2d_render": "2D Render",
                        quiz: "Bài kiểm tra",
                      }[material.type] ?? material.type}
                    </Typography>
                  </Box>
                </Stack>
                <Button size="small" onClick={() => handleMaterialClick(material)}>
                  Xem
                </Button>
              </Box>
            ))}
          </Stack>
        </Paper>
      ))}
    </>
  );
}
