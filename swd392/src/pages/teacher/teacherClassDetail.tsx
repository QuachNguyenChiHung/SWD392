import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import {
  Add,
  Description,
  Slideshow,
  SportsEsports,
  Quiz,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

type Topic = {
  title: string;
  description: string;
  status: "Draft" | "Published" | "Scheduled";
  lastUpdated: string;
  materialCount: number;
  materials: string[];
};

const mockTopics: Topic[] = [
  {
    title: "Chapter 1: Chemical reactions",
    description: "Balancing equations, reaction rates, lab safety recap.",
    status: "Published",
    lastUpdated: "10 Feb 2026",
    materialCount: 6,
    materials: [
      "Safety lab guide (PDF)",
      "Reaction rates slide deck",
      "Balancing equations worksheet",
      "Lab demo video",
      "Practice quiz",
      "Homework set 1",
    ],
  },
  {
    title: "Chapter 2: Stoichiometry",
    description: "Mole concept review and practice worksheets.",
    status: "Scheduled",
    lastUpdated: "08 Feb 2026",
    materialCount: 4,
    materials: [
      "Mole concept notes",
      "Stoichiometry exercises",
      "Guided practice sheet",
      "Answer key",
    ],
  },
  {
    title: "Experiment lab prep",
    description: "Safety checklist and lab procedure videos.",
    status: "Draft",
    lastUpdated: "05 Feb 2026",
    materialCount: 3,
    materials: [
      "Lab safety checklist",
      "Equipment setup video",
      "Experiment rubric",
    ],
  },
];

const statusColor: Record<Topic["status"], "default" | "success" | "warning"> =
  {
    Draft: "default",
    Published: "success",
    Scheduled: "warning",
  };

const getMaterialIcon = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("slide") || normalized.includes("deck")) {
    return <Slideshow fontSize="small" />;
  }

  if (normalized.includes("quiz")) {
    return <Quiz fontSize="small" />;
  }

  if (
    normalized.includes("game") ||
    normalized.includes("interactive") ||
    normalized.includes("simulation")
  ) {
    return <SportsEsports fontSize="small" />;
  }

  return <Description fontSize="small" />;
};

const classKey = "CH9A-2025-KEY";
const maskKey = (key: string) => "•".repeat(Math.max(4, key.length));

const TeacherClassDetail = () => {
  const [showKey, setShowKey] = useState(false);

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
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {mockTopics.map((topic) => (
              <Paper key={topic.title} sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  gap={2}
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6">{topic.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {topic.description}
                    </Typography>
                  </Box>
                  <Button variant="contained" startIcon={<Add />}>
                    Add class material
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  mb={2}
                >
                  <Chip
                    label={topic.status}
                    color={statusColor[topic.status]}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {topic.materialCount} materials · Updated {topic.lastUpdated}
                  </Typography>
                </Stack>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Class material</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topic.materials.map((material) => (
                      <TableRow key={material} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getMaterialIcon(material)}
                            <Typography variant="body2">{material}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button size="small">Edit</Button>
                            <Button size="small">Preview</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
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
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">
                    <strong>Class key:</strong> {showKey ? classKey : maskKey(classKey)}
                  </Typography>
                  <Tooltip title={showKey ? "Hide class key" : "Show class key"}>
                    <IconButton
                      size="small"
                      onClick={() => setShowKey((prev) => !prev)}
                    >
                      {showKey ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
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
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherClassDetail;
