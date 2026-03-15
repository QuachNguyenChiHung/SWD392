import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh, Visibility } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import type { AdminClassMaterial, AdminClassMaterialDetailResponse, AdminQuestion } from '../../types/adminType';
import { adminMaterialsApi } from '../../services/adminApi';

const AdminMaterials = () => {
  const [tabValue, setTabValue] = useState(0);
  const [materials, setMaterials] = useState<AdminClassMaterial[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<AdminClassMaterialDetailResponse | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [materialsData, questionsData] = await Promise.all([
        adminMaterialsApi.getAllClassMaterials(1),
        adminMaterialsApi.getAllQuestions(1),
      ]);
      setMaterials(materialsData);
      setQuestions(questionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewMaterial = async (materialId: string) => {
    try {
      const detail = await adminMaterialsApi.getMaterialById(materialId);
      setSelectedDetail(detail);
      setDetailOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load material detail');
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    const title = (material.title || '').toLowerCase();
    const type = (material.type || '').toLowerCase();
    const classId = (material.class_assign_id || '').toLowerCase();
    const topicId = (material.topic_id || '').toLowerCase();
    return (
      title.includes(keyword) ||
      type.includes(keyword) ||
      classId.includes(keyword) ||
      topicId.includes(keyword)
    );
  });

  const filteredQuestions = questions.filter((question) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    const title = (question.title || '').toLowerCase();
    const type = (question.type || '').toLowerCase();
    const quizId = (question.quiz_id || '').toLowerCase();
    return (
      title.includes(keyword) ||
      type.includes(keyword) ||
      quizId.includes(keyword)
    );
  });

  const detailData = selectedDetail?.data;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Quản lý tài liệu và câu hỏi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi toàn bộ class materials và question dành cho admin
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
          Tải lại
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm theo tiêu đề, loại, class ID, topic ID hoặc quiz ID..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label={`Materials (${filteredMaterials.length})`} />
          <Tab label={`Questions (${filteredQuestions.length})`} />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Class ID</TableCell>
                  <TableCell>Topic ID</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
                    <TableRow key={material._id} hover>
                      <TableCell>{material.title}</TableCell>
                      <TableCell>
                        <Chip label={material.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={material.status} size="small" color={material.status === 'reviewed' ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>{material.class_assign_id}</TableCell>
                      <TableCell>{material.topic_id}</TableCell>
                      <TableCell>{new Date(material.dateCreate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<Visibility />} onClick={() => handleViewMaterial(material._id)}>
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Không có material phù hợp
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Quiz ID</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Số lựa chọn</TableCell>
                  <TableCell>Đáp án đúng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <TableRow key={question._id} hover>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>{question.quiz_id}</TableCell>
                      <TableCell>{question.type}</TableCell>
                      <TableCell>{question.options.length}</TableCell>
                      <TableCell>{question.correct_index + 1}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Không có question phù hợp
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết material</DialogTitle>
        <DialogContent>
          {detailData ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography><strong>Tiêu đề:</strong> {detailData.title || '-'}</Typography>
              <Typography><strong>Loại:</strong> {detailData.type || '-'}</Typography>
              <Typography><strong>Trạng thái:</strong> {detailData.status || '-'}</Typography>
              <Typography><strong>Class ID:</strong> {detailData.class_assign_id || '-'}</Typography>
              <Typography><strong>Topic ID:</strong> {detailData.topic_id || '-'}</Typography>
              <Typography><strong>Content ID:</strong> {detailData.content_id || '-'}</Typography>
              <Typography><strong>AI material:</strong> {detailData.is_ai_material ? 'Có' : 'Không'}</Typography>
              <TextField
                label="Content JSON"
                value={JSON.stringify(detailData.content ?? {}, null, 2)}
                multiline
                minRows={8}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Không có dữ liệu chi tiết để hiển thị.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMaterials;