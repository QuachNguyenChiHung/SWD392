import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import {
  Add,
  Description,
  Slideshow,
  ViewInAr,
  Quiz,
} from "@mui/icons-material";
import { type Topic, type ClassMaterialType } from "../../../types/teacherType";

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
}

export default function ClassMaterial({ topics }: ClassMaterialProps) {
  return (
    <>
      {topics.map((topic) => (
        <Paper key={topic.title} sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center", md: "start" }}
            gap={2}
            mb={2}
          >
            <Box>
              <Typography variant="h6">{topic.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {topic.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topic.class} · {topic.belongToCourse}
              </Typography>
            </Box>
            <Button variant="contained" size="small" startIcon={<Add />}>
              Add class material
            </Button>
          </Stack>

          <Stack spacing={1}>
            {topic.ClassMaterialType.map((material) => (
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
                <Stack direction="row" spacing={1} alignItems="center">
                  {getMaterialIcon(material.type)}
                  <Box>
                    <Typography variant="subtitle2">
                      {material.title}
                    </Typography>
                  </Box>
                </Stack>
                <Button size="small">View</Button>
              </Box>
            ))}
          </Stack>
        </Paper>
      ))}
    </>
  );
}
