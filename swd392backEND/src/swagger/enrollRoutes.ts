/**
 * @openapi
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Enrollment ID
 *           example: "507f1f77bcf86cd799439011"
 *         user_id:
 *           type: string
 *           description: Student ID
 *           example: "507f1f77bcf86cd799439012"
 *         class_id:
 *           type: string
 *           description: Class ID
 *           example: "507f1f77bcf86cd799439013"
 *         status:
 *           type: string
 *           enum: [enrolled, completed, dropped]
 *           description: Enrollment status
 *           example: "enrolled"
 *         enrollment_date:
 *           type: string
 *           format: date-time
 *           description: Date of enrollment
 *         completion_date:
 *           type: string
 *           format: date-time
 *           description: Date when enrollment was marked as completed
 *           nullable: true
 */

/**
 * @openapi
 * /api/enroll/{class_id}:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll in a class
 *     description: Student enrolls in a class using class ID (student only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to enroll in
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keypass:
 *                 type: string
 *                 description: Class enrollment key (if required)
 *                 example: "ABC123XYZ"
 *     responses:
 *       201:
 *         description: Enrollment successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Bad request - Already enrolled or invalid keypass
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/teacher/enroll/{class_id}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollments by class
 *     description: Get all enrollments for a specific class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [enrolled, completed, dropped]
 *         description: Filter by enrollment status
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrollments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrollment'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/enroll/{enroll_id}/completed:
 *   patch:
 *     tags:
 *       - Enrollments
 *     summary: Mark enrollment as completed
 *     description: Mark a student's enrollment as completed (teacher only, must be the class teacher)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: enroll_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Must be the teacher of this class
 *       404:
 *         description: Enrollment not found
 */
