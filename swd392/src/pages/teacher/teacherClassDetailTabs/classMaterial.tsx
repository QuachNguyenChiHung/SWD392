import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import {
  Add,
  Description,
  Slideshow,
  ViewInAr,
  Quiz,
  AutoAwesome,
} from "@mui/icons-material";
import { type Topic, type ClassMaterialType, type ClassMaterial, type CreateClassMaterialDTO } from "../../../types/teacherType";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateClassMaterialModal from "../../../components/CreateClassMaterialModal";
import classMaterialApi from "../../../services/teacherApi/classMaterialApi";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [materialsByTopic, setMaterialsByTopic] = useState<Record<string, ClassMaterial[]>>({});

  // Fetch materials for all topics
  useEffect(() => {
    const fetchMaterials = async () => {
      const materialMap: Record<string, ClassMaterial[]> = {};

      for (const topic of topics) {
        const topicId = topic._id || topic.topic_id;
        try {
          const materials = await classMaterialApi.getMaterialByTopicAndClass(topicId, classId);
          materialMap[topicId] = materials;
        } catch (error) {
          console.error(`Error fetching materials for topic ${topicId}:`, error);
          materialMap[topicId] = [];
        }
      }

      setMaterialsByTopic(materialMap);
    };

    if (topics.length > 0) {
      fetchMaterials();
    }
  }, [topics, classId]);

  const getTopicId = (topic: Topic) => topic._id || topic.topic_id;

  const handleOpenModal = (topicId: string) => {
    const topic = topics.find(t => getTopicId(t) === topicId);
    setCurrentTopicId(topicId);
    setCurrentTopic(topic || null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCurrentTopicId("");
    setCurrentTopic(null);
  };

  const handleMaterialCreated = async (topicId: string, newMaterial: CreateClassMaterialDTO) => {
    // Refresh materials for the topic
    try {
      const updatedMaterials = await classMaterialApi.getMaterialByTopicAndClass(topicId, classId);
      setMaterialsByTopic(prev => ({
        ...prev,
        [topicId]: updatedMaterials
      }));
    } catch (error) {
      console.error(`Error refreshing materials for topic ${topicId}:`, error);
    }
  };

  const handleMaterialClick = (material: any) => {
    const id = material._id || material.material_id;
    console.log('Material clicked:', material, 'Resolved ID:', id);
    navigate(`/teacher/class/${classId}/materials/${id}`, { state: { material } });
  };

  return (
    <>
      <CreateClassMaterialModal
        open={modalOpen}
        onClose={handleModalClose}
        onMaterialCreated={handleMaterialCreated}
        topicId={currentTopicId}
        classId={classId}
        currentMaterialCount={materialsByTopic[currentTopicId]?.length || 0}
        topicTitle={currentTopic?.title}
      />

      {topics.map((topic) => (
        <Paper key={getTopicId(topic)} sx={{ p: 3 }}>
          <Stack spacing={2} mb={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">{topic.title}</Typography>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="contained" size="small" startIcon={<Add />} onClick={() => handleOpenModal(getTopicId(topic))}>
                  Thêm tài liệu
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesome />}
                  onClick={() => navigate(`/teacher/class/${classId}/ai-generator`, {
                    state: { topic: topic, classId: classId }
                  })}
                >
                  Tạo với AI
                </Button>
              </div>

            </Stack>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {topic.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Chủ đề {topic.order_num} · {materialsByTopic[getTopicId(topic)]?.length || 0} tài liệu
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1}>
            {materialsByTopic[getTopicId(topic)]?.map((material, materialIndex) => (
              <Box
                key={material._id ?? materialIndex}
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
            )) || (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Chưa có tài liệu nào cho chủ đề này
                </Typography>
              )}
          </Stack>
        </Paper>
      ))}
    </>
  );
}
