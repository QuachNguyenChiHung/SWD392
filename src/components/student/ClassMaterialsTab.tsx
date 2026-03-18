import {
  Stack, Paper, Typography, Button, Alert
} from '@mui/material';
import { Info, FileDownload, Visibility as Eye } from '@mui/icons-material';

interface ClassMaterial {
  _id: string;
  title: string;
  type: string;
  file_url?: string;
  description?: string;
  order?: number;
}

interface ClassMaterialsTabProps {
  materials: ClassMaterial[];
  onPreviewMaterial: (material: ClassMaterial) => void;
}

const getMaterialIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return '📄';
    case 'video': return '🎥';
    case 'image': return '🖼️';
    case 'document': return '📝';
    case 'link': return '🔗';
    default: return '📎';
  }
};

export default function ClassMaterialsTab({ materials, onPreviewMaterial }: ClassMaterialsTabProps) {
  return (
    <Stack spacing={2}>
      {materials.length > 0 ? (
        materials.map((material) => (
          <Paper
            key={material._id}
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
                {getMaterialIcon(material.type)} {material.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {material.type}{material.description && ` • ${material.description}`}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onPreviewMaterial(material)}
                startIcon={<Eye />}
              >
                Xem
              </Button>
              {material.file_url && (
                <Button
                  size="small"
                  variant="outlined"
                  component="a"
                  href={material.file_url}
                  download
                  target="_blank"
                  startIcon={<FileDownload />}
                >
                  Tải
                </Button>
              )}
            </Stack>
          </Paper>
        ))
      ) : (
        <Alert severity="info">
          <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
          Chưa có tài liệu nào trong lớp này
        </Alert>
      )}
    </Stack>
  );
}