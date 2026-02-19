import { Box, Typography, Stack, Paper, Grid, Tabs, Tab } from "@mui/material";
import type { Topic, Student, Class } from "../../types/teacherType";
import ClassMaterial from "./teacherClassDetailTabs/classMaterial";
import StudentList from "./teacherClassDetailTabs/studentList";
import { useState } from "react";

const mockTopics: Topic[] = [
  {
    title: "Chemical reactions",
    class: "Class 9A",
    description: "Balancing equations, reaction rates, lab safety recap.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 1,
        type: "file",
        order_num: 1,
        class_assign_id: 9,
        title: "Safety lab guide",
        dateUpdate: null,
        dateCreate: new Date("2026-02-10"),
        content: {
          file_id: 1,
          file_name: "sample_data.gif",
          file_path: "/sample/sample_data.gif",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 2,
        type: "slide",
        order_num: 2,
        class_assign_id: 9,
        title: "Reaction rates presentation",
        dateUpdate: null,
        dateCreate: new Date("2026-02-10"),
        content: {
          slide_id: 2,
          slide_name: "sample",
          file_path: "/sample/sample.pptx",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 3,
        type: "file",
        order_num: 3,
        class_assign_id: 9,
        title: "Practice worksheet",
        dateUpdate: new Date("2026-02-12"),
        dateCreate: new Date("2026-02-08"),
        content: {
          file_id: 3,
          file_name: "sample_data.gif",
          file_path: "/sample/sample_data.gif",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
    ],
  },
  {
    title: "Stoichiometry",
    class: "Class 9A",
    description: "Mole concept review and practice worksheets.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 4,
        type: "2d_render",
        order_num: 1,
        class_assign_id: 9,
        title: "Mole ratio visualization",
        dateUpdate: null,
        dateCreate: new Date("2026-02-08"),
        content: {
          render_id: 4,
          render_data: '{"placeholder": "2D visualization coming soon"}',
        },
        is_ai_material: true,
        ai_content_id: 12,
      },
      {
        material_id: 5,
        type: "quiz",
        order_num: 2,
        class_assign_id: 9,
        title: "Interactive stoichiometry quiz",
        dateUpdate: null,
        dateCreate: new Date("2026-02-08"),
        content: {
          quiz_id: 5,
          material_id: 5,
          title: "Tính toán hợp thức",
          keyword: "hợp thức, mol, tỷ lệ",
          type: "interactive",
          available_date: new Date("2026-02-15"),
          max_attempt_number: 2,
          end_date: new Date("2026-02-25"),
          status: true,
          questions: [
            {
              id: "q5-1",
              content: "Có bao nhiêu mol trong 44 g CO₂? (khối lượng mol = 44 g/mol)",
              type: "multiple-choice",
              options: ["0,5 mol", "1 mol", "2 mol", "44 mol"],
              correctAnswer: "1 mol",
              explanation: "Số mol = khối lượng ÷ khối lượng mol = 44 ÷ 44 = 1 mol.",
              has2DVisualization: true,
            },
            {
              id: "q5-2",
              content: "Trong một phương trình hóa học cân bằng, tỷ lệ mol giữa các chất bằng tỷ lệ hệ số của chúng.",
              type: "true-false",
              correctAnswer: "true",
              explanation: "Hệ số hợp thức thể hiện trực tiếp mối quan hệ mol giữa các chất phản ứng và sản phẩm.",
            },
            {
              id: "q5-3",
              content: "Khối lượng mol của H₂O là bao nhiêu?",
              type: "multiple-choice",
              options: ["16 g/mol", "18 g/mol", "20 g/mol", "2 g/mol"],
              correctAnswer: "18 g/mol",
              explanation: "H₂O: 2×1 (H) + 16 (O) = 18 g/mol.",
            },
            {
              id: "q5-4",
              content: "Tính số mol trong 36 g nước (H₂O, khối lượng mol = 18 g/mol).",
              type: "short-answer",
              correctAnswer: "2 mol",
              explanation: "36 ÷ 18 = 2 mol.",
            },
          ],
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 6,
        type: "file",
        order_num: 3,
        class_assign_id: 9,
        title: "Mole concept reference sheet",
        dateUpdate: null,
        dateCreate: new Date("2026-02-05"),
        content: {
          file_id: 6,
          file_name: "sample_data.gif",
          file_path: "/sample/sample_data.gif",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
    ],
  },
  {
    title: "Experiment lab prep",
    class: "Class 9A",
    description: "Safety checklist and lab procedure videos.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 7,
        type: "quiz",
        order_num: 1,
        class_assign_id: 9,
        title: "Lab safety assessment",
        dateUpdate: null,
        dateCreate: new Date("2026-02-05"),
        content: {
          quiz_id: 7,
          material_id: 7,
          title: "Quy trình an toàn phòng thí nghiệm",
          keyword: "an toàn, phòng thí nghiệm, quy trình",
          type: "standard",
          available_date: new Date("2026-02-06"),
          max_attempt_number: 3,
          end_date: new Date("2026-02-20"),
          status: true,
          questions: [
            {
              id: "q7-1",
              content: "Việc đầu tiên cần làm khi hóa chất bắn vào da là gì?",
              type: "multiple-choice",
              options: [
                "Lau bằng khăn giấy khô",
                "Rửa bằng nước ít nhất 15 phút",
                "Bôi kem trung hòa ngay lập tức",
                "Bỏ qua nếu lượng nhỏ",
              ],
              correctAnswer: "Rửa bằng nước ít nhất 15 phút",
              explanation: "Rửa nước lâu sẽ pha loãng và loại bỏ hóa chất trước khi gây hại thêm.",
            },
            {
              id: "q7-2",
              content: "Có thể dùng miệng hút pipette hóa chất trong phòng thí nghiệm giảng dạy.",
              type: "true-false",
              correctAnswer: "false",
              explanation: "Hút pipette bằng miệng bị cấm nghiẾm trong mọi môi trường phòng thí nghiệm.",
            },
            {
              id: "q7-3",
              content: "Thiết bị bảo hộ cá nhân (PPE) nào bắt buộc phải đeo trong phòng thí nghiệm hóa học?",
              type: "multiple-choice",
              options: [
                "Chỉ đeo găng tay",
                "Chỉ đeo kính bảo hộ",
                "Kính bảo hộ, găng tay và áo blúp",
                "Mũ cứng và ủng bảo hộ",
              ],
              correctAnswer: "Kính bảo hộ, găng tay và áo blúp",
            },
            {
              id: "q7-4",
              content: "Thức ăn và đồ uống được phép mang vào phòng thí nghiệm nếu đựng trong hộp kín.",
              type: "true-false",
              correctAnswer: "false",
              explanation: "Thức ăn và đồ uống không bao giờ được phép trong phòng thí nghiệm do nguy cơ nhiễm bẩn.",
            },
          ],
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 8,
        type: "slide",
        order_num: 2,
        class_assign_id: 9,
        title: "Lab procedures slideshow",
        dateUpdate: null,
        dateCreate: new Date("2026-02-04"),
        content: {
          slide_id: 8,
          slide_name: "sample",
          file_path: "/sample/sample.pptx",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 9,
        type: "file",
        order_num: 3,
        class_assign_id: 9,
        title: "Equipment checklist",
        dateUpdate: null,
        dateCreate: new Date("2026-02-03"),
        content: {
          file_id: 9,
          file_name: "sample_data.gif",
          file_path: "/sample/sample_data.gif",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
    ],
  },
  {
    title: "Organic chemistry intro",
    class: "Class 9A",
    description: "Basic organic compounds and naming conventions.",
    belongToCourse: "Chemistry 9 - 2022",
    ClassMaterialType: [
      {
        material_id: 10,
        type: "2d_render",
        order_num: 1,
        class_assign_id: 9,
        title: "Molecular structure viewer",
        dateUpdate: null,
        dateCreate: new Date("2026-02-01"),
        content: {
          render_id: 10,
          render_data: '{}',
        },
        is_ai_material: true,
        ai_content_id: 15,
      },
      {
        material_id: 11,
        type: "quiz",
        order_num: 2,
        class_assign_id: 9,
        title: "Compound naming quiz",
        dateUpdate: null,
        dateCreate: new Date("2026-02-01"),
        content: {
          quiz_id: 11,
          material_id: 11,
          title: "Gọi tên hợp chất hữu cơ",
          keyword: "hữu cơ, gọi tên, hợp chất",
          type: "interactive",
          available_date: new Date("2026-02-20"),
          max_attempt_number: 1,
          end_date: new Date("2026-03-01"),
          status: true,
          questions: [
            {
              id: "q11-1",
              content: "Tên IUPAC của hợp chất CH₄ là gì?",
              type: "multiple-choice",
              options: ["Etan", "Propan", "Metan", "Butan"],
              correctAnswer: "Metan",
              explanation: "CH₄ có một nguyên tử cacbon; tiền tố 'meth-' biểu thị 1 cacbon.",
              has2DVisualization: true,
            },
            {
              id: "q11-2",
              content: "Phân tử pentan có bao nhiêu nguyên tử cacbon?",
              type: "multiple-choice",
              options: ["3", "4", "5", "6"],
              correctAnswer: "5",
              explanation: "Tiền tố 'pent-' có nghĩa là 5; pentan là C₅H₁₂.",
            },
            {
              id: "q11-3",
              content: "Ankan có công thức phân tử tổng quát là CₙH₂ₙ₊₂.",
              type: "true-false",
              correctAnswer: "true",
              explanation: "Công thức này xác định hiđrocacbon no chỉ có liên kết đơn C–C.",
            },
            {
              id: "q11-4",
              content: "Gọi tên nhóm chức –OH có trong hợp chất ancol.",
              type: "short-answer",
              correctAnswer: "Hydroxyl",
              explanation: "Nhóm –OH (hydroxyl) là đặc điểm xác Định của ancol.",
            },
          ],
        },
        is_ai_material: false,
        ai_content_id: null,
      },
      {
        material_id: 12,
        type: "slide",
        order_num: 3,
        class_assign_id: 9,
        title: "Organic fundamentals",
        dateUpdate: new Date("2026-02-02"),
        dateCreate: new Date("2026-01-30"),
        content: {
          slide_id: 12,
          slide_name: "sample",
          file_path: "/sample/sample.pptx",
        },
        is_ai_material: false,
        ai_content_id: null,
      },
    ],
  },
];

const mockStudents: Student[] = [
  {
    student_id: "ST001",
    student_name: "Alice Johnson",
    email: "alice.johnson@email.com",
    enrolled_date: new Date("2025-09-15"),
    status: "active",
  },
  {
    student_id: "ST002",
    student_name: "Bob Smith",
    email: "bob.smith@email.com",
    enrolled_date: new Date("2025-09-16"),
    status: "active",
  },
  {
    student_id: "ST003",
    student_name: "Charlie Brown",
    email: "charlie.brown@email.com",
    enrolled_date: new Date("2025-09-17"),
    status: "active",
  },
  {
    student_id: "ST004",
    student_name: "Diana Prince",
    email: "diana.prince@email.com",
    enrolled_date: new Date("2025-09-18"),
    status: "inactive",
  },
  {
    student_id: "ST005",
    student_name: "Edward Norton",
    email: "edward.norton@email.com",
    enrolled_date: new Date("2025-09-19"),
    status: "active",
  },
];

const mockClassData: Class = {
  class_id: "CLS-CHM9A-2025",
  class_name: "Chemistry 9A",
  keypass: "CHM9A2025",
  course_id: "CHM-9-2022",
  teacher_id: "TCH001",
  img_cover_link: "/images/chemistry-cover.jpg",
  keywords: "chemistry, grade9, reactions, stoichiometry",
  date_create: new Date("2025-09-12"),
  status: "active",
  course_name: "Chemistry 9 - 2022",
};

const TeacherClassDetail = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Hóa học 9A · Chi tiết lớp học
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý tài liệu học tập theo từng chủ đề, lịch phát hành và tài nguyên hỗ trợ.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Chủ đề & Tài liệu" />
              <Tab label="Học sinh" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {tabValue === 0 && <ClassMaterial topics={mockTopics} classId={mockClassData.class_id} />}
            {tabValue === 1 && (
              <StudentList students={mockStudents} classData={mockClassData} />
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tổng quan lớp học
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Mã khoá học:</strong> Chemistry 9 - 2022
              </Typography>
              <Typography variant="body2">
                <strong>Học sinh đã đăng ký:</strong> 32
              </Typography>
              <Typography variant="body2">
                <strong>Ngày tạo:</strong> 12/09/2025
              </Typography>
            </Stack>
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Nhắc nhở sắp tới
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Phản hồi bài kiểm tra hạn vào thứ Sáu.
              </Typography>
              <Typography variant="body2">
                • Danh sách thiết bị phòng lab cần xác nhận.
              </Typography>
              <Typography variant="body2">
                • Bản nháp bản tin phụ huynh đang chờ hoàn thiện.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherClassDetail;
