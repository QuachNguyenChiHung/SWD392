import { Box, Typography, Stack, Paper, Grid, Tabs, Tab } from "@mui/material";
import { type Topic } from "../../types/teacherType";
import ClassMaterial from "./teacherClassDetailTabs/classMaterial";

const mockTopics: Topic[] = [
  {
    title: "Chemical reactions",
    class: "Class 9A",
    description: "Balancing equations, reaction rates, lab safety recap.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 1,
        type: "file",
        order_num: 1,
        class_assign_id: 9,
        title: "Safety lab guide",
        dateUpdate: null,
        dateCreate: new Date("2026-02-10"),
        content: {
          file_id: 1,
          file_name: "Safety lab guide.pdf",
          file_path: "/materials/chem9a/safety.pdf",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 2,
        type: "slide",
        order_num: 2,
        class_assign_id: 9,
        title: "Reaction rates slides",
        dateUpdate: null,
        dateCreate: new Date("2026-02-10"),
        content: {
          slide_id: 2,
          slide_name: "Reaction rates",
          file_path: "/materials/chem9a/reaction-rates.pptx",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
    ],
  },
  {
    title: "Stoichiometry",
    class: "Class 9A",
    description: "Mole concept review and practice worksheets.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 3,
        type: "2d_render",
        order_num: 1,
        class_assign_id: 9,
        title: "Mole ratio visual",
        dateUpdate: null,
        dateCreate: new Date("2026-02-08"),
        content: {
          render_id: 3,
          render_data: '{"nodes":[],"edges":[]}',
        },
        is_ai_material: true,
        ai_content_id: 12,
      },
    ],
  },
  {
    title: "Experiment lab prep",
    class: "Class 9A",
    description: "Safety checklist and lab procedure videos.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 4,
        type: "quiz",
        order_num: 1,
        class_assign_id: 9,
        title: "Lab safety quiz",
        dateUpdate: null,
        dateCreate: new Date("2026-02-05"),
        content: {
          id: "quiz-chem9a-1",
          classId: "chem9a",
          title: "Lab safety quiz",
          maxAttempts: 3,
          availableFrom: new Date("2026-02-06"),
          availableUntil: new Date("2026-02-20"),
          createdAt: new Date("2026-02-05"),
          updatedAt: new Date("2026-02-05"),
        },
        is_ai_material: false,
        ai_content_id: null,
      },
    ],
  },
];

const TeacherClassDetail = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Chemistry 9A · Class detail
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage per-topic learning materials, release schedules, and supporting
        resources.
      </Typography>

      <Grid container spacing={3}>
        <Tabs>
          <Tab label="Topics & Materials" />
          <Tab label="Students" />
          <Tab label="Analytics" />
        </Tabs>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <ClassMaterial topics={mockTopics} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Class overview
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Course code:</strong> Chemistry 9 - 2022
              </Typography>
              <Typography variant="body2">
                <strong>Students enrolled:</strong> 32
              </Typography>
              <Typography variant="body2">
                <strong>Created on:</strong> 12 Sep 2025
              </Typography>
            </Stack>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming reminders
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Quiz feedback due Friday.
              </Typography>
              <Typography variant="body2">
                • Lab equipment checklist needs confirmation.
              </Typography>
              <Typography variant="body2">
                • Parent newsletter draft pending.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherClassDetail;
