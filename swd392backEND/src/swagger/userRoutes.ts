/**
 * @openapi
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: Authorization
 *       description: Signed cookie containing Bearer token
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *           example: "507f1f77bcf86cd799439011"
 *         username:
 *           type: string
 *           description: Username
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *           example: "john@example.com"
 *         role:
 *           type: string
 *           enum: [student, teacher, admin, moderator]
 *           description: User role
 *           example: "student"
 *         status:
 *           type: string
 *           enum: [active, banned, deleted]
 *           description: User status
 *           example: "active"
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *     Teacher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Teacher ID
 *           example: "507f1f77bcf86cd799439012"
 *         user_id:
 *           type: string
 *           description: Linked user ID
 *           example: "507f1f77bcf86cd799439011"
 *         credential:
 *           type: string
 *           nullable: true
 *           description: Cloud link to uploaded teacher credential PDF
 *           example: "https://res.cloudinary.com/demo/raw/upload/v123/files/credential.pdf"
 *         fileName:
 *           type: string
 *           nullable: true
 *           description: Original uploaded credential file name
 *           example: "teaching-certificate.pdf"
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Admin entity ID
 *           example: "507f1f77bcf86cd799439014"
 *         user_id:
 *           type: string
 *           description: Linked user ID
 *           example: "507f1f77bcf86cd799439011"
 *         authorization_lvl:
 *           type: integer
 *           enum: [1, 2]
 *           description: 1 = moderator, 2 = admin
 *           example: 2
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Admin entity creation date
 *     TeacherProfileResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         teacher:
 *           $ref: '#/components/schemas/Teacher'
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *     AdminProfileResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         admin:
 *           $ref: '#/components/schemas/Admin'
 *     UserInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *         role:
 *           type: string
 *           enum: [student, teacher, admin, moderator]
 *           example: "student"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "john_doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "Password123!"
 */

/**
 * @openapi
 * /api/users/search:
 *   get:
 *     tags:
 *       - Users
 *     summary: Search users by keyword
 *     description: "[Admin/Moderator] Search users by keyword in username or email."
 *     security:
 *       - cookieAuth: []
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
 *     responses:
 *       200:
 *         description: List of users matching the keyword
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Moderator access required
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: "[Admin/Moderator] Retrieve paginated list of all users."
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Moderator access required
 *   post:
 *     tags:
 *       - Users
 *     summary: Create new user
 *     description: "[Admin] Create a new user. If role is teacher, upload credentialFile (PDF) to create Teacher entity. If role is admin or moderator, Admin entity is created with authorization level based on role."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin, moderator]
 *                 example: "teacher"
 *               credentialFile:
 *                 type: string
 *                 format: binary
 *                 description: Required when role is teacher. Must be PDF.
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation error, duplicate email, or missing/invalid teacher credential file
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: "[Admin/Moderator] Retrieve a specific user by ID."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Moderator access required
 *       404:
 *         description: User not found
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: "[Admin] Update user information."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin, moderator]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: "[Admin] Delete a user. If user role is teacher or moderator, linked Teacher/Admin entity is also removed. Deleting admin users is forbidden."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot delete admin user
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /api/users/{id}/status:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Toggle user status
 *     description: "[Admin/Moderator] Toggle user status between active and banned."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Moderator access required
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /api/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new user
 *     description: "[Public] Register a new user account."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation error or user already exists
 */

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: "[Public] Authenticate user and receive a cookie token."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: Authorization=token; Path=/; HttpOnly
 *       401:
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user info
 *     description: "[Authenticated] Get the currently authenticated user's profile information."
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Not logged in
 *   patch:
 *     tags:
 *       - Authentication
 *     summary: Update own profile
 *     description: "[Authenticated] Update the currently authenticated user's own profile."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current student/user profile
 *     description: "[Student] Get the authenticated student profile using verifyStudent middleware."
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Students only
 *       404:
 *         description: User profile not found
 */

/**
 * @openapi
 * /api/admin/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current admin profile
 *     description: "[Admin] Get the authenticated admin profile using verifyAdmin middleware."
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProfileResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admins only
 *       404:
 *         description: Admin profile not found
 */

/**
 * @openapi
 * /api/teacher/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current teacher profile
 *     description: "[Teacher] Get the authenticated teacher profile using verifyTeacher middleware."
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Teacher profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherProfileResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teachers only
 *       404:
 *         description: Teacher profile not found
 */

/**
 * @openapi
 * /api/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: "[Authenticated] Clear authentication cookie and log out."
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 */
