/**
 * @openapi
 * components:
 *   schemas:
 *     TeacherRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         user_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         full_name:
 *           type: string
 *           maxLength: 255
 *           example: "Alice Nguyen"
 *         email:
 *           type: string
 *           format: email
 *           example: "alice@example.com"
 *         credential:
 *           type: string
 *           nullable: true
 *           maxLength: 1000
 *           example: "MSc Computer Science, 5 years teaching experience"
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: URLs of supporting documents (excluded from list view)
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: "pending"
 *         processed_by:
 *           type: string
 *           nullable: true
 *           description: Admin user ID who processed the request
 *         processed_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         reason:
 *           type: string
 *           nullable: true
 *           description: Rejection reason (if rejected)
 *         created_at:
 *           type: string
 *           format: date-time
 *     TeacherRequestListResponse:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 12
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TeacherRequest'
 *     ProcessTeacherRequestInput:
 *       type: object
 *       required:
 *         - action
 *       properties:
 *         action:
 *           type: string
 *           enum: [approve, reject]
 *           example: "approve"
 *         reason:
 *           type: string
 *           maxLength: 1000
 *           description: Required when action is "reject"; optional otherwise
 *           example: "Insufficient credentials provided"
 *     ApproveTeacherRequestResponse:
 *       type: object
 *       properties:
 *         updatedRequest:
 *           $ref: '#/components/schemas/TeacherRequest'
 *         teacherCreated:
 *           type: boolean
 *           description: True if a new Teacher record was created, false if one already existed
 *           example: true
 *     RejectTeacherRequestResponse:
 *       type: object
 *       properties:
 *         updatedRequest:
 *           $ref: '#/components/schemas/TeacherRequest'
 */

/**
 * @openapi
 * /api/admin/teacher-requests:
 *   get:
 *     tags:
 *       - Admin - Teacher Requests
 *     summary: List teacher requests
 *     description: |
 *       [Admin] Retrieve a paginated, filterable list of teacher upgrade requests.
 *       Attachment URLs are excluded from list payloads to keep responses small.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, all]
 *           default: all
 *         description: Filter by request status
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by full name or email (case-insensitive)
 *     responses:
 *       200:
 *         description: Paginated list of teacher requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherRequestListResponse'
 *             example:
 *               total: 3
 *               page: 1
 *               limit: 12
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   user_id: "507f1f77bcf86cd799439012"
 *                   full_name: "Alice Nguyen"
 *                   email: "alice@example.com"
 *                   status: "pending"
 *                   created_at: "2026-03-01T08:00:00Z"
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid status. Must be one of: pending, approved, rejected, all"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */

/**
 * @openapi
 * /api/admin/teacher-requests/{id}:
 *   get:
 *     tags:
 *       - Admin - Teacher Requests
 *     summary: Get teacher request by ID
 *     description: "[Admin] Retrieve full details of a single teacher request, including attachments."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TeacherRequest document ID
 *     responses:
 *       200:
 *         description: Teacher request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherRequest'
 *       404:
 *         description: Teacher request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Teacher request not found"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *   patch:
 *     tags:
 *       - Admin - Teacher Requests
 *     summary: Approve or reject a teacher request
 *     description: |
 *       [Admin] Approve or reject a pending teacher upgrade request.
 *
 *       **Approve flow (atomic transaction):**
 *       1. Sets `status = "approved"`, records `processed_by` and `processed_at`
 *       2. Upserts a `Teacher` document linked to the user (will not duplicate)
 *       3. Updates the `User` document's `role` to `"teacher"`
 *
 *       **Reject flow:**
 *       - Sets `status = "rejected"`, stores optional `reason`
 *
 *       Returns `400` if the request has already been processed (not pending).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TeacherRequest document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessTeacherRequestInput'
 *           examples:
 *             approve:
 *               summary: Approve request
 *               value:
 *                 action: "approve"
 *             reject:
 *               summary: Reject request with reason
 *               value:
 *                 action: "reject"
 *                 reason: "Insufficient credentials provided"
 *     responses:
 *       200:
 *         description: Request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApproveTeacherRequestResponse'
 *                 - $ref: '#/components/schemas/RejectTeacherRequestResponse'
 *             examples:
 *               approved:
 *                 summary: Approved response
 *                 value:
 *                   updatedRequest:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     status: "approved"
 *                     processed_by: "607f1f77bcf86cd799439099"
 *                     processed_at: "2026-03-10T10:00:00Z"
 *                   teacherCreated: true
 *               rejected:
 *                 summary: Rejected response
 *                 value:
 *                   updatedRequest:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     status: "rejected"
 *                     processed_by: "607f1f77bcf86cd799439099"
 *                     processed_at: "2026-03-10T10:00:00Z"
 *                     reason: "Insufficient credentials provided"
 *       400:
 *         description: Invalid input or request already processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *             examples:
 *               alreadyProcessed:
 *                 value:
 *                   error: "This request has already been approved or rejected"
 *               invalidAction:
 *                 value:
 *                   error: "Invalid enum value. Expected 'approve' | 'reject', received 'deny'"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: Unable to identify admin user"
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Teacher request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Teacher request not found"
 */
