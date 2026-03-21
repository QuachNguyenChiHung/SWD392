import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Snackbar,
  Alert,
  Breadcrumbs,
  Avatar,
  Tooltip,
  IconButton,
  Container,
} from "@mui/material";
import {
  NavigateNext,
  Description,
  Slideshow,
  Quiz,
  ViewInAr,
  Visibility,
  CheckCircle,
  Block,
  Search,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  getPendingMaterials,
  changeMaterialStatus,
} from "../../services/moderatorService.ts";
import MaterialViewDialog from "../../components/MaterialViewDialog.tsx";

const ModeratorFlaggedMaterialPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", keyword: "" });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info" as "info" | "success" | "error",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPendingMaterials({ status: "flagged" });
      let list = Array.isArray(data) ? data : data?.materials || [];

      if (filter.type) {
        list = list.filter((m: any) => m.type === filter.type);
      }
      if (filter.keyword) {
        list = list.filter((m: any) =>
          m.title.toLowerCase().includes(filter.keyword.toLowerCase()),
        );
      }

      setMaterials(list);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu bị flag:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Duyệt tài liệu này? Trạng thái sẽ trở về 'reviewed'."))
      return;
    try {
      await changeMaterialStatus(id, "reviewed");
      setSnack({
        open: true,
        message: "Đã duyệt tài liệu thành công!",
        severity: "success",
      });
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch {
      setSnack({
        open: true,
        message: "Lỗi khi duyệt tài liệu!",
        severity: "error",
      });
    }
  };

  const handleSuspend = async (id: string) => {
    if (
      !window.confirm(
        "Đình chỉ tài liệu này? Trạng thái sẽ chuyển thành 'rejected'.",
      )
    )
      return;
    try {
      await changeMaterialStatus(id, "rejected");
      setSnack({
        open: true,
        message: "Đã đình chỉ tài liệu thành công!",
        severity: "success",
      });
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch {
      setSnack({
        open: true,
        message: "Lỗi khi đình chỉ tài liệu!",
        severity: "error",
      });
    }
  };

  const handleView = (material: any) => {
    setSelectedMaterial(material);
    setViewDialogOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "slide":
        return <Slideshow />;
      case "file":
        return <Description />;
      case "quiz":
        return <Quiz />;
      case "2d_render":
        return <ViewInAr />;
      default:
        return <Description />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "slide":
        return { bg: "#e3f2fd", color: "#1976d2" };
      case "file":
        return { bg: "#f3e5f5", color: "#7b1fa2" };
      case "quiz":
        return { bg: "#fff3e0", color: "#e65100" };
      case "2d_render":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      default:
        return { bg: "#f5f5f5", color: "#616161" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "slide":
        return "Slide";
      case "file":
        return "File PDF/Word";
      case "quiz":
        return "Bài kiểm tra";
      case "2d_render":
        return "Mô hình 2D";
      default:
        return "Tài liệu";
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        py: 4,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={
            <NavigateNext fontSize="small" sx={{ color: "text.disabled" }} />
          }
          sx={{
            mb: 1,
            "& .MuiTypography-root": { fontFamily: "'Nunito', sans-serif" },
          }}
        >
          <Link to="/moderator/dashboard" style={{ textDecoration: "none" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              Kiểm duyệt
            </Typography>
          </Link>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            Hàng chờ kiểm duyệt
          </Typography>
        </Breadcrumbs>

        {/* Title Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: "#2d3436", mb: 0.5 }}
            >
              Hàng chờ kiểm duyệt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý và xử lý các tài liệu đang chờ xem xét hoặc bị báo cáo
            </Typography>
          </Box>
        </Stack>

        {/* Filter Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            alignItems: "flex-start",
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label="Tìm kiếm tài liệu..."
            size="small"
            value={filter.keyword}
            onChange={(e) =>
              setFilter((f) => ({ ...f, keyword: e.target.value }))
            }
            InputProps={{
              startAdornment: (
                <Search
                  sx={{ color: "text.disabled", mr: 1 }}
                  fontSize="small"
                />
              ),
              sx: {
                borderRadius: "4px",
                fontFamily: "'Nunito', sans-serif",
                height: "40px",
                bgcolor: "#fff",
              },
            }}
            InputLabelProps={{ sx: { fontFamily: "'Nunito', sans-serif" } }}
            sx={{ flex: 2 }}
          />
          <FormControl
            variant="outlined"
            size="small"
            sx={{ flex: 1, minWidth: { md: 220 } }}
          >
            <InputLabel sx={{ fontFamily: "'Nunito', sans-serif" }}>
              Loại tài liệu
            </InputLabel>
            <Select
              value={filter.type}
              label="Loại tài liệu"
              onChange={(e) =>
                setFilter((f) => ({ ...f, type: e.target.value }))
              }
              sx={{
                borderRadius: "4px",
                height: "40px",
                bgcolor: "#fff",
                "& .MuiSelect-select": { fontFamily: "'Nunito', sans-serif" },
              }}
            >
              <MenuItem value="">Tất cả loại</MenuItem>
              <MenuItem value="slide">Slide</MenuItem>
              <MenuItem value="file">File PDF/Word</MenuItem>
              <MenuItem value="quiz">Bài kiểm tra (Quiz)</MenuItem>
              <MenuItem value="2d_render">Mô hình 2D</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={fetchData}
            sx={{
              px: 4,
              height: "40px",
              borderRadius: "4px",
              textTransform: "uppercase",
              fontWeight: 700,
              boxShadow: "none",
              bgcolor: "#667eea",
              "&:hover": { bgcolor: "#5a6fd6", boxShadow: "none" },
              fontFamily: "'Nunito', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            LỌC
          </Button>
        </Box>

        {/* Table Section */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress
              thickness={5}
              size={50}
              sx={{ color: "primary.main" }}
            />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #edf2f7",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell sx={headerStyle}>TÀI LIỆU</TableCell>
                  <TableCell sx={headerStyle}>PHÂN LOẠI</TableCell>
                  <TableCell sx={headerStyle}>NGÀY BÁO CÁO</TableCell>
                  <TableCell sx={headerStyle}>TRẠNG THÁI</TableCell>
                  <TableCell align="right" sx={headerStyle}>
                    HÀNH ĐỘNG
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <Description sx={{ fontSize: 60, mb: 1 }} />
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                          Không có tài liệu nào
                        </Typography>
                        <Typography variant="body2">
                          Tất cả tài liệu đã được xử lý xong!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((m) => {
                    const colors = getTypeColor(m.type);
                    return (
                      <TableRow
                        key={m._id}
                        hover
                        sx={{ "&:hover": { bgcolor: "#fdfdff" } }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                bgcolor: colors.bg,
                                color: colors.color,
                                borderRadius: "12px",
                                width: 44,
                                height: 44,
                              }}
                            >
                              {getTypeIcon(m.type)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={800}
                                sx={{
                                  color: "#2d3436",
                                  lineHeight: 1.2,
                                  mb: 0.5,
                                  fontFamily: "'Nunito', sans-serif",
                                }}
                              >
                                {m.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "text.disabled", fontWeight: 600 }}
                              >
                                ID:{" "}
                                {m._id
                                  ?.substring(m._id.length - 8)
                                  .toUpperCase()}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTypeLabel(m.type)}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.color,
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              fontFamily: "'Nunito', sans-serif",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#636e72",
                              fontWeight: 500,
                              fontFamily: "'Nunito', sans-serif",
                            }}
                          >
                            {m.dateCreate
                              ? new Date(m.dateCreate).toLocaleDateString()
                              : "-"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.disabled", display: "block" }}
                          >
                            {m.dateCreate
                              ? new Date(m.dateCreate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={m.isFlagged ? "Bị báo cáo" : "Đang chờ"}
                            size="small"
                            variant="outlined"
                            color={m.isFlagged ? "error" : "warning"}
                            sx={{
                              fontWeight: 800,
                              px: 1,
                              borderRadius: "8px",
                              fontFamily: "'Nunito', sans-serif",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleView(m)}
                                sx={actionIconStyle}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Duyệt tài liệu">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(m._id)}
                                sx={actionIconStyle}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Đình chỉ">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleSuspend(m._id)}
                                sx={actionIconStyle}
                              >
                                <Block fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialogs */}
        {selectedMaterial && (
          <MaterialViewDialog
            open={viewDialogOpen}
            onClose={() => setViewDialogOpen(false)}
            material={selectedMaterial}
          />
        )}

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            variant="filled"
            sx={{
              borderRadius: "12px",
              fontWeight: 600,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

const headerStyle = {
  fontWeight: 800,
  fontSize: "0.75rem",
  color: "#b2bec3",
  letterSpacing: "1px",
  py: 2,
  fontFamily: "'Nunito', sans-serif",
};

const actionIconStyle = {
  bgcolor: "#fff",
  border: "1px solid #edf2f7",
  borderRadius: "10px",
  "&:hover": {
    bgcolor: "#f8f9fa",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  },
  transition: "all 0.2s",
};

export default ModeratorFlaggedMaterialPage;
