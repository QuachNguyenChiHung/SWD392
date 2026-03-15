import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Stack, Paper, Alert, Skeleton, Chip
} from '@mui/material';
import { Brush } from '@mui/icons-material';
import { apiService } from '../../services/api';

interface RenderObject {
  type: 'circle' | 'rect' | 'text';
  x: number;
  y: number;
  // circle
  radius?: number;
  color?: string;
  // rect
  width?: number;
  height?: number;
  // text
  value?: string;
  fontSize?: number;
}

interface RenderData {
  canvas_width: number;
  canvas_height: number;
  objects: RenderObject[];
}

interface Render2DMaterial {
  _id: string;
  title: string;
  render_data: RenderData;
}

interface ClassRender2DProps {
  materialIds: string[]; // list of class material _id with type 2d_render
}

function RenderCanvas({ renderData }: { renderData: RenderData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, renderData.canvas_width, renderData.canvas_height);

    for (const obj of renderData.objects) {
      if (obj.type === 'circle') {
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius || 20, 0, Math.PI * 2);
        ctx.fillStyle = obj.color || '#6366f1';
        ctx.fill();
      } else if (obj.type === 'rect') {
        ctx.fillStyle = obj.color || '#10b981';
        ctx.fillRect(obj.x, obj.y, obj.width || 60, obj.height || 40);
      } else if (obj.type === 'text') {
        ctx.fillStyle = '#1e293b';
        ctx.font = `${obj.fontSize || 16}px sans-serif`;
        ctx.fillText(obj.value || '', obj.x, obj.y);
      }
    }
  }, [renderData]);

  return (
    <Box sx={{
      border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden',
      display: 'inline-block', maxWidth: '100%'
    }}>
      <canvas
        ref={canvasRef}
        width={renderData.canvas_width}
        height={renderData.canvas_height}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
    </Box>
  );
}

export default function ClassRender2D({ materialIds }: ClassRender2DProps) {
  const [renders, setRenders] = useState<Render2DMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (materialIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRenders = async () => {
      setLoading(true);
      const results: Render2DMaterial[] = [];
      await Promise.all(materialIds.map(async (matId) => {
        try {
          const res: any = await apiService.get(`/class-materials/${matId}`);
          const data = res?.data || res;
          console.log('render2d data:', JSON.stringify(data));
          const renderData = data?.content?.render_data || data?.content;
          if (renderData?.objects) {
            results.push({
              _id: matId,
              title: data.title || 'Render 2D',
              render_data: renderData
            });
          }
        } catch (err) {
          console.warn('Failed to fetch render2d:', matId, err);
        }
      }));
      setRenders(results);
      setLoading(false);
    };

    fetchRenders();
  }, [materialIds]);

  if (loading) {
    return (
      <Stack spacing={2}>
        {materialIds.map(id => <Skeleton key={id} variant="rounded" height={200} />)}
      </Stack>
    );
  }

  if (renders.length === 0) {
    return (
      <Alert severity="info">Chưa có nội dung 2D render</Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {renders.map((render) => (
        <Paper key={render._id} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Brush sx={{ color: '#6366f1', fontSize: 20 }} />
            <Typography fontWeight="bold">{render.title}</Typography>
            <Chip label="2D Render" size="small" sx={{ bgcolor: '#f0f7ff', color: '#6366f1' }} />
          </Stack>
          <RenderCanvas renderData={render.render_data} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {render.render_data.canvas_width} × {render.render_data.canvas_height}px •{' '}
            {render.render_data.objects.length} đối tượng
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}