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
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [enrollmentsPage, setEnrollmentsPage] = useState<any[]>([]);
  const [nextEnrollmentsPage, setNextEnrollmentsPage] = useState<any[]>([]);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [nextPageEmpty, setNextPageEmpty] = useState(false);
  const [completeLoading, setCompleteLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setEnrollLoading(true);
      try {
        const enrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page);
        setEnrollmentsPage(enrollments);

        const nextEnrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page + 1);
        setNextEnrollmentsPage(nextEnrollments);
        setNextPageEmpty(!nextEnrollments || nextEnrollments.length === 0);
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

  const filteredEnrollments = studentSearch
    ? enrollmentsPage.filter((enroll: any) => {
      const studentId = enroll.student_id?._id || enroll.student_id;
      return studentId === studentSearch._id;
    })
    : enrollmentsPage;

  const handleCompleteEnrollment = async (enrollId: string) => {
    if (!enrollId) return;
    setCompleteLoading(enrollId);
    try {
      await enrollStudentApi.completeEnrollment(enrollId);
      await refetchEnrollments();
    } catch (error) {
      console.error('Error completing enrollment:', error);
    } finally {
      setCompleteLoading(null);
    }
  };

  const refetchEnrollments = async () => {
    setEnrollLoading(true);
    try {
      const enrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page);
      setEnrollmentsPage(enrollments);
      const nextEnrollments = await enrollStudentApi.getEnrollmentsByClass(classData._id, page + 1);
      setNextEnrollmentsPage(nextEnrollments);
      setNextPageEmpty(!nextEnrollments || nextEnrollments.length === 0);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
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
              {filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students exist
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((enrollment: any, index) => {
                  const student =
                    enrollment.student_id && typeof enrollment.student_id === "object"
                      ? enrollment.student_id
                      : null;
                  const enrollmentStatus = enrollment?.status || enrollment?.completion_status;
                  const studentId = student?._id || enrollment.student_id || "N/A";
                  return (
                    <TableRow
                      key={enrollment._id}
                      hover
                      onClick={() => setSelectedEnrollment(selectedEnrollment?._id === enrollment._id ? null : enrollment)}
                      sx={{ cursor: "pointer", bgcolor: selectedEnrollment?._id === enrollment._id ? "action.selected" : undefined }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{studentId}</TableCell>
                      <TableCell>{student?.username || "N/A"}</TableCell>
                      <TableCell>{student?.email || "N/A"}</TableCell>
                      <TableCell>
                        {enrollment?.date_join
                          ? new Date(enrollment.date_join).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {enrollmentStatus || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                          <Button color="error" size="small" sx={{ minWidth: 80, fontWeight: 500 }}>
                            REMOVE
                          </Button>
                          {enrollment?._id && (
                            <Button
                              color="primary"
                              size="small"
                              sx={{ minWidth: 90, fontWeight: 500 }}
                              disabled={completeLoading === enrollment._id || (enrollmentStatus === 'completed' || enrollmentStatus === 'complete')}
                              onClick={e => {
                                e.stopPropagation();
                                handleCompleteEnrollment(enrollment._id);
                              }}
                            >
                              {completeLoading === enrollment._id ? 'COMPLETING...' : 'COMPLETE'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>


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
              setEnrollmentsPage(nextEnrollmentsPage);
              setPage(page + 1);
            }}
          >
            Trang sau
          </Button>
        </Stack>
      </Paper>

      {selectedEnrollment && selectedEnrollment.student_id && typeof selectedEnrollment.student_id === "object" && (
        <StudentProgress
          enrollId={selectedEnrollment._id}
          student={selectedEnrollment.student_id}
        />
      )}
      {selectedEnrollment && !enrollLoading && (!selectedEnrollment.student_id || typeof selectedEnrollment.student_id !== "object") && (
        <Paper sx={{ p: 3 }}>
          <Typography align="center" color="text.secondary">
            No enrollment found for this student
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
