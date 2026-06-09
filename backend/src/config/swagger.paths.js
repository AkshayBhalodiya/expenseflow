/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *   parameters:
 *     IdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User registered
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email sent
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset
 */

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email address
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logged out
 */

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: Profile data
 *   put:
 *     tags: [Auth]
 *     summary: Update profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               mobile: { type: string }
 *               currency: { type: string }
 *               timezone: { type: string }
 *               theme: { type: string, enum: [light, dark, system] }
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /auth/avatar:
 *   post:
 *     tags: [Auth]
 *     summary: Upload profile avatar
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 */

/**
 * @swagger
 * /users/export:
 *   get:
 *     tags: [Users]
 *     summary: Export own user data
 *     responses:
 *       200:
 *         description: Exported data
 */

/**
 * @swagger
 * /users/activity:
 *   get:
 *     tags: [Users]
 *     summary: Get activity history
 *     responses:
 *       200:
 *         description: Activity logs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (Admin)
 *     responses:
 *       200:
 *         description: List of users
 */

/**
 * @swagger
 * /users/expenses/all:
 *   get:
 *     tags: [Users]
 *     summary: Get all expenses across users (Admin)
 *     responses:
 *       200:
 *         description: All expenses
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User details
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User deleted
 */

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role (Admin)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Role updated
 */

/**
 * @swagger
 * /expenses:
 *   get:
 *     tags: [Expenses]
 *     summary: List expenses
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of expenses
 *   post:
 *     tags: [Expenses]
 *     summary: Create expense
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               amount: { type: number }
 *               category: { type: string }
 *               date: { type: string, format: date }
 *               paymentMethod: { type: string }
 *               creditCardId: { type: string }
 *               notes: { type: string }
 *               receipt: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Expense created
 */

/**
 * @swagger
 * /expenses/scan-receipt:
 *   post:
 *     tags: [Expenses]
 *     summary: Scan receipt with OCR
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receipt: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: OCR extracted data
 */

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     tags: [Expenses]
 *     summary: Get expense by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Expense details
 *   put:
 *     tags: [Expenses]
 *     summary: Update expense
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               amount: { type: number }
 *               category: { type: string }
 *               receipt: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Expense updated
 *   delete:
 *     tags: [Expenses]
 *     summary: Delete expense
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Expense deleted
 */

/**
 * @swagger
 * /income:
 *   get:
 *     tags: [Income]
 *     summary: List income records
 *     responses:
 *       200:
 *         description: List of income
 *   post:
 *     tags: [Income]
 *     summary: Add income
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               source: { type: string, enum: [salary, freelancing, business, investment, other] }
 *               amount: { type: number }
 *               date: { type: string, format: date }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Income created
 */

/**
 * @swagger
 * /income/{id}:
 *   put:
 *     tags: [Income]
 *     summary: Update income
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Income updated
 *   delete:
 *     tags: [Income]
 *     summary: Delete income
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Income deleted
 */

/**
 * @swagger
 * /emi:
 *   get:
 *     tags: [EMI]
 *     summary: List all EMIs/loans
 *     responses:
 *       200:
 *         description: List of EMIs
 *   post:
 *     tags: [EMI]
 *     summary: Create EMI
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loanName: { type: string }
 *               totalAmount: { type: number }
 *               emiAmount: { type: number }
 *               interestRate: { type: number }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               totalInstallments: { type: integer }
 *     responses:
 *       201:
 *         description: EMI created
 */

/**
 * @swagger
 * /emi/dashboard:
 *   get:
 *     tags: [EMI]
 *     summary: EMI dashboard stats
 *     responses:
 *       200:
 *         description: EMI dashboard KPIs
 */

/**
 * @swagger
 * /emi/{id}:
 *   put:
 *     tags: [EMI]
 *     summary: Update EMI
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: EMI updated
 *   delete:
 *     tags: [EMI]
 *     summary: Delete EMI
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: EMI deleted
 */

/**
 * @swagger
 * /emi/{id}/pay:
 *   post:
 *     tags: [EMI]
 *     summary: Mark EMI installment as paid
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: EMI payment recorded
 */

/**
 * @swagger
 * /credit-cards:
 *   get:
 *     tags: [Credit Cards]
 *     summary: List credit cards
 *     responses:
 *       200:
 *         description: List of cards
 *   post:
 *     tags: [Credit Cards]
 *     summary: Add credit card
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardName: { type: string }
 *               bankName: { type: string }
 *               lastFourDigits: { type: string }
 *               creditLimit: { type: number }
 *               billingCycleDay: { type: integer }
 *               paymentDueDay: { type: integer }
 *               color: { type: string }
 *     responses:
 *       201:
 *         description: Card created
 */

/**
 * @swagger
 * /credit-cards/dashboard:
 *   get:
 *     tags: [Credit Cards]
 *     summary: Credit cards dashboard stats
 *     responses:
 *       200:
 *         description: Cards dashboard KPIs
 */

/**
 * @swagger
 * /credit-cards/{id}:
 *   put:
 *     tags: [Credit Cards]
 *     summary: Update credit card
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Card updated
 *   delete:
 *     tags: [Credit Cards]
 *     summary: Delete credit card
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Card deleted
 */

/**
 * @swagger
 * /credit-cards/{id}/payments:
 *   get:
 *     tags: [Credit Cards]
 *     summary: Get card payment history
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Payment history
 */

/**
 * @swagger
 * /credit-cards/{id}/transactions:
 *   get:
 *     tags: [Credit Cards]
 *     summary: Get card expense transactions
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Card transactions
 */

/**
 * @swagger
 * /credit-cards/{id}/pay:
 *   post:
 *     tags: [Credit Cards]
 *     summary: Pay credit card bill
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               paymentDate: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Payment recorded
 */

/**
 * @swagger
 * /household:
 *   get:
 *     tags: [Household]
 *     summary: Get my household info
 *     responses:
 *       200:
 *         description: Household details with members
 *   post:
 *     tags: [Household]
 *     summary: Create household/home
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Our Home }
 *     responses:
 *       201:
 *         description: Household created
 *   put:
 *     tags: [Household]
 *     summary: Update household name (owner)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Household updated
 */

/**
 * @swagger
 * /household/join:
 *   post:
 *     tags: [Household]
 *     summary: Join household with invite code
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteCode: { type: string }
 *     responses:
 *       200:
 *         description: Joined household
 */

/**
 * @swagger
 * /household/leave:
 *   post:
 *     tags: [Household]
 *     summary: Leave current household
 *     responses:
 *       200:
 *         description: Left household
 */

/**
 * @swagger
 * /household/members/{memberId}:
 *   delete:
 *     tags: [Household]
 *     summary: Remove member from household (owner)
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Member removed
 */

/**
 * @swagger
 * /household/dashboard:
 *   get:
 *     tags: [Household]
 *     summary: Combined household dashboard
 *     responses:
 *       200:
 *         description: Combined KPIs and member breakdown
 */

/**
 * @swagger
 * /household/expenses:
 *   get:
 *     tags: [Household]
 *     summary: All members expenses
 *     responses:
 *       200:
 *         description: Combined expenses list
 */

/**
 * @swagger
 * /household/income:
 *   get:
 *     tags: [Household]
 *     summary: All members income
 *     responses:
 *       200:
 *         description: Combined income list
 */

/**
 * @swagger
 * /household/credit-cards:
 *   get:
 *     tags: [Household]
 *     summary: All members credit cards
 *     responses:
 *       200:
 *         description: Combined cards list
 */

/**
 * @swagger
 * /household/emis:
 *   get:
 *     tags: [Household]
 *     summary: All members EMIs
 *     responses:
 *       200:
 *         description: Combined EMIs list
 */

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: List budgets
 *     responses:
 *       200:
 *         description: List of budgets
 *   post:
 *     tags: [Budgets]
 *     summary: Create budget
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category: { type: string }
 *               amount: { type: number }
 *               month: { type: integer }
 *               year: { type: integer }
 *     responses:
 *       201:
 *         description: Budget created
 */

/**
 * @swagger
 * /budgets/current:
 *   get:
 *     tags: [Budgets]
 *     summary: Current month budget summary
 *     responses:
 *       200:
 *         description: Budget usage summary
 */

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Update budget
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Budget updated
 *   delete:
 *     tags: [Budgets]
 *     summary: Delete budget
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Budget deleted
 */

/**
 * @swagger
 * /goals:
 *   get:
 *     tags: [Goals]
 *     summary: List savings goals
 *     responses:
 *       200:
 *         description: List of goals
 *   post:
 *     tags: [Goals]
 *     summary: Create savings goal
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               targetAmount: { type: number }
 *               deadline: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Goal created
 */

/**
 * @swagger
 * /goals/{id}:
 *   put:
 *     tags: [Goals]
 *     summary: Update goal
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Goal updated
 *   delete:
 *     tags: [Goals]
 *     summary: Delete goal
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Goal deleted
 */

/**
 * @swagger
 * /goals/{id}/add:
 *   post:
 *     tags: [Goals]
 *     summary: Add amount to savings goal
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *     responses:
 *       200:
 *         description: Amount added to goal
 */

/**
 * @swagger
 * /recurring:
 *   get:
 *     tags: [Recurring]
 *     summary: List recurring transactions
 *     responses:
 *       200:
 *         description: List of recurring items
 *   post:
 *     tags: [Recurring]
 *     summary: Create recurring transaction
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [expense, income] }
 *               title: { type: string }
 *               amount: { type: number }
 *               frequency: { type: string, enum: [daily, weekly, monthly, yearly] }
 *               startDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Recurring created
 */

/**
 * @swagger
 * /recurring/{id}:
 *   put:
 *     tags: [Recurring]
 *     summary: Update recurring transaction
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Recurring updated
 *   delete:
 *     tags: [Recurring]
 *     summary: Delete recurring transaction
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Recurring deleted
 */

/**
 * @swagger
 * /recurring/{id}/toggle:
 *   patch:
 *     tags: [Recurring]
 *     summary: Enable or disable recurring transaction
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Recurring toggled
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Dashboard KPIs and charts
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [personal, household]
 *           default: personal
 *     responses:
 *       200:
 *         description: Dashboard data
 */

/**
 * @swagger
 * /analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Analytics insights (growth, ratios)
 *     responses:
 *       200:
 *         description: Analytics data
 */

/**
 * @swagger
 * /analytics/charts:
 *   get:
 *     tags: [Analytics]
 *     summary: Get chart data by type
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [monthly, weekly, daily, category]
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Chart data
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     tags: [Reports]
 *     summary: Generate financial report
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Report data
 */

/**
 * @swagger
 * /reports/export:
 *   get:
 *     tags: [Reports]
 *     summary: Export report (PDF/CSV)
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [pdf, csv] }
 *     responses:
 *       200:
 *         description: Exported file
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
 *     responses:
 *       200:
 *         description: Notifications list
 */

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All marked read
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Marked as read
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Notification deleted
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List expense categories
 *     security: []
 *     responses:
 *       200:
 *         description: Categories list
 *   post:
 *     tags: [Categories]
 *     summary: Create category (Admin)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category (Admin)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category (Admin)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Category deleted
 */

export default {};
