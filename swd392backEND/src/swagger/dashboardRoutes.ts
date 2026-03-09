/**
 * @openapi
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *           description: Total number of users
 *           example: 150
 *         totalCourses:
 *           type: integer
 *           description: Total number of courses
 *           example: 25
 *         totalClasses:
 *           type: integer
 *           description: Total number of classes
 *           example: 45
 *         totalEnrollments:
 *           type: integer
 *           description: Total number of enrollments
 *           example: 320
 *         activeStudents:
 *           type: integer
 *           description: Number of active students
 *           example: 120
 *         activeTeachers:
 *           type: integer
 *           description: Number of active teachers
 *           example: 15
 *         recentActivity:
 *           type: array
 *           description: Recent activity logs
 *           items:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 example: "User registered"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               details:
 *                 type: object
 */

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics
 *     description: "[Public] Retrieve dashboard statistics and analytics."
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Internal server error
 */
