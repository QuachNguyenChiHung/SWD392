/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ClaudePromptRequest:
 *       type: object
 *       required:
 *         - prompt
 *       properties:
 *         prompt:
 *           type: string
 *           description: The prompt to send to Claude AI
 *           example: "Explain quantum computing in simple terms"
 *     ClaudeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message from Claude AI
 *           example: "Quantum computing is a type of computation that uses quantum phenomena..."
 *     ChatMessage:
 *       type: object
 *       required:
 *         - content
 *         - sender
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *           example: "Explain the concept of osmosis"
 *         sender:
 *           type: string
 *           enum: [user, ai]
 *           description: Sender of the message. Use 'user' for user messages and 'ai' for assistant messages.
 *     ClaudeHistoryRequest:
 *       type: object
 *       required:
 *         - prompt
 *       properties:
 *         prompt:
 *           type: array
 *           description: Conversation history sent to Claude AI
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *           example:
 *             - content: "Explain the concept of osmosis"
 *               sender: "user"
 */

/**
 * @openapi
 * /api/claude:
 *   post:
 *     tags:
 *       - Claude AI
 *     summary: Send prompt to Claude AI
 *     description: "[Public] Send a text prompt to the Claude AI model and receive a generated response."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaudePromptRequest'
 *     responses:
 *       200:
 *         description: Successful response from Claude AI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaudeResponse'
 *       400:
 *         description: Bad request - prompt is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Prompt is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something broke!"
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ClaudeCreateQuizRequest:
 *       type: object
 *       required:
 *         - topicTitle
 *       properties:
 *         topicTitle:
 *           type: string
 *           description: Title/topic for the quiz
 *           example: "Photosynthesis basics"
 *         topicDescription:
 *           type: string
 *           description: Optional longer description or context
 *           example: "Fundamentals of photosynthesis for middle school"
 *         count:
 *           type: integer
 *           description: Total number of questions to generate
 *           example: 5
 *         mcCount:
 *           type: integer
 *           description: Number of multiple-choice questions
 *           example: 5
 *         tfCount:
 *           type: integer
 *           description: Number of true/false questions
 *           example: 0
 *       example:
 *         topicTitle: "Photosynthesis basics"
 *         topicDescription: "Intro to photosynthesis for middle school"
 *         count: 5
 *         mcCount: 5
 *         tfCount: 0
 *     ClaudeCreateSlideRequest:
 *       type: object
 *       required:
 *         - topicTitle
 *       properties:
 *         topicTitle:
 *           type: string
 *           description: Title/topic for the slide deck
 *           example: "Introduction to Cells"
 *         topicDescription:
 *           type: string
 *           description: Optional description or notes for slide context
 *           example: "Basic cell structure and functions"
 *         notes:
 *           type: string
 *           description: Optional additional notes or instructions for the slide content
 *           example: "Emphasize real-world examples and diagrams"
 *       example:
 *         topicTitle: "Introduction to Cells"
 *         topicDescription: "Basic cell structure and functions"
 *         notes: "Include diagrams of plant and animal cells"
 */

/**
 * @openapi
 * /api/teacher/ai-create-quiz:
 *   post:
 *     tags:
 *       - Claude AI
 *     summary: Generate a teacher-editable quiz using AI (Teacher Only)
 *     description: "[Teacher Only] Generate a teacher-editable quiz JSON object from a topic. Requires teacher authentication."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaudeCreateQuizRequest'
 *     responses:
 *       200:
 *         description: AI-generated quiz JSON string returned in `message` field
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaudeResponse'
 *             examples:
 *               quizExample:
 *                 summary: Example message payload containing a quiz JSON string
 *                 value:
 *                   message: '{"title":"Photosynthesis basics","type":"standard","keyword":null,"questions":[{"id":"q1","content":"What is photosynthesis?","type":"multiple-choice","options":["Process by which plants make food","Process by which animals eat","Method of respiration"],"correctAnswer":"Process by which plants make food","editable":true}]}'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "topicTitle is required"
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - teacher role required
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/teacher/ai-create-pdf:
 *   post:
 *     tags:
 *       - Claude AI
 *     summary: Generate a PDF document using AI (Teacher Only)
 *     description: "[Teacher Only] Generate an HTML document via AI and return it as a downloadable PDF. Requires teacher authentication."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaudeCreateSlideRequest'
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - teacher role required
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/teacher/ai-create-slide:
 *   post:
 *     tags:
 *       - Claude AI
 *     summary: Generate a PPTX slide deck using AI (Teacher Only)
 *     description: "[Teacher Only] Generate a slide presentation (requested as JSON by the AI) and return it as a downloadable PPTX. Requires teacher authentication. You may provide optional `notes` to guide content."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaudeCreateSlideRequest'
 *     responses:
 *       200:
 *         description: PPTX file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.presentationml.presentation:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - teacher role required
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/teacher/ai-chad:
 *   post:
 *     tags:
 *       - Claude AI
 *     summary: Send prompt to Claude AI with History (Teacher Only)
 *     description: "[Teacher Only] Send a request body containing a prompt history array to the Claude AI model and receive a generated response. Requires teacher authentication."
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaudeHistoryRequest'
 *     responses:
 *       200:
 *         description: Successful response from Claude AI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaudeResponse'
 *       400:
 *         description: Bad request - prompt is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Prompt is required"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied. Teacher role required."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something broke!"
 */
