import type {
    Topic,
    Student,
    Class,
    ClassCompletionStat,
    UploadedFileRecord,
    DueAssignment,
    Course
} from "../src/types/teacherType";
import type { Announcement } from "../src/types";

// Mock data for Teacher Class Detail page - organized by class
export const mockTopicsByClass: Record<string, Topic[]> = {
    "CLS-CHM9A-2025": [
        {
            title: "Chemical reactions",
            class: "Chemistry 9A",
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
            class: "Chemistry 9A",
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
            class: "Chemistry 9A",
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
    ],
    "math11-2023": [
        {
            title: "Giới hạn và liên tục",
            class: "Math 11 Advanced",
            description: "Khái niệm giới hạn, tính liên tục của hàm số",
            belongToCourse: "Mathematics 11 - 2023",
            ClassMaterialType: [
                {
                    material_id: 101,
                    type: "slide",
                    order_num: 1,
                    class_assign_id: 11,
                    title: "Giới thiệu về giới hạn",
                    dateUpdate: null,
                    dateCreate: new Date("2026-01-15"),
                    content: {
                        slide_id: 101,
                        slide_name: "limit_intro",
                        file_path: "/sample/limit_intro.pptx",
                    },
                    is_ai_material: false,
                    ai_content_id: null,
                },
                {
                    material_id: 102,
                    type: "quiz",
                    order_num: 2,
                    class_assign_id: 11,
                    title: "Bài kiểm tra giới hạn",
                    dateUpdate: null,
                    dateCreate: new Date("2026-01-16"),
                    content: {
                        quiz_id: 102,
                        material_id: 102,
                        title: "Kiểm tra giới hạn cơ bản",
                        keyword: "giới hạn, limit, toán học",
                        type: "interactive",
                        available_date: new Date("2026-02-20"),
                        max_attempt_number: 3,
                        end_date: new Date("2026-02-28"),
                        status: true,
                        questions: [
                            {
                                id: "q102-1",
                                content: "Giới hạn của x khi x tiến đến 2 trong hàm f(x) = x + 1 là bao nhiêu?",
                                type: "multiple-choice",
                                options: ["1", "2", "3", "4"],
                                correctAnswer: "3",
                                explanation: "lim(x→2) (x + 1) = 2 + 1 = 3",
                                has2DVisualization: false,
                            },
                            {
                                id: "q102-2",
                                content: "Hàm số liên tục tại một điểm khi nào?",
                                type: "true-false",
                                correctAnswer: "true",
                                explanation: "Hàm số liên tục tại điểm a khi lim(x→a) f(x) = f(a)",
                            },
                        ],
                    },
                    is_ai_material: false,
                    ai_content_id: null,
                },
                {
                    material_id: 103,
                    type: "file",
                    order_num: 3,
                    class_assign_id: 11,
                    title: "Bài tập về giới hạn",
                    dateUpdate: null,
                    dateCreate: new Date("2026-01-17"),
                    content: {
                        file_id: 103,
                        file_name: "limit_exercises.pdf",
                        file_path: "/sample/limit_exercises.pdf",
                    },
                    is_ai_material: false,
                    ai_content_id: null,
                },
            ],
        },
        {
            title: "Đạo hàm",
            class: "Math 11 Advanced",
            description: "Định nghĩa đạo hàm, quy tắc tính đạo hàm",
            belongToCourse: "Mathematics 11 - 2023",
            ClassMaterialType: [
                {
                    material_id: 104,
                    type: "slide",
                    order_num: 1,
                    class_assign_id: 11,
                    title: "Định nghĩa đạo hàm",
                    dateUpdate: null,
                    dateCreate: new Date("2026-01-20"),
                    content: {
                        slide_id: 104,
                        slide_name: "derivative_definition",
                        file_path: "/sample/derivative_definition.pptx",
                    },
                    is_ai_material: false,
                    ai_content_id: null,
                },
                {
                    material_id: 105,
                    type: "quiz",
                    order_num: 2,
                    class_assign_id: 11,
                    title: "Bài kiểm tra đạo hàm",
                    dateUpdate: null,
                    dateCreate: new Date("2026-01-22"),
                    content: {
                        quiz_id: 105,
                        material_id: 105,
                        title: "Kiểm tra tính đạo hàm",
                        keyword: "đạo hàm, derivative, calculus",
                        type: "standard",
                        available_date: new Date("2026-02-25"),
                        max_attempt_number: 2,
                        end_date: new Date("2026-03-05"),
                        status: true,
                        questions: [
                            {
                                id: "q105-1",
                                content: "Đạo hàm của f(x) = x² là gì?",
                                type: "multiple-choice",
                                options: ["x", "2x", "x²", "2"],
                                correctAnswer: "2x",
                                explanation: "d/dx(x²) = 2x theo quy tắc lũy thừa",
                            },
                            {
                                id: "q105-2",
                                content: "Đạo hàm của hàm hằng số bằng 0.",
                                type: "true-false",
                                correctAnswer: "true",
                                explanation: "Đạo hàm của hàm hằng số luôn bằng 0",
                            },
                        ],
                    },
                    is_ai_material: false,
                    ai_content_id: null,
                },
                {
                    material_id: 106,
                    type: "2d_render",
                    order_num: 3,
                    class_assign_id: 11,
                    title: "Biểu đồ đạo hàm",
                    dateUpdate: null,
                    dateCreate: new Date("2026-01-23"),
                    content: {
                        render_id: 106,
                        render_data: '{"type": "graph", "functions": ["x^2", "2x"], "title": "Hàm số và đạo hàm"}',
                    },
                    is_ai_material: true,
                    ai_content_id: 20,
                },
            ],
        },
    ],
};


// Helper function to get topics by class ID
export const getTopicsByClassId = (classId: string): Topic[] => {
    return mockTopicsByClass[classId] || [];
};

// Helper function to get all materials from all classes (for dashboard references)
export const getAllMaterials = () => {
    return Object.values(mockTopicsByClass)
        .flat()
        .flatMap(topic => topic.ClassMaterialType || []);
};

export const mockStudents: Student[] = [
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

// Mock data for Teacher Dashboard - connected to actual class materials
export const classCompletionStats: ClassCompletionStat[] = [
    { course: "Chemistry 9 - 2022", completed: 26, enrolled: 32, class_id: "CLS-CHM9A-2025", class_name:"Chem 9A" },
];

export type QuickAction = {
    title: string;
    description: string;
    actionLabel: string;
};

export const quickActions: QuickAction[] = [
    {
        title: "Create a new class",
        description: "Set up a fresh class workspace with materials.",
        actionLabel: "Create class",
    },
    {
        title: "View all courses",
        description: "Browse the current course catalog you manage.",
        actionLabel: "Course list",
    },
];

// Due assignments referencing actual quiz materials from both classes
export const dueAssignments: DueAssignment[] = [
    {
        quiz_id: 5, // Chemistry - Interactive stoichiometry quiz
        material_id: 5,
        title: "Interactive stoichiometry quiz",
        keyword: "hợp thức, mol, tỷ lệ",
        type: "quiz",
        available_date: new Date("2026-02-15"),
        max_attempt_number: 2,
        end_date: new Date("2026-02-25"),
        status: true,
    },
    {
        quiz_id: 102, // Math - Bài kiểm tra giới hạn
        material_id: 102,
        title: "Bài kiểm tra giới hạn",
        keyword: "giới hạn, limit, toán học",
        type: "quiz",
        available_date: new Date("2026-02-20"),
        max_attempt_number: 3,
        end_date: new Date("2026-02-28"),
        status: true,
    },
    {
        quiz_id: 105, // Math - Bài kiểm tra đạo hàm
        material_id: 105,
        title: "Bài kiểm tra đạo hàm",
        keyword: "đạo hàm, derivative, calculus",
        type: "quiz",
        available_date: new Date("2026-02-25"),
        max_attempt_number: 2,
        end_date: new Date("2026-03-05"),
        status: true,
    },
];

// File uploads referencing actual file materials from both classes
export const uploadedFiles: UploadedFileRecord[] = [
    // Chemistry files
    {
        file: "safety_lab_guide.gif",
        course: "Chemistry 9A | Chemical reactions",
        createdAt: "10 Feb 2026",
        file_id: 1,
        file_name: "sample_data.gif",
        file_path: "/sample/sample_data.gif",
    },
    {
        file: "reaction_rates_presentation.pptx",
        course: "Chemistry 9A | Chemical reactions",
        createdAt: "10 Feb 2026",
        file_id: 2,
        file_name: "sample.pptx",
        file_path: "/sample/sample.pptx",
    },
    {
        file: "mole_concept_reference.gif",
        course: "Chemistry 9A | Stoichiometry",
        createdAt: "05 Feb 2026",
        file_id: 6,
        file_name: "sample_data.gif",
        file_path: "/sample/sample_data.gif",
    },
    // Math files
    {
        file: "limit_intro.pptx",
        course: "Math 11 Advanced | Giới hạn và liên tục",
        createdAt: "15 Jan 2026",
        file_id: 101,
        file_name: "limit_intro.pptx",
        file_path: "/sample/limit_intro.pptx",
    },
    {
        file: "limit_exercises.pdf",
        course: "Math 11 Advanced | Giới hạn và liên tục",
        createdAt: "17 Jan 2026",
        file_id: 103,
        file_name: "limit_exercises.pdf",
        file_path: "/sample/limit_exercises.pdf",
    },
    {
        file: "derivative_definition.pptx",
        course: "Math 11 Advanced | Đạo hàm",
        createdAt: "20 Jan 2026",
        file_id: 104,
        file_name: "derivative_definition.pptx",
        file_path: "/sample/derivative_definition.pptx",
    },
];

export const announcements: Announcement[] = [
    {
        title: "Stoichiometry quiz deadline approaching",
        detail: "Remember to complete the stoichiometry quiz by February 25th.",
        timestamp: "2h ago",
    },
    {
        title: "Lab safety materials updated",
        detail: "New safety guidelines have been uploaded to the lab prep section.",
        timestamp: "1 day ago",
    },
    {
        title: "Organic chemistry module released",
        detail: "New materials for organic chemistry introduction are now available.",
        timestamp: "3 days ago",
    },
];

// Mock data for Teacher Classes page - using consistent class IDs
export const teacherClasses: (Class & { studentCount: number })[] = [
    {
        class_id: "CLS-CHM9A-2025", // Same as mockClassData
        class_name: "Chemistry 9A",
        keypass: "CHM9A2025",
        course_id: "chem9-2022",
        course_name: "Chemistry 9 - 2022",
        teacher_id: "TCH001",
        img_cover_link: "/images/chemistry-cover.jpg",
        keywords: "chemistry, grade9, reactions, stoichiometry",
        date_create: new Date("2025-09-12"),
        status: "active",
        studentCount: 32, // Matches classCompletionStats
    },
    {
        class_id: "math11-2023",
        class_name: "Toán nâng cao 11",
        keypass: "MATH11-2023-KEY",
        course_id: "math11-2023",
        course_name: "Mathematics 11 - 2023",
        teacher_id: "TCH001",
        img_cover_link: "/images/math.jpg",
        keywords: "mathematics, advanced, calculus",
        date_create: new Date("2026-01-03"),
        status: "active",
        studentCount: 28, // Matches classCompletionStats
    },
    {
        class_id: "phy10-2024",
        class_name: "Vật lý chuyên 10",
        keypass: "PHY10-2024-KEY",
        course_id: "physics10-2024",
        course_name: "Physics 10 - 2024",
        teacher_id: "TCH001",
        img_cover_link: "/images/physics.jpg",
        keywords: "physics, mechanics, forces",
        date_create: new Date("2025-11-18"),
        status: "active",
        studentCount: 25, // Matches classCompletionStats
    },
];

export const courseOptions: Course[] = [
    {
        course_id: "chem9-2022", // Matches the course used in mockTopics and teacherClasses
        course_name: "Chemistry 9 - 2022", // Consistent naming
        grade_level: 9,
        description: "Khóa học hóa học cơ bản dành cho học sinh lớp 9",
        date_create: new Date("2022-08-01"),
        status: "active",
        topics: [
            {
                topic_id: "topic1",
                title: "Chemical reactions", // Matches mockTopics
                description: "Balancing equations, reaction rates, lab safety recap.",
                order_num: 1
            },
            {
                topic_id: "topic2",
                title: "Stoichiometry", // Matches mockTopics
                description: "Mole concept review and practice worksheets.",
                order_num: 2
            },
            {
                topic_id: "topic3",
                title: "Experiment lab prep", // Matches mockTopics
                description: "Safety checklist and lab procedure videos.",
                order_num: 3
            },
            {
                topic_id: "topic4",
                title: "Organic chemistry intro", // Matches mockTopics
                description: "Basic organic compounds and naming conventions.",
                order_num: 4
            }
        ]
    },
    {
        course_id: "math11-2023",
        course_name: "Mathematics 11 - 2023", // Consistent naming
        grade_level: 11,
        description: "Khóa học toán nâng cao cho học sinh lớp 11",
        date_create: new Date("2023-08-01"),
        status: "active",
        topics: [
            {
                topic_id: "topic5",
                title: "Giới hạn và liên tục",
                description: "Khái niệm giới hạn, tính liên tục của hàm số",
                order_num: 1
            },
            {
                topic_id: "topic6",
                title: "Đạo hàm",
                description: "Định nghĩa đạo hàm, quy tắc tính đạo hàm",
                order_num: 2
            }
        ]
    },
    {
        course_id: "physics10-2024",
        course_name: "Physics 10 - 2024", // Consistent naming
        grade_level: 10,
        description: "Khóa học vật lý chuyên cho học sinh lớp 10",
        date_create: new Date("2024-08-01"),
        status: "active",
        topics: [
            {
                topic_id: "topic7",
                title: "Cơ học chất điểm",
                description: "Chuyển động thẳng, chuyển động tròn, lực và chuyển động",
                order_num: 1
            },
            {
                topic_id: "topic8",
                title: "Nhiệt học",
                description: "Nhiệt độ, nhiệt lượng, các định luật nhiệt động lực học",
                order_num: 2
            }
        ]
    },
    {
        course_id: "chem10-2023",
        course_name: "Chemistry 10 - Advanced", // Added for completion
        grade_level: 10,
        description: "Khóa học hóa học nâng cao cho học sinh lớp 10 chuyên",
        date_create: new Date("2023-08-01"),
        status: "active",
        topics: [
            {
                topic_id: "topic9",
                title: "Bảng tuần hoàn",
                description: "Cấu trúc bảng tuần hoàn và tính chất tuần hoàn của các nguyên tố",
                order_num: 1
            },
            {
                topic_id: "topic10",
                title: "Liên kết hóa học",
                description: "Liên kết ion, cộng hóa trị, liên kết kim loại và lực Van der Waals",
                order_num: 2
            }
        ]
    },
];
