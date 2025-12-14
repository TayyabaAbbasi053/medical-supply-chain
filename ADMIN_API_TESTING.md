# 🧪 Admin API Testing Guide

## Testing Tools
- **Postman** - GUI for API testing
- **curl** - Command line tool
- **Thunder Client** - VS Code extension
- **Insomnia** - API client

---

## 1️⃣ Create Admin Account (One-time Setup)

### Using curl:
```bash
curl -X POST http://localhost:5000/api/admin/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hospital Administrator",
    "email": "admin@hospital.com",
    "password": "SecurePass@2025",
    "securityQuestion": "What is your favorite color?",
    "securityAnswer": "blue",
    "adminSecret": "hospital-admin-secret-key-2025"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "admin": {
    "name": "Hospital Administrator",
    "email": "admin@hospital.com",
    "role": "Admin"
  }
}
```

### Using Postman:
```
Method: POST
URL: http://localhost:5000/api/admin/register-admin
Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "Hospital Administrator",
  "email": "admin@hospital.com",
  "password": "SecurePass@2025",
  "securityQuestion": "What is your favorite color?",
  "securityAnswer": "blue",
  "adminSecret": "hospital-admin-secret-key-2025"
}
```

---

## 2️⃣ Admin Login

### Using curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "SecurePass@2025"
  }'
```

### Response (Step 1 - OTP sent):
```json
{
  "success": true,
  "message": "OTP sent to email",
  "email": "admin@hospital.com"
}
```

### Verify OTP (Step 2):
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "otp": "123456"  # Check your email for actual OTP
  }'
```

### Response (Step 2):
```json
{
  "success": true,
  "message": "OTP verified",
  "question": "What is your favorite color?"
}
```

### Verify Security Question (Step 3):
```bash
curl -X POST http://localhost:5000/api/auth/verify-question \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "answer": "blue"
  }'
```

### Response (Step 3 - Success):
```json
{
  "success": true,
  "message": "3FA Authentication Successful",
  "role": "Admin"
}
```

---

## 3️⃣ Register Single User

### Using curl:
```bash
curl -X POST http://localhost:5000/api/admin/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin",
    "name": "Ramesh Singh",
    "email_new": "ramesh@manufacturer.com",
    "role_new": "Manufacturer",
    "securityQuestion": "What is your pet name?",
    "securityAnswer": "Buddy"
  }'
```

**Note:** The request body has:
- `email` & `role` from admin (authentication)
- `name`, `email`, `role`, `securityQuestion`, `securityAnswer` for new user

### Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully and credentials sent to email",
  "user": {
    "name": "Ramesh Singh",
    "email": "ramesh@manufacturer.com",
    "role": "Manufacturer",
    "registeredBy": "admin@hospital.com"
  }
}
```

---

## 4️⃣ Bulk Register Users

### Using curl:
```bash
curl -X POST http://localhost:5000/api/admin/bulk-register-users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin",
    "users": [
      {
        "name": "John Manufacturer",
        "email": "john@manufacturer.com",
        "role": "Manufacturer",
        "securityQuestion": "Favorite color?",
        "securityAnswer": "red"
      },
      {
        "name": "Sarah Distributor",
        "email": "sarah@distributor.com",
        "role": "Distributor",
        "securityQuestion": "Pet name?",
        "securityAnswer": "Max"
      },
      {
        "name": "Mike Pharmacist",
        "email": "mike@pharmacy.com",
        "role": "Pharmacist",
        "securityQuestion": "Hometown?",
        "securityAnswer": "Delhi"
      }
    ]
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Bulk registration completed. 3 succeeded, 0 failed",
  "results": {
    "success": [
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
    ],
    "failed": []
  }
}
```

---

## 5️⃣ Get All Users

### Using curl:
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "total": 4,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Hospital Administrator",
      "email": "admin@hospital.com",
      "role": "Admin",
      "registeredBy": null,
      "createdAt": "2025-12-15T10:30:00Z",
      "registrationStatus": "active"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Manufacturer",
      "email": "john@manufacturer.com",
      "role": "Manufacturer",
      "registeredBy": "admin@hospital.com",
      "createdAt": "2025-12-15T10:35:00Z",
      "registrationStatus": "active"
    },
    // ... more users
  ]
}
```

---

## 6️⃣ Filter Users by Role

### Manufacturers:
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=Manufacturer" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin"
  }'
```

### Distributors:
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=Distributor" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin"
  }'
```

### Pharmacists:
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=Pharmacist" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin"
  }'
```

---

## 7️⃣ Update User Role

### Change manufacturer to distributor:
```bash
curl -X PUT http://localhost:5000/api/admin/users/john@manufacturer.com/role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin",
    "role_new": "Distributor"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "User role updated to Distributor",
  "user": {
    "name": "John Manufacturer",
    "email": "john@manufacturer.com",
    "role": "Distributor",
    "registeredBy": "admin@hospital.com"
  }
}
```

---

## 8️⃣ Delete User

### Using curl:
```bash
curl -X DELETE http://localhost:5000/api/admin/users/john@manufacturer.com \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "User john@manufacturer.com has been deleted"
}
```

---

## ❌ Error Testing

### Invalid Admin Secret:
```bash
curl -X POST http://localhost:5000/api/admin/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fake Admin",
    "email": "fake@hospital.com",
    "password": "Password123!",
    "securityQuestion": "Color?",
    "securityAnswer": "red",
    "adminSecret": "wrong-secret-key"
  }'
```

**Response:**
```json
{
  "error": "Invalid admin secret key"
}
```

### Non-admin trying to register user:
```bash
curl -X POST http://localhost:5000/api/admin/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@manufacturer.com",
    "role": "Manufacturer",
    "name": "New User",
    "email_new": "newuser@test.com",
    "role_new": "Distributor"
  }'
```

**Response:**
```json
{
  "error": "Only admins can access this resource"
}
```

### Duplicate email:
```bash
curl -X POST http://localhost:5000/api/admin/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "role": "Admin",
    "name": "Another John",
    "email_new": "john@manufacturer.com",  # Already exists!
    "role_new": "Manufacturer"
  }'
```

**Response:**
```json
{
  "error": "Email already registered"
}
```

---

## 🧪 Postman Collection Template

Import this into Postman:

```json
{
  "info": {
    "name": "Medical Supply Chain - Admin APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Admin",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Hospital Admin\",\"email\":\"admin@hospital.com\",\"password\":\"Pass@2025\",\"securityQuestion\":\"Color?\",\"securityAnswer\":\"blue\",\"adminSecret\":\"hospital-admin-secret-key-2025\"}"
        },
        "url": {"raw": "http://localhost:5000/api/admin/register-admin", "protocol": "http", "host": ["localhost"], "port": "5000", "path": ["api", "admin", "register-admin"]}
      }
    },
    {
      "name": "Register Single User",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@hospital.com\",\"role\":\"Admin\",\"name\":\"John Doe\",\"email_new\":\"john@test.com\",\"role_new\":\"Manufacturer\",\"securityQuestion\":\"Pet?\",\"securityAnswer\":\"Buddy\"}"
        },
        "url": {"raw": "http://localhost:5000/api/admin/register-user", "protocol": "http", "host": ["localhost"], "port": "5000", "path": ["api", "admin", "register-user"]}
      }
    }
  ]
}
```

---

## 🔍 Testing Checklist

- [ ] Admin registration with correct secret
- [ ] Admin registration with wrong secret (should fail)
- [ ] Admin login flow (email → OTP → security Q)
- [ ] Register single user
- [ ] Bulk register multiple users
- [ ] View all users
- [ ] Filter by role
- [ ] Update user role
- [ ] Delete user
- [ ] Verify email sending works
- [ ] Non-admin cannot register users
- [ ] Duplicate email registration fails
- [ ] Invalid role registration fails

---

## 📊 Performance Testing

```bash
# Register 100 users (bulk)
# Measure: Response time
# Expected: < 5 seconds

curl -X POST http://localhost:5000/api/admin/bulk-register-users \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","role":"Admin","users":[...100 users...]}'
```

---

**Happy Testing!** 🧪
