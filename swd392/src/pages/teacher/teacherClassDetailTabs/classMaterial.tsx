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
import { type Topic, type ClassMaterialType } from "../../../types/teacherType";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setModalClassMaterialCreation(true)}>
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
              autoCorrect="true"
            >
              <Box className="modal">
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Tạo tài liệu cho chủ đề {topic.title}
                </Typography>
                <div className="text-input-container">
                  <TextField id="standard-basic" label="Tên tài liệu" variant="standard" required />
                  <TextField id="standard-basic" label="Tên lớp học" variant="standard" required />
                  <FormControl style={{ flex: "0 0 50%" }}>
                    <InputLabel id="demo-simple-select-label">Loại tài liệu</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selectedMaterialType}
                      onChange={(e) => setSelectedMaterialType(e.target.value as ClassMaterialType)}
                      label="Loại tài liệu"
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
                    <Box sx={{ mt: 2, p: 2, border: "1px dashed grey", borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Tính năng 2D Render sắp ra mắt...
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                        { }
                      </Typography>
                    </Box>
                  )}

                  {selectedMaterialType === "quiz" && (
                    <Box sx={{ mt: 2 }}>
                      <FormControl component="fieldset">
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
                    </Box>
                  )}

                  {/* <Typography variant="body2" color="text.primary" mt={1}>
                    Mô tả môn học :{selectedCourse ? selectedCourse.desc : "Chọn khóa học để xem mô tả"}
                  </Typography> */}

                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleModalClose}>
                    Tạo tài liệu
                  </Button>
                </div>

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
