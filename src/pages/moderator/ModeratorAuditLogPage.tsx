import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { getAuditLogs } from "../../services/moderatorFilterApi";

const columns = [
  { id: "action", label: "Hành động" },
  { id: "user", label: "Người thực hiện" },
  { id: "target", label: "Đối tượng" },
  { id: "time", label: "Thời gian" },
  { id: "detail", label: "Chi tiết" },
];

const ModeratorAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [total, setTotal] = useState(0);

  const fetchLogs = async (params: any = {}) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        keyword,
        ...params,
      });
      setLogs(res.data || res || []);
      setTotal(res.total || (res.data ? res.data.length : 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleSearch = () => {
    setPage(0);
    fetchLogs({ keyword });
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100vw",
        px: { xs: 1, sm: 2, md: 3 },
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Nhật ký/Audit Log
      </Typography>
      <Paper sx={{ p: 2, mb: 2, width: "100%" }} elevation={1}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Tìm kiếm hành động, user, đối tượng..."
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </Stack>
      </Paper>
      <Paper sx={{ width: "100%" }} elevation={1}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ width: "100%" }}>
            <Table sx={{ width: "100%", tableLayout: "auto" }}>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.id} sx={{ whiteSpace: "nowrap" }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.action}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.user || row.moderator || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.target || row.targetId || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.time ? new Date(row.time).toLocaleString() : ""}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.detail || row.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ModeratorAuditLogPage;
