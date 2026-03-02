/**
 * @openapi
 * components:
 *   schemas:
 *     AdminDashboard:
 *       type: object
 *       required:
 *         - role
 *         - totalUsers
 *         - totalClasses
 *         - totalLessons
 *       properties:
 *         role:
 *           type: string
 *           enum: [admin]
 *           example: admin
 *         totalUsers:
 *           type: number
 *           description: Total number of users in the system
 *           example: 150
 *         totalClasses:
 *           type: number
 *           description: Total number of classes
 *           example: 45
 *         totalLessons:
 *           type: number
 *           description: Total number of lessons/materials (ClassMaterial count)
 *           example: 320
 * 
 *     PendingContentItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: AI Content ID
 *         ai_request_id:
 *           type: object
 *           description: Populated AI request data
 *         review_status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: pending
 *         content_type:
 *           type: string
 *           description: Type of content
 *         record_json:
 *           type: object
 *           description: Content data (JSON)
 * 
 *     ViolationReportItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Feedback ID
 *         material_id:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             type:
 *               type: string
 *         user_id:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           description: Rating (reports with rating <= 2)
 *         comment:
 *           type: string
 *           description: User comment
 *         date:
 *           type: string
 *           format: date-time
 * 
 *     SuspendedAccountItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, teacher, admin, moderator]
 *         date_create:
 *           type: string
 *           format: date-time
 * 
 *     ModeratorDashboard:
 *       type: object
 *       required:
 *         - role
 *         - pendingCount
 *         - violationCount
 *         - suspendedCount
 *         - pendingContent
 *         - violationReports
 *         - suspendedAccounts
 *       properties:
 *         role:
 *           type: string
 *           enum: [moderator]
 *           example: moderator
 *         pendingCount:
 *           type: number
 *           description: Total count of AI content pending review (Nội dung chờ duyệt)
 *           example: 12
 *         pendingContent:
 *           type: array
 *           description: Array of pending AI content (limit 50)
 *           items:
 *             $ref: '#/components/schemas/PendingContentItem'
 *         violationCount:
 *           type: number
 *           description: Total count of violation reports (Báo cáo vi phạm)
 *           example: 5
 *         violationReports:
 *           type: array
 *           description: Array of low-rated feedback (rating <= 2) or flagged comments (limit 50)
 *           items:
 *             $ref: '#/components/schemas/ViolationReportItem'
 *         suspendedCount:
 *           type: number
 *           description: Total count of banned/suspended accounts (Tài khoản bị đình chỉ)
 *           example: 3
 *         suspendedAccounts:
 *           type: array
 *           description: Array of banned users (limit 50)
 *           items:
 *             $ref: '#/components/schemas/SuspendedAccountItem'
 * 
 *     Achievement:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           enum: [first_class, dedicated, high_achiever, quiz_master]
 *           description: Achievement identifier
 *         name:
 *           type: string
 *           description: Achievement display name
 *         earned:
 *           type: boolean
 *           description: Whether achievement is earned
 *           example: true
 * 
 *     StudentDashboard:
 *       type: object
 *       required:
 *         - role
 *         - currentStudyingClasses
 *         - averageScore
 *         - achievements
 *         - enrollments
 *       properties:
 *         role:
 *           type: string
 *           enum: [student]
 *           example: student
 *         currentStudyingClasses:
 *           type: number
 *           description: Number of classes with status 'in_progress'
 *           example: 3
 *         averageScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Average quiz score across all attempts (rounded)
 *           example: 85
 *         achievements:
 *           type: array
 *           description: |
 *             Array of earned achievements:
 *             - first_class: Complete 1+ class
 *             - dedicated: Complete 5+ classes
 *             - high_achiever: Average score >= 80%
 *             - quiz_master: Complete 10+ quizzes
 *           items:
 *             $ref: '#/components/schemas/Achievement'
 *         enrollments:
 *           type: array
 *           description: All student enrollments with populated class, course, and teacher data
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               class_id:
 *                 type: object
 *                 description: Populated class with nested course_id and teacher_id
 *               student_id:
 *                 type: string
 *               date_join:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed]
 *               date_end:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 * 
 *     ClassProgress:
 *       type: object
 *       required:
 *         - name
 *         - completionMessage
 *         - completed
 *         - total
 *       properties:
 *         name:
 *           type: string
 *           description: Class name
 *           example: "Chemistry A"
 *         completionMessage:
 *           type: string
 *           description: Formatted completion status message
 *           example: "10 in 25 students have finished class: Chemistry A"
 *         completed:
 *           type: number
 *           description: Number of students who completed the class
 *           example: 10
 *         total:
 *           type: number
 *           description: Total number of enrolled students
 *           example: 25
 * 
 *     TeacherDashboard:
 *       type: object
 *       required:
 *         - role
 *         - totalClasses
 *         - classProgress
 *       properties:
 *         role:
 *           type: string
 *           enum: [teacher]
 *           example: teacher
 *         totalClasses:
 *           type: number
 *           description: Total number of classes taught by this teacher
 *           example: 5
 *         classProgress:
 *           type: array
 *           description: Progress data for each class (x in n students format)
 *           items:
 *             $ref: '#/components/schemas/ClassProgress'
 *
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: Authorization
 *       description: Signed cookie containing Bearer token
 */

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get role-based dashboard data
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Returns dashboard statistics based on authenticated user's role.
 *       
 *       **Admin Dashboard:**
 *       - Total users, classes, and lessons
 *       
 *       **Moderator Dashboard (Kiểm duyệt):**
 *       - Nội dung chờ duyệt (Pending content for review)
 *       - Báo cáo vi phạm (Violation reports - low ratings/flagged comments)
 *       - Tài khoản bị đình chỉ (Suspended/banned accounts)
 *       
 *       **Student Dashboard:**
 *       - Current studying classes (in_progress status)
 *       - Average quiz score
 *       - Achievements unlocked
 *       
 *       **Teacher Dashboard:**
 *       - Total classes taught
 *       - Class completion progress (x in n students format)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AdminDashboard'
 *                 - $ref: '#/components/schemas/ModeratorDashboard'
 *                 - $ref: '#/components/schemas/StudentDashboard'
 *                 - $ref: '#/components/schemas/TeacherDashboard'
 *             examples:
 *               admin:
 *                 summary: Admin Dashboard Response
 *                 value:
 *                   role: admin
 *                   totalUsers: 150
 *                   totalClasses: 45
 *                   totalLessons: 320
 *               moderator:
 *                 summary: Moderator Dashboard Response
 *                 value:
 *                   role: moderator
 *                   pendingCount: 12
 *                   violationCount: 5
 *                   suspendedCount: 3
 *                   pendingContent:
 *                     - _id: "65abc123def456"
 *                       review_status: pending
 *                       content_type: "slide"
 *                       record_json: {}
 *                       ai_request_id: {}
 *                   violationReports:
 *                     - _id: "65abc789ghi012"
 *                       rating: 1
 *                       comment: "Inappropriate content"
 *                       date: "2026-03-01T10:00:00Z"
 *                       user_id:
 *                         username: "student1"
 *                         email: "student1@example.com"
 *                       material_id:
 *                         title: "Lesson 1"
 *                         type: "slide"
 *                   suspendedAccounts:
 *                     - _id: "65abc345jkl678"
 *                       username: "banneduser"
 *                       email: "banned@example.com"
 *                       role: "student"
 *                       date_create: "2025-12-01T08:00:00Z"
 *               student:
 *                 summary: Student Dashboard Response
 *                 value:
 *                   role: student
 *                   currentStudyingClasses: 3
 *                   averageScore: 85
 *                   achievements:
 *                     - id: "first_class"
 *                       name: "First Class"
 *                       earned: true
 *                     - id: "high_achiever"
 *                       name: "High Achiever"
 *                       earned: true
 *                   enrollments:
 *                     - _id: "65abc901mno234"
 *                       class_id: {}
 *                       student_id: "65abc567pqr890"
 *                       date_join: "2026-02-01T09:00:00Z"
 *                       status: "in_progress"
 *                       date_end: null
 *               teacher:
 *                 summary: Teacher Dashboard Response
 *                 value:
 *                   role: teacher
 *                   totalClasses: 5
 *                   classProgress:
 *                     - name: "Chemistry A"
 *                       completionMessage: "10 in 25 students have finished class: Chemistry A"
 *                       completed: 10
 *                       total: 25
 *                     - name: "Physics B"
 *                       completionMessage: "15 in 30 students have finished class: Physics B"
 *                       completed: 15
 *                       total: 30
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden - Invalid user role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid role
 *       404:
 *         description: Teacher profile not found (teacher role only)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Teacher not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
