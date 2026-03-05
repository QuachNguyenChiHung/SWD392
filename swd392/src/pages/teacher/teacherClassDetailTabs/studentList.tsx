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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { type Student, type Class } from "../../../types/teacherType";
import { useState } from "react";

interface StudentListProp {
  students: Student[];
  classData: Class;
}

export default function StudentList({ students, classData }: StudentListProp) {
  const [studentSearch, setStudentSearch] = useState<Student | null>(null);
  const [addStudentList, setAddStudentList] = useState<string[]>([]);

  const filteredStudents = studentSearch
    ? students.filter((s) => s._id === studentSearch._id)
    : students;

  return (
    <Paper sx={{ p: 3 }}>
      <TableContainer component={Stack} p={2} spacing={2} mb={3}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) => option.student_name}
          sx={{ width: 250 }}
          value={studentSearch}
          onChange={(_, value) => setStudentSearch(value)}
          renderInput={(params) => (
            <TextField {...params} label="Find Student" size="small" />
          )}
        />

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
                <TableRow key={s._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{s._id}</TableCell>
                  <TableCell>{s.student_name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    {new Date(s.enrolled_date).toLocaleString()}
                  </TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell align="center">
                    <Button color="error">Remove</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="column"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        p={2}
      >
        <Typography variant="h6">Key pass: {classData.keypass}</Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            sx={{ width: 250 }}
            value={addStudentList}
            onChange={(_, value) => setAddStudentList(value as string[])}
            renderInput={(params) => (
              <TextField {...params} label="Enter Student Email" size="small" />
            )}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            size="small"
            sx={{ height: "40px", minHeight: "40px" }}
          >
            Add Student
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
