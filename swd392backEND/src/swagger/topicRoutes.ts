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
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Topic name
 *           example: "Variables and Data Types"
 *         description:
 *           type: string
 *           description: Topic description
 *           example: "Learn about variables and basic data types"
 *         course_id:
 *           type: string
 *           description: Course ID this topic belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         order:
 *           type: integer
 *           description: Topic order in the course
 *           example: 1
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Topic creation date
 *     TopicInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - course_id
 *       properties:
 *         name:
 *           type: string
 *           example: "Variables and Data Types"
 *         description:
 *           type: string
 *           example: "Learn about variables and basic data types"
 *         course_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         order:
 *           type: integer
 *           example: 1
 */

/**
 * @openapi
 * /api/topics:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Create new topic
 *     description: Create a new topic (admin only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicInput'
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @openapi
 * /api/topics/search:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Search topics by keyword
 *     description: Search topics by keyword in name or description
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword
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
 *     responses:
 *       200:
 *         description: List of topics matching the keyword
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 *                 total:
 *                   type: integer
 *       400:
 *         description: Bad request
 */

/**
 * @openapi
 * /api/topics/{id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Get topic by ID
 *     description: Retrieve a specific topic by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       404:
 *         description: Topic not found
 *   put:
 *     tags:
 *       - Topics
 *     summary: Update topic
 *     description: Update topic information (admin only)
 *     security:
 *       - cookieAuth: []
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
 *             $ref: '#/components/schemas/TopicInput'
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Topic not found
 */

/**
 * @openapi
 * /api/topics/course/{course_id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Get topics by course
 *     description: Retrieve all topics from a specific course
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
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
 *     responses:
 *       200:
 *         description: List of topics in the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Topic'
 *                 total:
 *                   type: integer
 *       404:
 *         description: Course not found
 */
