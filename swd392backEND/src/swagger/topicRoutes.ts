/**
 * @openapi
 * components:
 *   schemas:
 *     TopicCreateInput:
 *       type: object
 *       required:
 *         - title
 *         - course_id
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Title of the topic
 *           example: "Variables and Data Types"
 *         description:
 *           type: string
 *           description: Optional description of the topic
 *           example: "Learn about variables and basic data types in programming"
 *         course_id:
 *           type: string
 *           description: ID of the course this topic belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         content_json:
 *           type: object
 *           description: Optional JSON content structure for the topic
 *           example:
 *             sections: []
 *             learning_objectives: []
 *     TopicUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Updated title of the topic
 *           example: "Advanced Variables and Data Types"
 *         description:
 *           type: string
 *           description: Updated description of the topic
 *           example: "Advanced concepts of variables and data types"
 *         course_id:
 *           type: string
 *           description: Updated course ID if moving topic to different course
 *           example: "507f1f77bcf86cd799439013"
 *         content_json:
 *           type: object
 *           description: Updated JSON content structure
 *           example:
 *             sections: ["Introduction", "Advanced Concepts"]
 *             learning_objectives: ["Understand variables", "Master data types"]
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Validation error or resource not found"
 *     CourseWithTopics:
 *       type: object
 *       properties:
 *         course:
 *           type: object
 *           description: Course data with nested topics array
 *           properties:
 *             _id:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             course_name:
 *               type: string
 *               example: "Introduction to Programming"
 *             grade_level:
 *               type: integer
 *               example: 10
 *             status:
 *               type: string
 *               enum: [active, inactive]
 *               example: "active"
 *             date_create:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00Z"
 *             change_log:
 *               type: object
 *               nullable: true
 *               example: null
 *             topics:
 *               type: array
 *               description: Array of topics belonging to this course
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 */

/**
 * @openapi
 * /api/topics:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Create a new topic
 *     description: "[Admin] Create a new topic for a course."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicCreateInput'
 *           examples:
 *             basicTopic:
 *               summary: Basic topic creation
 *               value:
 *                 title: "Variables and Data Types"
 *                 course_id: "507f1f77bcf86cd799439012"
 *                 description: "Learn about variables and basic data types"
 *             topicWithContent:
 *               summary: Topic with JSON content
 *               value:
 *                 title: "Functions and Methods"
 *                 course_id: "507f1f77bcf86cd799439012"
 *                 description: "Understanding functions and methods in programming"
 *                 content_json:
 *                   sections: ["Introduction", "Basic Functions", "Advanced Methods"]
 *                   learning_objectives: ["Define functions", "Use parameters", "Return values"]
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Variables and Data Types"
 *               description: "Learn about variables and basic data types"
 *               course_id: "507f1f77bcf86cd799439012"
 *               content_json: null
 *       400:
 *         description: Bad request - validation errors or duplicate topic
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   error: "title is required and must be maximum 255 characters"
 *               duplicateTopic:
 *                 summary: Duplicate topic
 *                 value:
 *                   error: "Topic with this title already exists in the course"
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
 * /api/topics/search:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Search topics by keyword
 *     description: "[Public] Search topics by keyword in title or description with pagination support."
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword to match in title or description
 *         example: "variables"
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
 *         description: Successfully retrieved topics matching the keyword
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 *             example:
 *               - _id: "507f1f77bcf86cd799439011"
 *                 title: "Variables and Data Types"
 *                 description: "Learn about variables and basic data types"
 *                 course_id: "507f1f77bcf86cd799439012"
 *                 course:
 *                   course_name: "Introduction to Programming"
 *                   grade_level: 10
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
 * /api/topics/{id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Get topic by ID
 *     description: "[Public] Retrieve a specific topic by its unique identifier with populated course information."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Successfully retrieved topic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               title: "Variables and Data Types"
 *               description: "Learn about variables and basic data types"
 *               course_id: "507f1f77bcf86cd799439012"
 *               content_json:
 *                 sections: ["Introduction", "Basic Concepts"]
 *                 learning_objectives: ["Understand variables", "Use data types"]
 *               course:
 *                 course_name: "Introduction to Programming"
 *                 grade_level: 10
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Topic not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Topics
 *     summary: Update topic
 *     description: "[Admin] Update topic information including title, description, and content."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TopicUpdateInput'
 *           examples:
 *             titleUpdate:
 *               summary: Update title only
 *               value:
 *                 title: "Advanced Variables and Data Types"
 *             fullUpdate:
 *               summary: Update all fields
 *               value:
 *                 title: "Advanced Variables and Data Types"
 *                 description: "Deep dive into advanced variable concepts and complex data types"
 *                 content_json:
 *                   sections: ["Introduction", "Advanced Concepts", "Best Practices"]
 *                   learning_objectives: ["Master variables", "Understand complex types", "Apply best practices"]
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Topic'
 *       400:
 *         description: Bad request - validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   error: "title must be maximum 255 characters"
 *               duplicateTitle:
 *                 summary: Duplicate title
 *                 value:
 *                   error: "Topic with this title already exists in the course"
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
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Topic not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/topics/{id}:
 *   delete:
 *     tags:
 *       - Topics
 *     summary: Delete a topic with cascade deletion
 *     description: |
 *       [Admin] Delete a topic and all related entities using atomic transaction.
 *       
 *       This endpoint performs a complete cascade deletion including:
 *       - All ClassMaterials associated with the topic
 *       - All content entities (Quiz, File, Slide, Render2D) via ClassMaterial
 *       - All AI-generated content (AiContent, AiRequest)
 *       - All Feedback related to the materials
 *       - All ProgressClassMaterial records
 *       - The Topic itself
 *       
 *       Uses MongoDB transactions for atomicity - either all entities are deleted or none are.
 *       Returns detailed deletion counts for auditing and verification.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the topic to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Topic deleted successfully with detailed counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Topic deleted successfully"
 *                 deletedCounts:
 *                   type: object
 *                   description: Breakdown of deleted entities by type
 *                   properties:
 *                     topics:
 *                       type: integer
 *                       example: 1
 *                     classMaterials:
 *                       type: integer
 *                       example: 5
 *                     progressClassMaterial:
 *                       type: integer
 *                       example: 12
 *                     feedback:
 *                       type: integer
 *                       example: 8
 *                     quizzes:
 *                       type: integer
 *                       example: 2
 *                     questions:
 *                       type: integer
 *                       example: 15
 *                     quizAttempts:
 *                       type: integer
 *                       example: 23
 *                     results:
 *                       type: integer
 *                       example: 23
 *                     files:
 *                       type: integer
 *                       example: 1
 *                     slides:
 *                       type: integer
 *                       example: 2
 *                     render2d:
 *                       type: integer
 *                       example: 0
 *                     aiContents:
 *                       type: integer
 *                       example: 3
 *                     aiRequests:
 *                       type: integer
 *                       example: 3
 *             examples:
 *               withMixedContent:
 *                 summary: Topic with mixed content types
 *                 value:
 *                   success: true
 *                   message: "Topic deleted successfully"
 *                   deletedCounts:
 *                     topics: 1
 *                     classMaterials: 5
 *                     progressClassMaterial: 12
 *                     feedback: 8
 *                     quizzes: 2
 *                     questions: 15
 *                     quizAttempts: 23
 *                     results: 23
 *                     files: 1
 *                     slides: 2
 *                     render2d: 0
 *                     aiContents: 3
 *                     aiRequests: 3
 *               withAIContent:
 *                 summary: Topic with AI-generated content
 *                 value:
 *                   success: true
 *                   message: "Topic deleted successfully"
 *                   deletedCounts:
 *                     topics: 1
 *                     classMaterials: 3
 *                     progressClassMaterial: 6
 *                     feedback: 4
 *                     quizzes: 0
 *                     questions: 0
 *                     quizAttempts: 0
 *                     results: 0
 *                     files: 1
 *                     slides: 2
 *                     render2d: 0
 *                     aiContents: 5
 *                     aiRequests: 5
 *               emptyTopic:
 *                 summary: Topic with no materials
 *                 value:
 *                   success: true
 *                   message: "Topic deleted successfully"
 *                   deletedCounts:
 *                     topics: 1
 *                     classMaterials: 0
 *                     progressClassMaterial: 0
 *                     feedback: 0
 *                     quizzes: 0
 *                     questions: 0
 *                     quizAttempts: 0
 *                     results: 0
 *                     files: 0
 *                     slides: 0
 *                     render2d: 0
 *                     aiContents: 0
 *                     aiRequests: 0
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Authentication required"
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Admin access required"
 *       404:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Topic not found"
 *                 result:
 *                   type: null
 *                   example: null
 *       500:
 *         description: Transaction failed - rollback occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "delete_failed"
 *                 details:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Transaction failed"
 */

/**
 * @openapi
 * /api/topics/course/{course_id}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Get topics by course
 *     description: "[Public] Retrieve course information with all its topics in a flattened structure with pagination support."
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to filter topics by
 *         example: "507f1f77bcf86cd799439012"
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
 *         description: Successfully retrieved course with nested topics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseWithTopics'
 *             example:
 *               course:
 *                 _id: "507f1f77bcf86cd799439012"
 *                 course_name: "Introduction to Programming"
 *                 grade_level: 10
 *                 status: "active"
 *                 date_create: "2024-01-15T10:30:00Z"
 *                 change_log: null
 *                 topics:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     title: "Variables and Data Types"
 *                     description: "Learn about variables and basic data types"
 *                     course_id: "507f1f77bcf86cd799439012"
 *                     content_json:
 *                       sections: ["Introduction", "Basic Concepts"]
 *                       learning_objectives: ["Understand variables", "Use data types"]
 *                   - _id: "507f1f77bcf86cd799439014"
 *                     title: "Functions and Methods"
 *                     description: "Understanding functions and methods in programming"
 *                     course_id: "507f1f77bcf86cd799439012"
 *                     content_json: null
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
