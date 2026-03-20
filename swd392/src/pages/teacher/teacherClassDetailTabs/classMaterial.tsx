import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import {
  Add,
  Description,
  Slideshow,
  ViewInAr,
  Quiz,
  AutoAwesome,
} from "@mui/icons-material";
import { type Topic, type ClassMaterialType, type ClassMaterial, } from "../../../types/teacherType";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateClassMaterialModal from "../../../components/CreateClassMaterialModal";
import classMaterialApi from "../../../services/teacherApi/classMaterialApi";
import {
  sectionTitle,
  flatCard,
  flatButtonContained,
  flatButtonOutlined,
  COLORS,
  RADIUS,
} from "../teacherStyles";

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

export default function ClassMaterialTab({ topics, classId }: ClassMaterialProps) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<string>("");
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [materialsByTopic, setMaterialsByTopic] = useState<Record<string, ClassMaterial[]>>({});

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

  const handleMaterialCreated = async (topicId: string) => {
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
    navigate(`/teacher/class/${classId}/materials/${id}`);
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
        <Paper
          key={getTopicId(topic)}
          elevation={0}
          sx={{
            ...flatCard,
            borderLeft: `3px solid ${COLORS.accent}`,
          }}
        >
          <Stack spacing={2} mb={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box sx={{ flex: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: COLORS.textDark }}>
                  {topic.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: COLORS.textSecondary,
                    mt: 0.5,
                  }}
                >
                  Chủ đề {topic.order_num} · {materialsByTopic[getTopicId(topic)]?.length || 0} tài liệu
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpenModal(getTopicId(topic))}
                  sx={flatButtonContained}
                >
                  Thêm tài liệu
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={() => {
                    const topicId = getTopicId(topic);
                    const topicMaterials = materialsByTopic[topicId] || [];
                    navigate(`/teacher/class/${classId}/ai-generator`, {
                      state: {
                        topic: {
                          ...topic,
                          classMaterials: topicMaterials,
                        },
                        classId,
                      }
                    });
                  }}
                  sx={{
                    ...flatButtonOutlined,
                    borderColor: COLORS.accent,
                    color: COLORS.accent,
                    "&:hover": {
                      bgcolor: COLORS.accentLight,
                      borderColor: COLORS.accent,
                      boxShadow: "none",
                    },
                  }}
                >
                  Tạo với AI
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Stack spacing={0}>
            {materialsByTopic[getTopicId(topic)]?.map((material) => (
              <Box
                key={material._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  py: 1.25,
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  "&:last-child": { borderBottom: "none" },
                  "&:hover": { bgcolor: COLORS.accentLight },
                  transition: "background-color 0.1s ease",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleMaterialClick(material)}
                >
                  <Box sx={{ color: COLORS.accent }}>
                    {getMaterialIcon(material.type)}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: COLORS.textDark }}>
                      {material.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: COLORS.textSecondary,
                      }}
                    >
                      {{
                        file: "Tệp",
                        slide: "Slide",
                        "2d_render": "2D Render",
                        quiz: "Bài kiểm tra",
                      }[material.type]}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  onClick={() => handleMaterialClick(material)}
                  sx={{
                    ...flatButtonOutlined,
                    fontSize: "0.75rem",
                    px: 2,
                    minWidth: "auto",
                  }}
                >
                  Xem
                </Button>
              </Box>
            )) || (
              <Typography
                sx={{
                  py: 2,
                  textAlign: 'center',
                  color: COLORS.textSecondary,
                  fontSize: "0.85rem",
                }}
              >
                Chưa có tài liệu nào cho chủ đề này
              </Typography>
            )}
          </Stack>
        </Paper>
      ))}
    </>
  );
}
