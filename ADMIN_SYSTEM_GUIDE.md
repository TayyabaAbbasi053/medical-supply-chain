# 🛡️ ADMIN USER REGISTRATION SYSTEM

## Overview
The system now supports an **Admin role** who can register users for the three supply chain roles: **Manufacturer**, **Distributor**, and **Pharmacist**. This prevents open public registration and ensures controlled access.

---

## 🚀 How It Works

### 1. **Admin Setup (One-time)**
First, create an admin account using a secret key:

**Endpoint:** `POST /api/admin/register-admin`

**Request:**
```json
{
  "name": "System Administrator",
  "email": "admin@hospital.com",
  "password": "SecurePassword123!",
  "securityQuestion": "What is your favorite color?",
  "securityAnswer": "blue",
  "adminSecret": "YOUR_ADMIN_SECRET_KEY_FROM_.env"
}
```

**Note:** The `adminSecret` is stored in `.env` as `ADMIN_SECRET_KEY`. Only requests with the correct secret can create admin accounts.

**Update your `.env` file:**
```env
ADMIN_SECRET_KEY=your-super-secret-key-here
```

---

### 2. **Admin Login**
Admin logs in via the normal login page:
1. Enter email & password
2. Verify OTP sent to email
3. Answer security question
4. Access admin dashboard

---

### 3. **Register Single User**
Admin can register one user at a time.

**Endpoint:** `POST /api/admin/register-user`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body (in data):**
```json
{
  "email": "admin@hospital.com",
  "role": "Admin"
}
```

**Form Data:**
```json
{
  "name": "John Doe",
  "email": "john@manufacturer.com",
  "role": "Manufacturer",
  "securityQuestion": "What is your favorite color?",
  "securityAnswer": "blue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully and credentials sent to email",
  "user": {
    "name": "John Doe",
    "email": "john@manufacturer.com",
    "role": "Manufacturer",
    "registeredBy": "admin@hospital.com"
  }
}
```

✅ **Automatic actions:**
- Generates random temporary password
- Sends credentials via email
- User can login with temp password and change it

---

### 4. **Bulk Register Users**
Admin can register multiple users at once.

**Endpoint:** `POST /api/admin/bulk-register-users`

**Request:**
```json
{
  "users": [
    {
      "name": "John Manufacturer",
      "email": "john@manufacturer.com",
      "role": "Manufacturer"
    },
    {
      "name": "Sarah Distributor",
      "email": "sarah@distributor.com",
      "role": "Distributor"
    },
    {
      "name": "Mike Pharmacist",
      "email": "mike@pharmacy.com",
      "role": "Pharmacist"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk registration completed. 3 succeeded, 0 failed",
  "results": {
    "success": [
      { "name": "John Manufacturer", "email": "john@manufacturer.com", "role": "Manufacturer" },
      // ... more
    ],
    "failed": []
  }
}
```

---

### 5. **Manage Users**
Admin can view, filter, and delete users.

**Get All Users:**
```
GET /api/admin/users
```

**Get Users by Role:**
```
GET /api/admin/users?role=Manufacturer
GET /api/admin/users?role=Distributor
GET /api/admin/users?role=Pharmacist
```

**Delete User:**
```
DELETE /api/admin/users/email@example.com
```

**Update User Role:**
```
PUT /api/admin/users/email@example.com/role
Body: { "role": "Distributor" }
```

---

## 🎯 Frontend Admin Dashboard

Access the admin dashboard at: `http://localhost:5173/admin`

### **Features:**

1. **📝 Register Single User Tab**
   - Form to register one user at a time
   - Input: Name, Email, Role, Security Q&A
   - Auto-generates temp password
   - Sends email confirmation

2. **📋 Bulk Register Tab**
   - Add multiple users quickly
   - Dynamic form fields
   - Submit all at once
   - View success/failure report

3. **👥 Manage Users Tab**
   - View all registered users
   - Filter by role
   - Delete users
   - See who registered each user

---

## 📧 Email Credentials System

When a user is registered by admin:

**Email Subject:** `Welcome to Medical Supply Chain - [Role] Account Created`

**Email Contains:**
- ✅ Temporary password (random generated)
- ✅ Login credentials
- ✅ Link to login page
- ✅ Instructions to change password

**Important:** User must change the temporary password on first login.

---

## 🔐 Authentication Flow

### Normal User (Manufacturer/Distributor/Pharmacist):
1. ❌ **Cannot** self-register on `/register` page
2. Admin creates account via admin dashboard
3. Receives email with temp credentials
4. Logs in with temp password → OTP → Security question → Access dashboard

### Admin:
1. Admin account created via `/api/admin/register-admin` with secret key
2. Logs in normally (email → OTP → Security question)
3. Accesses `/admin` dashboard
4. Can manage all users

---

## 🛠️ Setup Instructions

### 1. **Update .env file:**
```env
ADMIN_SECRET_KEY=your-super-secure-secret-key-12345
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. **Create First Admin:**
Use Postman or curl to create the first admin:

```bash
curl -X POST http://localhost:5000/api/admin/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Admin",
    "email": "admin@hospital.com",
    "password": "AdminPassword123!",
    "securityQuestion": "What is your favorite color?",
    "securityAnswer": "blue",
    "adminSecret": "your-super-secure-secret-key-12345"
  }'
```

### 3. **Access Admin Dashboard:**
- Login with admin email/password
- Go to `http://localhost:5173/admin`
- Start registering users!

---

## 📊 User Roles

| Role | Can Create | Can View | Can Manage |
|------|-----------|---------|-----------|
| **Admin** | ✅ All | ✅ All | ✅ Yes |
| **Manufacturer** | ❌ No | 👀 Own batches | ❌ No |
| **Distributor** | ❌ No | 👀 Assigned batches | ❌ No |
| **Pharmacist** | ❌ No | 👀 Assigned batches | ❌ No |
| **Patient** | ❌ No | 👀 Own prescriptions | ❌ No |

---

## 🔒 Security Features

✅ **Temporary Passwords** - Random, secure, must be changed  
✅ **Email Verification** - Credentials sent securely  
✅ **Admin Secret Key** - Only authorized person can create admins  
✅ **Role-Based Access** - Only admins can register users  
✅ **Audit Trail** - `registeredBy` field tracks who created each user  
✅ **Bcrypt Hashing** - All passwords encrypted  

---

## ❓ FAQ

**Q: Can users self-register?**  
A: No. Only admins can create users now.

**Q: What if user forgets temporary password?**  
A: Admin can delete and re-register them, sending new credentials.

**Q: Can an admin change another admin's password?**  
A: Currently no. You need to implement a password reset endpoint.

**Q: Can users change their role?**  
A: Only admins can update user roles.

**Q: How many admins can we have?**  
A: Unlimited. Each needs to be created with the admin secret key.

---

## 📝 Example Workflow

```
1. Hospital IT Admin logs in
   ↓
2. Goes to Admin Dashboard (/admin)
   ↓
3. Clicks "Register Single User"
   ↓
4. Fills form:
   - Name: "Ramesh Singh"
   - Email: "ramesh@pharmaX.com"
   - Role: "Pharmacist"
   - Security Q/A
   ↓
5. Clicks "Register User"
   ↓
6. System:
   ✓ Creates user in database
   ✓ Generates temp password: "A3F4K9L2"
   ✓ Sends email to ramesh@pharmaX.com
   ✓ Shows success message
   ↓
7. Ramesh receives email with:
   - Email: ramesh@pharmaX.com
   - Temp Password: A3F4K9L2
   - Login URL
   ↓
8. Ramesh logs in:
   - Enters email & password
   - Verifies OTP
   - Answers security question
   - Accesses Pharmacy dashboard
   ↓
9. First thing: Changes password from temp → personal password
```

---

## 🚀 Next Steps

1. Create admin account using the secret key
2. Share admin dashboard link with hospital IT
3. Have admin register all Manufacturers, Distributors, Pharmacists
4. Users login with their temporary password
5. Users change password on first login

---

**Created for Medical Supply Chain Security System**
