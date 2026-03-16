import {
  Typography,
  Stack,
  Paper,
  Button,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
  TextField,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { type Student, type Class } from "../../../types/teacherType";
import { useState, useEffect } from "react";
import { enrollStudentApi } from "../../../services/teacherApi/enrollStudentApi";
import StudentProgress from "./studentProgress";

interface StudentListProp {
  students: Student[];
  classData: Class;
}

export default function StudentList({ students, classData }: StudentListProp) {
  const [studentSearch, setStudentSearch] = useState<Student | null>(null);
  const [addStudentList, setAddStudentList] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enrollMap, setEnrollMap] = useState<Record<string, { enrollId: string; dateJoin: string; status?: string }>>({});
  const [enrollLoading, setEnrollLoading] = useState(true);
  // Pagination states
  const [page, setPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState<Student[]>([]);
  const [nextPageEmpty, setNextPageEmpty] = useState(false);
  const [nextPageData, setNextPageData] = useState<Student[]>([]);
  const [completeLoading, setCompleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setEnrollLoading(true);
      try {
        // Fetch paginated students for current page
        const enrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page);
        const studentsList = enrollments.map((enroll: any) => enroll.student_id && typeof enroll.student_id === 'object' ? enroll.student_id : enroll.student_id);
        setStudentsPage(studentsList);
        // Prefetch next page
        const nextEnrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page + 1);
        const nextStudentsList = nextEnrollments.map((enroll: any) => enroll.student_id && typeof enroll.student_id === 'object' ? enroll.student_id : enroll.student_id);
        setNextPageData(nextStudentsList);
        setNextPageEmpty(!nextStudentsList || nextStudentsList.length === 0);
        // Build enrollMap for current page
        const map: Record<string, { enrollId: string; dateJoin: string }> = {};
        for (const enroll of enrollments) {
          const studentId = enroll.student_id?._id || enroll.student_id;
          if (studentId) {
            map[studentId] = {
              enrollId: enroll._id,
              dateJoin: enroll.date_join,
              status: enroll.status || enroll.completion_status || undefined
            };
          }
        }
        setEnrollMap(map);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setEnrollLoading(false);
      }
    };
    fetchEnrollments();
  }, [classData._id, page]);

  const handleInviteStudents = async () => {
    if (addStudentList.length === 0) return;
    setInviteLoading(true);
    try {
      await Promise.all(
        addStudentList.map((studentId) =>
          enrollStudentApi.inviteStudent(classData._id, studentId)
        )
      );
      setAddStudentList([]);
    } catch (error) {
      console.error("Error inviting students:", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredStudents = studentSearch
    ? studentsPage.filter((s) => s._id === studentSearch._id)
    : studentsPage;

  const handleCompleteEnrollment = async (studentId: string) => {
    const enrollId = enrollMap[studentId]?.enrollId;
    if (!enrollId) return;
    setCompleteLoading(enrollId);
    try {
      await enrollStudentApi.completeEnrollment(enrollId);
      // Refetch enrollments after completion
      await refetchEnrollments();
    } catch (error) {
      console.error('Error completing enrollment:', error);
    } finally {
      setCompleteLoading(null);
    }
  };

  // Helper to refetch enrollments for current page
  const refetchEnrollments = async () => {
    setEnrollLoading(true);
    try {
      const enrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page);
      const studentsList = enrollments.map((enroll: any) => enroll.student_id && typeof enroll.student_id === 'object' ? enroll.student_id : enroll.student_id);
      setStudentsPage(studentsList);
      // Prefetch next page
      const nextEnrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page + 1);
      const nextStudentsList = nextEnrollments.map((enroll: any) => enroll.student_id && typeof enroll.student_id === 'object' ? enroll.student_id : enroll.student_id);
      setNextPageData(nextStudentsList);
      setNextPageEmpty(!nextStudentsList || nextStudentsList.length === 0);
      // Build enrollMap for current page
      const map: Record<string, { enrollId: string; dateJoin: string; status?: string }> = {};
      for (const enroll of enrollments) {
        const studentId = enroll.student_id?._id || enroll.student_id;
        if (studentId) {
          map[studentId] = {
            enrollId: enroll._id,
            dateJoin: enroll.date_join,
            status: enroll.status || enroll.completion_status || undefined
          };
        }
      }
      setEnrollMap(map);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Invite Students Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Key pass: {classData.keypass}</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
        >
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            sx={{ flex: 1, minWidth: 250 }}
            value={addStudentList}
            onChange={(_, value) => setAddStudentList(value as string[])}
            renderInput={(params) => (
              <TextField {...params} label="Enter Student ID" size="small" />
            )}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            sx={{ height: "40px", minHeight: "40px", whiteSpace: "nowrap" }}
            onClick={handleInviteStudents}
            disabled={inviteLoading || addStudentList.length === 0}
          >
            {inviteLoading ? "Inviting..." : "Add Student"}
          </Button>
        </Stack>
      </Paper>

      {/* Student List Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Student List</Typography>
        <Divider sx={{ mb: 2 }} />
        <Autocomplete
          options={students}
          getOptionLabel={(option) => option.username}
          sx={{ width: 250, mb: 2 }}
          value={studentSearch}
          onChange={(_, value) => setStudentSearch(value)}
          renderInput={(params) => (
            <TextField {...params} label="Find Student" size="small" />
          )}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Index</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Enroll date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students exist
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s, index) => (
                  <TableRow
                    key={s._id}
                    hover
                    onClick={() => setSelectedStudent(selectedStudent?._id === s._id ? null : s)}
                    sx={{ cursor: "pointer", bgcolor: selectedStudent?._id === s._id ? "action.selected" : undefined }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{s._id}</TableCell>
                    <TableCell>{s.username}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      {enrollMap[s._id]?.dateJoin
                        ? new Date(enrollMap[s._id].dateJoin).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {/* Status as colored chip, from enrollment */}
                      {(() => {
                        const status = enrollMap[s._id]?.status;
                        if (status === 'completed' || status === 'complete') {
                          return <Chip label="Completed" color="success" size="small" />;
                        } else if (status === 'pending') {
                          return <Chip label="Pending" color="warning" size="small" />;
                        } else if (status) {
                          return <Chip label={status} color="default" size="small" />;
                        } else {
                          return <Chip label="N/A" color="default" size="small" />;
                        }
                      })()}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                        <Button color="error" size="small" sx={{ minWidth: 80, fontWeight: 500 }}>
                          REMOVE
                        </Button>
                        {enrollMap[s._id]?.enrollId && (
                          <Button
                            color="primary"
                            size="small"
                            sx={{ minWidth: 90, fontWeight: 500 }}
                            disabled={completeLoading === enrollMap[s._id].enrollId || (enrollMap[s._id]?.status === 'completed' || enrollMap[s._id]?.status === 'complete')}
                            onClick={e => {
                              e.stopPropagation();
                              handleCompleteEnrollment(s._id);
                            }}
                          >
                            {completeLoading === enrollMap[s._id].enrollId ? 'COMPLETING...' : 'COMPLETE'}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination controls */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }} paddingBottom={1} paddingRight={1}>
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </Button>
          <Button
            variant="outlined"
            disabled={nextPageEmpty}
            onClick={() => {
              setStudentsPage(nextPageData);
              setPage(page + 1);
            }}
          >
            Trang sau
          </Button>
        </Stack>
      </Paper>

      {/* Student Progress Section */}
      {selectedStudent && enrollMap[selectedStudent._id] && (
        <StudentProgress
          enrollId={enrollMap[selectedStudent._id].enrollId}
          student={selectedStudent}
        />
      )}
      {selectedStudent && !enrollLoading && !enrollMap[selectedStudent._id] && (
        <Paper sx={{ p: 3 }}>
          <Typography align="center" color="text.secondary">
            No enrollment found for this student
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
