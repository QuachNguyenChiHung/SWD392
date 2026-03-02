/**
 * @openapi
 * components:
 *   schemas:
 *     Topic:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Topic ID
 *         course_id:
 *           type: string
 *           description: Course ID
 *         title:
 *           type: string
 *           description: Topic title
 *           maxLength: 255
 *         description:
 *           type: string
 *           description: Topic description
 *         content_json:
 *           type: object
 *           description: Topic content in JSON format (optional)
 *     CreateTopicRequest:
 *       type: object
 *       required:
 *         - course_id
 *         - title
 *       properties:
 *         course_id:
 *           type: string
 *           description: Course ID
 *         title:
 *           type: string
 *           description: Topic title
 *           maxLength: 255
 *         description:
 *           type: string
 *           description: Topic description
 *         content_json:
 *           type: object
 *           description: Topic content in JSON format (optional)
 *     UpdateTopicRequest:
 *       type: object
 *       properties:
 *         course_id:
 *           type: string
 *           description: Course ID
 *         title:
 *           type: string
 *           description: Topic title
 *           maxLength: 255
 *         description:
 *           type: string
 *           description: Topic description
 *         content_json:
 *           type: object
 *           description: Topic content in JSON format (optional)
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         message:
 *           type: string
 *           description: Detailed error message
 *
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: Authorization
 *       description: Signed cookie containing Bearer token
 *
 * /api/topics:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Create a new topic
 *     security:
 *       - cookieAuth: []
 *     description: Create a new topic (Admin only - requires Admin entity with authorization_lvl: 2)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTopicRequest'
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request - Course not found or title already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only (requires authorization_lvl: 2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/topics/{id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Get topic by ID
 *     description: Retrieve a specific topic by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Topics
 *     summary: Update topic
 *     security:
 *       - cookieAuth: []
 *     description: Update an existing topic (Admin only - requires Admin entity with authorization_lvl: 2)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTopicRequest'
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request - Course not found or title already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin only (requires authorization_lvl: 2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/topics/search:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Search topics by keyword
 *     description: Search topics by keyword in title or description (returns 12 results per page)
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword for title or description
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
 *                 $ref: '#/components/schemas/Topic'
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
 *
 * /api/topics/course/{course_id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Get topics by course
 *     description: Get all topics from a specific course (returns 12 results per page)
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
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
 *         description: List of topics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
