/**
 * @openapi
 * components:
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
