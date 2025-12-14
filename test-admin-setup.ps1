Write-Host "========== CREATING ADMIN ACCOUNT ==========" -ForegroundColor Cyan

# Step 1: Create Admin
$adminData = @{
    name = "sameen admin"
    email = "sameenumar29@gmail.com"
    password = "sameenumar34942"
    securityQuestion = "fav color is blue"
    securityAnswer = "blue"
    adminSecret = "hospital-admin-secret-key-2025"
}

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/register-admin" `
        -Method POST `
        -Headers $headers `
        -Body ($adminData | ConvertTo-Json)
    
    Write-Host "`n✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json) -ForegroundColor Green
}
catch {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host "`n❌ ERROR: " -ForegroundColor Red
    Write-Host $errorBody -ForegroundColor Red
}

Write-Host "`n========== LOGIN STEP ==========" -ForegroundColor Cyan

# Step 2: Login
$loginData = @{
    email = "sameenumar29@gmail.com"
    password = "sameenumar34942"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers $headers `
        -Body ($loginData | ConvertTo-Json)
    
    Write-Host "`n✅ LOGIN SUCCESSFUL - OTP SENT!" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json) -ForegroundColor Green
    Write-Host "`n📧 Check backend logs for OTP code!" -ForegroundColor Yellow
}
catch {
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host "`n❌ ERROR: " -ForegroundColor Red
    Write-Host $errorBody -ForegroundColor Red
}

Write-Host "`n========== NEXT STEPS ==========" -ForegroundColor Cyan
Write-Host "1. Check backend terminal for OTP code" -ForegroundColor White
Write-Host "2. Copy the OTP from logs" -ForegroundColor White
Write-Host "3. Run: ..\test-admin-verify-otp.ps1 <OTP>" -ForegroundColor White
