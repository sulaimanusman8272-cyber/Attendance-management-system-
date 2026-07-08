$headers = @{ "Content-Type" = "application/json" }

# Register Teacher
$teacher = '{"name":"Dr Smith","email":"teacher@myuni.edu","password":"admin123","role":"teacher","institution_id":1}'
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers $headers -Body $teacher -UseBasicParsing

# Register Student
$student = '{"name":"Ali Khan","email":"student@myuni.edu","password":"admin123","role":"student","institution_id":1}'
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers $headers -Body $student -UseBasicParsing
