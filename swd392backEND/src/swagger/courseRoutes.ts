/**
 * @openapi
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the course
 *           example: "507f1f77bcf86cd799439011"
 *         course_name:
 *           type: string
 *           maxLength: 255
 *           description: Name of the course
 *           example: "Introduction to Programming"
 *         grade_level:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Grade level for the course
 *           example: 10
 *         change_log:
 *           type: object
 *           description: Track changes made to the course
 *           nullable: true
 *           example: null
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Current status of the course
 *           default: active
 *           example: "active"
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Date when the course was created
 *           example: "2024-01-15T10:30:00Z"
 *     CourseCreateInput:
 *       type: object
 *       required:
 *         - course_name
 *         - grade_level
 *       properties:
 *         course_name:
 *           type: string
 *           maxLength: 255
 *           description: Name of the course
 *           example: "Introduction to Programming"
 *         grade_level:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Grade level for the course
 *           example: 10
 *         change_log:
 *           type: object
 *           description: Optional change tracking information
 *           nullable: true
 *           example: null
 *     CourseUpdateInput:
 *       type: object
 *       properties:
 *         course_name:
 *           type: string
 *           maxLength: 255
 *           description: Updated name of the course
 *           example: "Advanced Programming"
 *         grade_level:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Updated grade level for the course
 *           example: 11
 *         change_log:
 *           type: object
 *           description: Change tracking information
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Updated status of the course
 *           example: "active"
 *     CourseSearchParams:
 *       type: object
 *       properties:
 *         keyword:
 *           type: string
 *           description: Search keyword to match in course name
 *           example: "programming"
 *         grade_level:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Filter by grade level
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Filter by course status
 *         page:
 *           type: integer
 *           minimum: 1
 *           description: Page number for pagination
 *           default: 1
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Validation error or resource not found"
 */

/**
 * @openapi
 * /api/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get all courses
 *     description: Retrieve paginated list of all courses with 12 items per page
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *             example:
 *               - _id: "507f1f77bcf86cd799439011"
 *                 course_name: "Introduction to Programming"
 *                 grade_level: 10
 *                 status: "active"
 *                 date_create: "2024-01-15T10:30:00Z"
 *                 change_log: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course
 *     description: Create a new course with course name and grade level. Only accessible by administrators.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreateInput'
 *           examples:
 *             basicCourse:
 *               summary: Basic course creation
 *               value:
 *                 course_name: "Introduction to Programming"
 *                 grade_level: 10
 *             advancedCourse:
 *               summary: Course with change log
 *               value:
 *                 course_name: "Advanced Mathematics"
 *                 grade_level: 12
 *                 change_log:
 *                   created_by: "admin"
 *                   notes: "Initial course creation"
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               course_name: "Introduction to Programming"
 *               grade_level: 10
 *               status: "active"
 *               date_create: "2024-01-15T10:30:00Z"
 *               change_log: null
 *       400:
 *         description: Bad request - validation errors or duplicate course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   error: "course_name is required and must be maximum 255 characters"
 *               duplicateCourse:
 *                 summary: Duplicate course
 *                 value:
 *                   error: "Course with this name already exists"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/courses/search:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Search courses by keyword
 *     description: Search courses by keyword in course name with pagination support
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword to match in course name
 *         example: "programming"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (12 items per page)
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved courses matching the keyword
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *             example:
 *               - _id: "507f1f77bcf86cd799439011"
 *                 course_name: "Introduction to Programming"
 *                 grade_level: 10
 *                 status: "active"
 *                 date_create: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Bad request - keyword parameter is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Keyword is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course by ID
 *     description: Retrieve a specific course by its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Successfully retrieved course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               course_name: "Introduction to Programming"
 *               grade_level: 10
 *               status: "active"
 *               date_create: "2024-01-15T10:30:00Z"
 *               change_log: null
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Course not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Courses
 *     summary: Update course
 *     description: Update course information including name, grade level, and status. Only accessible by administrators.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdateInput'
 *           examples:
 *             nameUpdate:
 *               summary: Update course name
 *               value:
 *                 course_name: "Advanced Programming"
 *             gradeUpdate:
 *               summary: Update grade level
 *               value:
 *                 grade_level: 11
 *             statusUpdate:
 *               summary: Update course status
 *               value:
 *                 status: "inactive"
 *             fullUpdate:
 *               summary: Update all fields
 *               value:
 *                 course_name: "Advanced Programming Concepts"
 *                 grade_level: 12
 *                 status: "active"
 *                 change_log:
 *                   updated_by: "admin"
 *                   notes: "Updated course content and level"
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete course
 *     description: Delete a course and all associated data permanently. Only accessible by administrators.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Course not found"
 *       500:
 *         description: Internal server error - failed to delete course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/courses/{id}/toggle-status:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Toggle course status
 *     description: Toggle course status between active and inactive. Only accessible by administrators.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to toggle status for
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Course status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               course_name: "Introduction to Programming"
 *               grade_level: 10
 *               status: "inactive"
 *               date_create: "2024-01-15T10:30:00Z"
 *               change_log: null
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Course not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
