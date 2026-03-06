import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Stack, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import { CheckCircle, Cancel, Visibility, Info } from '@mui/icons-material';
import type { TeacherRequest } from '../../types';

const AdminTeacherRequests = () => {
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TeacherRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    // TODO: Fetch teacher requests from API
    const mockRequests: TeacherRequest[] = [
      {
        id: '1',
        userId: 'u1',
        userName: 'Nguyễn Văn A',
        userEmail: 'nguyenvana@example.com',
        requestDate: new Date('2025-02-20'),
        status: 'pending',
        reason: 'Tôi có 5 năm kinh nghiệm giảng dạy lập trình web và muốn chia sẻ kiến thức với học sinh.',
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Trần Thị B',
        userEmail: 'tranthib@example.com',
        requestDate: new Date('2025-02-22'),
        status: 'pending',
        reason: 'Đã có bằng thạc sĩ trong lĩnh vực công nghệ thông tin và muốn đóng góp vào cộng đồng giáo dục.',
      },
      {
        id: '3',
        userId: 'u3',
        userName: 'Lê Văn C',
        userEmail: 'levanc@example.com',
        requestDate: new Date('2025-02-15'),
        status: 'approved',
        reviewedBy: 'Admin',
        reviewedAt: new Date('2025-02-16'),
      },
      {
        id: '4',
        userId: 'u4',
        userName: 'Phạm Thị D',
        userEmail: 'phamthid@example.com',
        requestDate: new Date('2025-02-18'),
        status: 'rejected',
        reviewedBy: 'Admin',
        reviewedAt: new Date('2025-02-19'),
        reason: 'Không đủ trình độ chuyên môn.',
      },
    ];
    setRequests(mockRequests);
    setFilteredRequests(mockRequests.filter(r => r.status === 'pending'));
  }, []);

  useEffect(() => {
    let filtered = requests;
    
    switch (tabValue) {
      case 0: // Pending
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 1: // Approved
        filtered = filtered.filter(r => r.status === 'approved');
        break;
      case 2: // Rejected
        filtered = filtered.filter(r => r.status === 'rejected');
        break;
      case 3: // All
        break;
    }
    
    setFilteredRequests(filtered);
  }, [tabValue, requests]);

  const handleApproveRequest = () => {
    if (!selectedRequest) return;

    // TODO: API call to approve request and update user role
    console.log('Approving request:', selectedRequest.id);
    const updatedRequest = {
      ...selectedRequest,
      status: 'approved' as const,
      reviewedBy: 'Admin',
      reviewedAt: new Date(),
    };
    
    setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
    setOpenApproveDialog(false);
    setSelectedRequest(null);
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;

    // TODO: API call to reject request
    console.log('Rejecting request:', selectedRequest.id, rejectReason);
    const updatedRequest = {
      ...selectedRequest,
      status: 'rejected' as const,
      reviewedBy: 'Admin',
      reviewedAt: new Date(),
      reason: rejectReason,
    };
    
    setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
    setOpenRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Duyệt yêu cầu trở thành Giáo viên
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Xem xét và phê duyệt các yêu cầu nâng cấp tài khoản lên vai trò Giáo viên
        </Typography>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`Chờ duyệt (${requests.filter(r => r.status === 'pending').length})`} />
          <Tab label={`Đã duyệt (${requests.filter(r => r.status === 'approved').length})`} />
          <Tab label={`Từ chối (${requests.filter(r => r.status === 'rejected').length})`} />
          <Tab label={`Tất cả (${requests.length})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Người yêu cầu</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ngày yêu cầu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người duyệt</TableCell>
                <TableCell>Ngày duyệt</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.userName}</TableCell>
                    <TableCell>{request.userEmail}</TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(request.status)} 
                        size="small" 
                        color={getStatusColor(request.status) as any}
                      />
                    </TableCell>
                    <TableCell>{request.reviewedBy || '-'}</TableCell>
                    <TableCell>
                      {request.reviewedAt 
                        ? new Date(request.reviewedAt).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setOpenViewDialog(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      {request.status === 'pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => {
                              setSelectedRequest(request);
                              setOpenApproveDialog(true);
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              setSelectedRequest(request);
                              setOpenRejectDialog(true);
                            }}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Không có yêu cầu nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Request Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Info />
            <Typography variant="h6">Chi tiết yêu cầu</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Người yêu cầu
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedRequest.userName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.userEmail}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ngày yêu cầu
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedRequest.requestDate).toLocaleString('vi-VN')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Lý do
                </Typography>
                <Typography variant="body1">
                  {selectedRequest.reason || 'Không có lý do'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Trạng thái
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={getStatusLabel(selectedRequest.status)} 
                    color={getStatusColor(selectedRequest.status) as any}
                  />
                </Box>
              </Box>
              {selectedRequest.reviewedBy && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Người duyệt
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.reviewedBy}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ngày duyệt
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.reviewedAt 
                        ? new Date(selectedRequest.reviewedAt).toLocaleString('vi-VN')
                        : '-'
                      }
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  setOpenViewDialog(false);
                  setOpenRejectDialog(true);
                }}
              >
                Từ chối
              </Button>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  setOpenViewDialog(false);
                  setOpenApproveDialog(true);
                }}
              >
                Phê duyệt
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>Phê duyệt yêu cầu</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Người dùng sẽ được nâng cấp lên vai trò Giáo viên
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn phê duyệt yêu cầu của <strong>{selectedRequest?.userName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sau khi phê duyệt, người dùng sẽ có quyền tạo và quản lý lớp học.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Hủy</Button>
          <Button variant="contained" color="success" onClick={handleApproveRequest}>
            Phê duyệt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối yêu cầu</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Yêu cầu sẽ bị từ chối
          </Alert>
          <Typography sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn từ chối yêu cầu của <strong>{selectedRequest?.userName}</strong>?
          </Typography>
          <TextField
            label="Lý do từ chối (tùy chọn)"
            multiline
            rows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối để người dùng biết..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleRejectRequest}>
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTeacherRequests;
