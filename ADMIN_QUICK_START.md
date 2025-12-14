# 🎯 QUICK START: Admin System Setup

## ✅ What Was Created

### Backend Changes:
- ✅ Added `Admin` role to User model
- ✅ Created `/api/admin` routes with endpoints:
  - `POST /register-admin` - Create admin account (with secret key)
  - `POST /register-user` - Register single user
  - `POST /bulk-register-users` - Register multiple users
  - `GET /users` - View all users
  - `DELETE /users/:email` - Delete user
  - `PUT /users/:email/role` - Update user role
- ✅ Added `requireAdmin` middleware for role-based access
- ✅ Updated sendEmail utility to support custom emails
- ✅ Updated .env with `ADMIN_SECRET_KEY`

### Frontend Changes:
- ✅ Created Admin.jsx dashboard component
- ✅ Added Admin.css styling
- ✅ Integrated Admin route in App.jsx

### Server Status:
```
✅ Backend: http://localhost:5000
✅ Frontend: http://localhost:5173
✅ MongoDB: Connected
✅ Admin Routes: Loaded
```

---

## 🚀 Step 1: Create First Admin Account

Use **Postman** or **curl** to create the first admin:

**Request:**
```
POST http://localhost:5000/api/admin/register-admin
Content-Type: application/json

{
  "name": "Hospital Admin",
  "email": "admin@hospital.com",
  "password": "AdminPassword123!",
  "securityQuestion": "What is your favorite color?",
  "securityAnswer": "blue",
  "adminSecret": "hospital-admin-secret-key-2025"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "admin": {
    "name": "Hospital Admin",
    "email": "admin@hospital.com",
    "role": "Admin"
  }
}
```

---

## 🎯 Step 2: Login with Admin Account

1. Go to `http://localhost:5173`
2. Click **Login**
3. Enter admin email & password
4. Verify OTP sent to email
5. Answer security question
6. You're logged in!

---

## 🛡️ Step 3: Access Admin Dashboard

After logging in as admin, go to: `http://localhost:5173/admin`

You'll see 3 tabs:

### **Tab 1: Register Single User**
- Fill form with user details
- Automatically generates temp password
- Sends email with credentials
- Click "Register User"

### **Tab 2: Bulk Register**
- Add multiple users (click "+ Add Another User")
- Fill all fields
- Click "Register X Users"
- View success/failure report

### **Tab 3: Manage Users**
- View all registered users
- Filter by role (Manufacturer, Distributor, Pharmacist)
- Delete users
- See registration audit trail

---

## 📋 Example: Register a Manufacturer

1. Go to Admin Dashboard
2. Click "Register Single User" tab
3. Fill form:
   ```
   Full Name: John Singh
   Email: john@manufacturer.com
   Role: Manufacturer
   Security Question: What is your pet's name?
   Security Answer: Fluffy
   ```
4. Click "Register User"
5. ✅ John receives email with temp password

---

## 📧 What John Receives

**Email Subject:** `Welcome to Medical Supply Chain - Manufacturer Account Created`

**Email Body Contains:**
```
Email: john@manufacturer.com
Temporary Password: K9mL2pQ5xR8vW1sT

Login URL: http://localhost:5173
```

---

## 🔐 Step 4: User Flow (e.g., John's First Login)

1. John goes to `http://localhost:5173`
2. Clicks **Login**
3. Enters:
   - Email: `john@manufacturer.com`
   - Password: `K9mL2pQ5xR8vW1sT` (temp)
4. Receives OTP in email → Enters it
5. Answers security question → Verified ✅
6. Now at Manufacturer Dashboard
7. **Important:** Should change password (you may want to add this feature)

---

## 🎯 User Database Structure

Users are now stored with these fields:
```javascript
{
  name: "John Singh",
  email: "john@manufacturer.com",
  role: "Manufacturer",
  registeredBy: "admin@hospital.com",      // Who created this user
  registrationStatus: "active",             // Can be "pending" or "active"
  createdAt: "2025-12-15T10:30:00Z"
}
```

---

## 🔑 Important Notes

✅ **Only admins can register users now**  
✅ **Normal users cannot self-register**  
✅ **All passwords are bcrypt encrypted**  
✅ **Temp passwords are randomly generated**  
✅ **Email credentials are sent securely**  
✅ **Admin secret key protects admin creation**  

---

## 🛠️ Customization

If you want to change the admin secret key:
1. Edit `.env` file
2. Change: `ADMIN_SECRET_KEY=your-new-secret`
3. Restart backend server
4. Use new secret to create admins

---

## 📞 Testing the Endpoints

### Create Admin:
```bash
curl -X POST http://localhost:5000/api/admin/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@admin.com",
    "password": "Password123!",
    "securityQuestion": "Color?",
    "securityAnswer": "red",
    "adminSecret": "hospital-admin-secret-key-2025"
  }'
```

### Register User (need auth):
```bash
curl -X POST http://localhost:5000/api/admin/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin",
    "name": "Jane Distributor",
    "email": "jane@distributor.com",
    "role": "Distributor",
    "securityQuestion": "Pet name?",
    "securityAnswer": "Buddy"
  }'
```

### Get All Users:
```bash
curl http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin"
  }'
```

---

## ✨ Features Summary

| Feature | Status |
|---------|--------|
| Admin registration (with secret) | ✅ Done |
| Single user registration | ✅ Done |
| Bulk user registration | ✅ Done |
| Email credentials sending | ✅ Done |
| User management dashboard | ✅ Done |
| Delete users | ✅ Done |
| Update user roles | ✅ Done |
| Filter users by role | ✅ Done |
| Registration audit trail | ✅ Done |
| Admin-only access control | ✅ Done |

---

## 🎓 Next Steps (Optional Enhancements)

You can add later:
1. Password reset endpoint
2. Resend credentials email
3. Bulk CSV import
4. Email templates
5. Activity logs
6. Two-factor authentication for admin

---

**System is ready to use! Go create your first admin account.** 🚀
