import { useState } from 'react';
import {
  Stack, Paper, Typography, Button, Alert, Tabs, Tab, Box, CircularProgress
} from '@mui/material';
import { Info, FileDownload, Visibility as Eye, CheckCircle } from '@mui/icons-material';

interface File {
  _id: string;
  file_name: string;
  file_path: string;
}

interface Slide {
  _id: string;
  slide_name: string;
  file_path: string;
}

// ✅ FIXED: Add completedMaterials to interface
interface ClassMaterialsTabProps {
  files: File[];
  slides: Slide[];
  onPreview: (item: File | Slide, type: 'file' | 'slide') => void;
  onMarkCompleted?: (item: File | Slide, type: 'file' | 'slide') => void;
  completedMaterials?: string[];  // ✅ ADD THIS
  isLoading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const getMaterialIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '🎯';
    case 'mp4':
    case 'avi':
    case 'mov': return '🎥';
    case 'jpg':
    case 'png':
    case 'gif': return '🖼️';
    default: return '📎';
  }
};

export default function ClassMaterialsTab({
  files,
  slides,
  onPreview,
  onMarkCompleted,
  completedMaterials = [],  // ✅ With default value
  isLoading = false
}: ClassMaterialsTabProps) {
  const [tabValue, setTabValue] = useState(0);
  const [completing, setCompleting] = useState<string | null>(null);

  const handleMarkComplete = async (item: File | Slide, type: 'file' | 'slide') => {
    setCompleting(item._id);
    try {
      await onMarkCompleted?.(item, type);
    } finally {
      setCompleting(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label={`📄 Tài liệu (${files.length})`} />
          <Tab label={`🎯 Slide (${slides.length})`} />
        </Tabs>
      </Box>

      {/* Files Tab */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={2}>
          {files.length > 0 ? (
            files.map((file) => (
              <Paper
                key={file._id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              >
                <Stack sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="600">
                    {getMaterialIcon(file.file_name)} {file.file_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tài liệu • {file.file_path?.split('/').pop()?.substring(0, 30) || 'File'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onPreview(file, 'file')}
                    startIcon={<Eye />}
                  >
                    Xem
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={
                      completing === file._id || 
                      completedMaterials.includes(file._id)
                    }
                    onClick={() => handleMarkComplete(file, 'file')}
                    startIcon={<CheckCircle />}
                    sx={{
                      color: completedMaterials.includes(file._id) ? '#10b981' : '#10b981',
                      borderColor: '#10b981',
                      bgcolor: completedMaterials.includes(file._id) ? '#f0fdf4' : 'transparent',
                      '&:hover': { bgcolor: '#f0fdf4' }
                    }}
                  >
                    {completing === file._id ? '⏳' : 
                     completedMaterials.includes(file._id) ? '✅' :
                     '✓'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={file.file_path}
                    download
                    target="_blank"
                    startIcon={<FileDownload />}
                  >
                    Tải
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Alert severity="info">
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Chưa có tài liệu nào
            </Alert>
          )}
        </Stack>
      </TabPanel>

      {/* Slides Tab */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={2}>
          {slides.length > 0 ? (
            slides.map((slide) => (
              <Paper
                key={slide._id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              >
                <Stack sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="600">
                    🎯 {slide.slide_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Slide • {slide.file_path?.split('/').pop()?.substring(0, 30) || 'Slide'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onPreview(slide, 'slide')}
                    startIcon={<Eye />}
                  >
                    Xem
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={
                      completing === slide._id || 
                      completedMaterials.includes(slide._id)
                    }
                    onClick={() => handleMarkComplete(slide, 'slide')}
                    startIcon={<CheckCircle />}
                    sx={{
                      color: completedMaterials.includes(slide._id) ? '#10b981' : '#10b981',
                      borderColor: '#10b981',
                      bgcolor: completedMaterials.includes(slide._id) ? '#f0fdf4' : 'transparent',
                      '&:hover': { bgcolor: '#f0fdf4' }
                    }}
                  >
                    {completing === slide._id ? '⏳' : 
                     completedMaterials.includes(slide._id) ? '✅' :
                     '✓'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={slide.file_path}
                    download
                    target="_blank"
                    startIcon={<FileDownload />}
                  >
                    Tải
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Alert severity="info">
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Chưa có slide nào
            </Alert>
          )}
        </Stack>
      </TabPanel>

      {/* Empty State */}
      {files.length === 0 && slides.length === 0 && (
        <Alert severity="info">
          <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
          Chưa có tài liệu hoặc slide nào trong lớp này
        </Alert>
      )}
    </Box>
  );
}