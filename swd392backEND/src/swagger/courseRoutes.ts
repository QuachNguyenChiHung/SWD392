/**
 * @openapi
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Course ID
 *         course_name:
 *           type: string
 *           description: Course name
 *           maxLength: 255
 *         grade_level:
 *           type: number
 *           description: Grade level (1-12)
 *           minimum: 1
 *           maximum: 12
 *         change_log:
 *           type: object
 *           description: Change log data
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Course creation date
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Course status
 *     CourseCreateRequest:
 *       type: object
 *       required:
 *         - course_name
 *         - grade_level
 *       properties:
 *         course_name:
 *           type: string
 *           description: Course name
 *           maxLength: 255
 *         grade_level:
 *           type: number
 *           description: Grade level (1-12)
 *           minimum: 1
 *           maximum: 12
 *         change_log:
 *           type: object
 *           description: Optional change log data
 *     CourseUpdateRequest:
 *       type: object
 *       properties:
 *         course_name:
 *           type: string
 *           description: Course name
 *           maxLength: 255
 *         grade_level:
 *           type: number
 *           description: Grade level (1-12)
 *           minimum: 1
 *           maximum: 12
 *         change_log:
 *           type: object
 *           description: Change log data
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Course status
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 * 
 * /api/courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a new course
 *     description: Creates a new course with the provided information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreateRequest'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request - validation error or course name already exists
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
 * 
 * /api/courses/{id}:
 *   put:
 *     tags:
 *       - Courses
 *     summary: Update a course
 *     description: Updates an existing course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdateRequest'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request - validation error or course name already exists
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
 *     summary: Delete a course
 *     description: Deletes a course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 * 
 * /api/courses/{id}/toggle-status:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Toggle course status
 *     description: Toggles course status between active and inactive
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
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
 * 
 * /api/courses/search:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Search courses by keyword
 *     description: Search courses by keyword in course name (returns 12 results per page)
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword for course name
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (returns 12 results per page)
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request - keyword is required
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