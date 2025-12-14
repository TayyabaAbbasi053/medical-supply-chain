/**
 * ADMIN FLOW TEST
 * Tests: 1. Admin Login
 *        2. Admin Registration of New User
 */

require("dotenv").config();
const http = require("http");

const API_BASE = "http://localhost:5000/api";

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(API_BASE + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method,
        headers: {
          "Content-Type": "application/json"
        }
      };

      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body
            });
          }
        });
      });

      req.on("error", (err) => {
        console.log("Request error:", err.message);
        reject(err);
      });
      
      if (data) req.write(JSON.stringify(data));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function testAdminFlow() {
  console.log("🧪 ADMIN FLOW TEST\n");

  try {
    // Test 1: Admin Login
    console.log("1️⃣  Testing Admin Login...");
    const loginRes = await makeRequest("POST", "/admin/login", {
      email: "sameenumar29@gmail.com",
      password: "Sam29@123"
    });

    if (loginRes.status === 200) {
      console.log("✅ Admin login successful!");
      console.log(`   Admin: ${loginRes.data.admin.name}`);
      console.log(`   Email: ${loginRes.data.admin.email}`);
    } else {
      console.log("❌ Admin login failed!");
      console.log(`   Status: ${loginRes.status}`);
      console.log(`   Error: ${loginRes.data.error || JSON.stringify(loginRes.data)}`);
      process.exit(1);
    }

    // Test 2: Register New User
    console.log("\n2️⃣  Testing User Registration...");
    const regRes = await makeRequest("POST", "/admin/register-user", {
      name: "Test Manufacturer",
      email: "test.mfg@hospital.com",
      role: "Manufacturer",
      password: "Test@123",
      adminEmail: "sameenumar29@gmail.com"
    });

    if (regRes.status === 201 || regRes.status === 200) {
      console.log("✅ User registration successful!");
      console.log(`   Message: ${regRes.data.message}`);
      console.log(`   User: ${regRes.data.user.name}`);
      console.log(`   Email: ${regRes.data.user.email}`);
      console.log(`   Role: ${regRes.data.user.role}`);
    } else {
      console.log("❌ User registration failed!");
      console.log(`   Status: ${regRes.status}`);
      console.log(`   Error: ${regRes.data.error || JSON.stringify(regRes.data)}`);
      process.exit(1);
    }

    console.log("\n✅ ALL TESTS PASSED!");
    console.log("\n📋 SUMMARY:");
    console.log("   - Admin login works ✓");
    console.log("   - User registration works ✓");
    console.log("   - Admin can create Manufacturers ✓");
    process.exit(0);

  } catch (error) {
    console.error("❌ Test error:", error.message);
    process.exit(1);
  }
}

// Wait a bit for server to be ready, then test
setTimeout(testAdminFlow, 2000);
