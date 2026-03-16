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
