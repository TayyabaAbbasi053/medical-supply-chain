# 🏥 Medical Supply Chain Information Security System

## 📖 Overview

The Medical Supply Chain Information Security System is a secure, cryptography-driven solution designed to combat counterfeit medicines and improve transparency across the pharmaceutical supply chain.

The system enables secure tracking of medicines from **Manufacturer → Distributor → Pharmacist → Patient** while ensuring confidentiality, integrity, authenticity, and traceability through multiple layers of security mechanisms.



## 🎯 Objectives

* Ensure medicine authenticity through QR-code verification.
* Protect sensitive information using AES-256 encryption.
* Detect tampering using SHA-256 hashing and hash-chaining.
* Enforce secure access using Three-Factor Authentication (3FA).
* Maintain accountability through Role-Based Access Control (RBAC).
* Provide end-to-end traceability across the supply chain.


## ✨ Features

### 🔐 Three-Factor Authentication (3FA)

* Username & Password
* Email-based OTP Verification
* Security Question Verification

### 👥 Role-Based Access Control (RBAC)

* Manufacturer
* Distributor
* Pharmacist
* Patient

### 🛡️ Security Mechanisms

* AES-256 Encryption
* SHA-256 Hashing
* HMAC-SHA256 Signatures
* Blockchain-inspired Hash-Chaining
* QR Code Verification

### 📦 Supply Chain Management

* Batch Creation
* Inventory Management
* Batch Dispatching
* Medicine Verification
* Medicine Dispensing
* Patient Authentication Checks


## 🏗️ System Workflow

1. Manufacturer creates a medicine batch.
2. Batch information is encrypted and hashed.
3. QR code is generated for the batch.
4. Distributor verifies and receives the batch.
5. Distributor dispatches medicines securely.
6. Pharmacist verifies chain integrity before dispensing.
7. Patient scans QR code to verify medicine authenticity.



## 🔒 Security Architecture

### AES-256 Encryption

Protects sensitive batch information and confidential data.

### SHA-256 Hashing

Generates cryptographic fingerprints to ensure data integrity.

### Hash-Chaining

Links supply-chain events together, making unauthorized modifications immediately detectable.

### HMAC Signatures

Ensures event authenticity and prevents repudiation.

### QR Code Verification

Provides instant physical-to-digital verification of medicine authenticity.



## 💻 Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Security & Utilities

* bcrypt
* crypto-js
* dotenv
* nodemailer
* cors



## 🚀 Installation

### Clone Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and configure:

```env
MONGODB_URI=your_database_url
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
AES_SECRET_KEY=your_secret_key
```

### Start Server

```bash
npm start
```

Server will start on the configured port.

---

## 📂 Modules

### Manufacturer Module

* Batch creation
* Genesis event generation
* QR code generation
* Encryption and hashing

### Distributor Module

* Batch verification
* Inventory management
* Dispatch event creation

### Pharmacist Module

* Chain verification
* Medicine dispensing
* Event authentication

### Patient Module

* QR verification
* Authenticity validation
* Read-only access

---

## 🔮 Future Enhancements

* Blockchain Integration
* IoT-based Environmental Monitoring
* Mobile Applications (Android & iOS)
* AI-based Anomaly Detection
* Regulatory Compliance Dashboards

---

## 👨‍💻 Team Members

* Tayyaba Abbasi — Patient Dashboard, 3FA, Verification Flow
* Sameen Umar — Manufacturer Module, Cryptography, System Integration
* Muhammad Haris Abdullah — Distributor & Pharmacist Modules, Database Design

---

## 📜 License

This project was developed for academic and educational purposes.

