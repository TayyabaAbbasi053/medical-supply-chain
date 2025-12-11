// ============================================================
// TEST FILE FOR MANUFACTURER BATCH CREATION
// ============================================================
// Use this file to test the batch creation workflow
// Run with: node test-batch-creation.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/manufacturer';

// ============================================================
// TEST 1: Create a Single Batch
// ============================================================
async function testCreateBatch() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Create Single Batch');
  console.log('='.repeat(60));

  try {
    const payload = {
      batchId: `BATCH-${Date.now()}`,
      medicineName: 'Paracetamol 500mg',
      quantity: 5000,
      manufacturerName: 'GlaxoSmithKline',
      manufacturerId: 'GSK-001',
      manufacturingDate: new Date('2025-12-11').toISOString(),
      expiryDate: new Date('2026-12-11').toISOString(),
      location: 'Mumbai Manufacturing Plant'
    };

    console.log('\n📤 Sending Request:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(`${API_BASE_URL}/create-batch`, payload);

    console.log('\n✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Save batch ID for next tests
    global.testBatchId = response.data.batch.batchId;
    console.log(`\n💾 Saved batch ID for next tests: ${global.testBatchId}`);

    return response.data;
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.response?.data || error.message);
  }
}

// ============================================================
// TEST 2: Create Batch with Missing Fields
// ============================================================
async function testCreateBatchMissingFields() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Create Batch with Missing Fields (Should Fail)');
  console.log('='.repeat(60));

  try {
    const payload = {
      batchId: `BATCH-${Date.now()}`,
      medicineName: 'Ibuprofen 400mg'
      // Missing required fields: quantity, manufacturerName
    };

    console.log('\n📤 Sending Incomplete Request:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(`${API_BASE_URL}/create-batch`, payload);

    console.log('\n❌ Should have failed but succeeded:');
    console.log(response.data);
  } catch (error) {
    console.log('\n✅ Correctly rejected incomplete request:');
    console.log(`Error: ${error.response?.data?.error}`);
  }
}

// ============================================================
// TEST 3: Create Duplicate Batch (Should Fail)
// ============================================================
async function testCreateDuplicateBatch() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Create Duplicate Batch (Should Fail)');
  console.log('='.repeat(60));

  if (!global.testBatchId) {
    console.log('⚠️  Skipping: No batch ID from previous test');
    return;
  }

  try {
    const payload = {
      batchId: global.testBatchId, // Use same ID
      medicineName: 'Amoxicillin 250mg',
      quantity: 3000,
      manufacturerName: 'Cipla Ltd'
    };

    console.log('\n📤 Attempting to create duplicate:');
    console.log(`Batch ID: ${global.testBatchId}`);

    const response = await axios.post(`${API_BASE_URL}/create-batch`, payload);

    console.log('\n❌ Should have failed but succeeded:');
    console.log(response.data);
  } catch (error) {
    console.log('\n✅ Correctly rejected duplicate batch:');
    console.log(`Error: ${error.response?.data?.error}`);
  }
}

// ============================================================
// TEST 4: Get Batch Details
// ============================================================
async function testGetBatch() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Get Batch Details');
  console.log('='.repeat(60));

  if (!global.testBatchId) {
    console.log('⚠️  Skipping: No batch ID from previous test');
    return;
  }

  try {
    console.log(`\n📥 Fetching batch: ${global.testBatchId}`);

    const response = await axios.get(`${API_BASE_URL}/batch/${global.testBatchId}`);

    console.log('\n✅ Batch Retrieved Successfully:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.response?.data || error.message);
  }
}

// ============================================================
// TEST 5: Verify Batch Integrity
// ============================================================
async function testVerifyBatch() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Verify Batch Integrity');
  console.log('='.repeat(60));

  if (!global.testBatchId) {
    console.log('⚠️  Skipping: No batch ID from previous test');
    return;
  }

  try {
    console.log(`\n🔍 Verifying batch: ${global.testBatchId}`);

    const response = await axios.post(`${API_BASE_URL}/verify-batch`, {
      batchId: global.testBatchId
    });

    console.log('\n✅ Batch Verification Result:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.response?.data || error.message);
  }
}

// ============================================================
// TEST 6: Verify Non-Existent Batch
// ============================================================
async function testVerifyNonExistentBatch() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Verify Non-Existent Batch (Should Fail)');
  console.log('='.repeat(60));

  try {
    console.log('\n🔍 Verifying non-existent batch: FAKE-BATCH-12345');

    const response = await axios.post(`${API_BASE_URL}/verify-batch`, {
      batchId: 'FAKE-BATCH-12345'
    });

    console.log('\n❌ Should have failed but succeeded:');
    console.log(response.data);
  } catch (error) {
    console.log('\n✅ Correctly rejected non-existent batch:');
    console.log(`Error: ${error.response?.data?.error}`);
  }
}

// ============================================================
// TEST 7: Create Multiple Batches
// ============================================================
async function testCreateMultipleBatches() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Create Multiple Batches');
  console.log('='.repeat(60));

  const medicines = [
    { name: 'Aspirin 500mg', qty: 10000 },
    { name: 'Cough Syrup 200ml', qty: 5000 },
    { name: 'Vitamin D 1000IU', qty: 50000 }
  ];

  const results = [];

  for (const med of medicines) {
    try {
      const payload = {
        batchId: `BATCH-${med.name.replace(/\s+/g, '-')}-${Date.now()}`,
        medicineName: med.name,
        quantity: med.qty,
        manufacturerName: 'Pharma Solutions Inc',
        manufacturingDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log(`\n📤 Creating batch: ${med.name}`);

      const response = await axios.post(`${API_BASE_URL}/create-batch`, payload);

      results.push({
        medicine: med.name,
        batchId: response.data.batch.batchId,
        status: 'Created',
        chainHash: response.data.security.chainHash.substring(0, 16) + '...'
      });

      console.log(`✅ Success: ${response.data.batch.batchId}`);
    } catch (error) {
      results.push({
        medicine: med.name,
        status: 'Failed',
        error: error.response?.data?.error || error.message
      });

      console.log(`❌ Failed: ${error.response?.data?.error || error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('BATCH CREATION SUMMARY:');
  console.log('='.repeat(60));
  console.log(JSON.stringify(results, null, 2));
}

// ============================================================
// TEST 8: Detailed Security Hash Analysis
// ============================================================
async function testSecurityAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 8: Detailed Security Hash Analysis');
  console.log('='.repeat(60));

  try {
    const payload = {
      batchId: `SECURITY-TEST-${Date.now()}`,
      medicineName: 'Security Test Medicine',
      quantity: 1000,
      manufacturerName: 'Security Test Corp',
      manufacturingDate: new Date('2025-12-11').toISOString(),
      expiryDate: new Date('2026-12-11').toISOString()
    };

    console.log('\n📤 Creating batch for security analysis:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(`${API_BASE_URL}/create-batch`, payload);

    console.log('\n' + '='.repeat(60));
    console.log('SECURITY HASHES BREAKDOWN:');
    console.log('='.repeat(60));

    console.log('\n1. SHA-256 DataHash:');
    console.log(`   Full: ${response.data.security.dataHash}`);
    console.log(`   Length: ${response.data.security.dataHash.length} characters`);

    console.log('\n2. Hash-Chain Hash:');
    console.log(`   Full: ${response.data.security.chainHash}`);
    console.log(`   Length: ${response.data.security.chainHash.length} characters`);

    console.log('\n3. HMAC Signature:');
    console.log(`   Full: ${response.data.security.hmacSignature}`);
    console.log(`   Length: ${response.data.security.hmacSignature.length} characters`);

    console.log('\n4. QR Code:');
    console.log(`   Content: ${response.data.security.qrCode.content}`);
    console.log(`   Format: PNG DataURL (base64)`);
    console.log(`   DataURL Length: ${response.data.security.qrCode.dataURL.length} characters`);
    console.log(`   Dimensions: ${response.data.security.qrCode.width}x${response.data.security.qrCode.height} pixels`);

    console.log('\n5. Encrypted Data:');
    console.log(`   Algorithm: ${response.data.encryptedData.encryptionAlgorithm}`);
    console.log(`   Encrypted Batch Details (first 50 chars):`);
    console.log(`   ${response.data.encryptedData.batchDetails.substring(0, 50)}...`);
    console.log(`   Total Length: ${response.data.encryptedData.batchDetails.length} characters`);

    console.log('\n' + '='.repeat(60));
    console.log('GENESIS EVENT DETAILS:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(response.data.genesisEvent, null, 2));
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error.response?.data || error.message);
  }
}

// ============================================================
// RUN ALL TESTS
// ============================================================
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   MANUFACTURER BATCH CREATION - TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // Check if server is running
  try {
    await axios.get('http://localhost:5000/api/manufacturer/batch/test');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ ERROR: Cannot connect to server at http://localhost:5000');
      console.error('   Make sure the server is running: npm start');
      process.exit(1);
    }
  }

  // Run tests in sequence
  await testCreateBatch();
  await testCreateBatchMissingFields();
  await testCreateDuplicateBatch();
  await testGetBatch();
  await testVerifyBatch();
  await testVerifyNonExistentBatch();
  await testCreateMultipleBatches();
  await testSecurityAnalysis();

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   ALL TESTS COMPLETED                                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal Error:', error);
    process.exit(1);
  });
}

module.exports = {
  testCreateBatch,
  testCreateBatchMissingFields,
  testCreateDuplicateBatch,
  testGetBatch,
  testVerifyBatch,
  testVerifyNonExistentBatch,
  testCreateMultipleBatches,
  testSecurityAnalysis,
  runAllTests
};
