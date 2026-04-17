# VERCEL DEPLOYMENT SETUP GUIDE

## Step 1: Backend Vercel Project Configuration

### Environment Variables (Set in Vercel Dashboard):
```
FIREBASE_PROJECT_ID=dsa-platform-93141
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@dsa-platform-93141.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9kBpmHYz1SzpL\n2TpaGisfNwUGR49XtObVWMYY5MTxP3tobMixZiFpSq39w3g5r6F79TY7KjLC2dXL\nMg2BeyCDwOY5L+7PshgQ8wX8X91/o2gepZnWm8gQ+29jgX7sARXryOxuFnsB6caO\n4VGZzsZZNVMOzuBr3GtJFp893z9DPixbI7EbHr0sA1cLarEUZS/LCfdSbr39SDet\nQ8xkJIKyNKZ3iet8ye+0JeQ7TY9qvlWT8ffVGofgVRrPDe378Igt2nU7c2xpNHvw\nUUiAzsgQ9qzoh3JoWX+GedLHMuf6+NAHiL3NlXVxicCILdrZpfIwfOpOSzm3BYJn\nY0GYDba7AgMBAAECggEAAOJ1xRPj5FcmsqjqWqD0TOUoVa2qz77NNEysQVHRUMuP\ni161QbgCID1+z12Ep5xCtX3g9BNlK5ScU0zsqYswt9IEIQXbaEZip12YTGO0IxQu\nTbT5y/nBIWx9n2oWH2An692YVjEuVMV0WEFZQfhS46KvPF/0cHxrAcB5xhj5xhoM\n7ykf7F8lNjTgD/n7FoA3YdWShoJhoypm/K6rZGUq+cInONhmadCIPLWUZPE8dyVp\nwqON/gPB+qwZMnCQnzY5LOXFjvM1nkzH0sPHIq2AcABD+RSo65OQhUFPkNHQCQMb\nYooeqDlKT0AlUIjCno5d4cy1UGScbZ8SP3m6vwMqhQKBgQD6zBh57lUsCzWNKXww\nO/JYf3NGDrc5gmjvRLN47mcdr56rpvpkEVLPXIJUk8BNzB137uEwyY/ukb3oR2Ku\n1SntlbyRA0FU1Q7rwfBJaTLAUxEIMvehRn3cjezqx5rrvLi9SBqXxzNsiuaN0SkF\nOa8gW5JVVsLLZPUk7LNCXAWcJwKBgQDBfs+21Efkig+NLjUKjohsY3ubA57XTywq\nEGb4ButDCA7zbAL3RCtUURiF3tPs5XYdW2t9DAeawryyAn8/5XmwZWEsBVRarMj3\nGe0CDx/FMYUf4qbV0Tv039vhDaV/8oRhK0Ro+yBv9tulGgIOI/OppzicsddDk1rV\nR13rXHipTQKBgQD1gD5hdT0orRxRv49SxAu6N6CGrrcK8652saChu3VzKMvAqean\neBHA7ISj+DIhtbIPCeakVFqxpTbqHp7qF75AVPhOV4pnWVyOybzGj9TfUTD1/rZK\nx+9CrCeDt7reElIg72kgtB2RnfKMVne6JrpYiWsYYKK0aXJTH+VmCyButwKBgB5Q\n3AJtKAZqix03jB/nTQCOZaNX4d8iDG1avIdHrjyGWrFQzvYmvBMt0YXH77RCD0ty\nM1kYNWjN8fqB4aYFMhetCph3DUxXnfT5HuUfsX6Xz5+7RyBg89/d4vlTxgZR3OPM\nf59jGSXxq2AmvwOwJlECXiBOzMdNowGfeNuTVWRRAoGBALdMXgzGMjYpUl1Oo1SA\nfU7Xr2Zk4/PVBdDQD649RnsQhV7JzaV7V5DOYEMTVYaTEo20K3HDzSxZrKCWeUqe\noHW5qzkt8iyK4LUYtnaRmJ3iCze4J8pU9fN7Zek60TNrVOmdcYlunwI9OVfin4Ay\nbXmwSLVwIQKSF4z214wvLrtt\n-----END PRIVATE KEY-----
FRONTEND_URL=https://dsa-practice-tracker-two.vercel.app
ADMIN_NAME=admin
ADMIN_LOGIN_PASSWORD=admin@9878
ADMIN_PRIVATE_PASSWORD=admin@9878
```

## Step 2: Frontend Vercel Project Configuration

### Environment Variables (Set in Vercel Dashboard):
```
VITE_API_URL=/api
VITE_FIREBASE_API_KEY=AIzaSyBtoY7BPSW_zdrZAh-SmgTKp0KqEyftIgY
VITE_FIREBASE_AUTH_DOMAIN=dsa-platform-93141.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dsa-platform-93141
VITE_FIREBASE_STORAGE_BUCKET=dsa-platform-93141.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=641640697696
VITE_FIREBASE_APP_ID=1:641640697696:web:f9ff6c8a81aea674589805
```

## Step 3: Common Issues and Fixes

### Issue 1: Blank Page on Problems
- **Cause**: Frontend fallback problems not loading
- **Fix**: Already included defaultProblems in code
- **Check**: Open F12 console and look for "Fetching problems" messages

### Issue 2: Admin Login Not Working
- **Cause**: Wrong username/password
- **Username**: `admin`
- **Password**: `admin@9878`
- **Fix**: Both fields required, use exact values above

### Issue 3: Problems Page Shows Only Few Questions
- **Cause**: API might be timing out
- **Fix**: Page now shows 7 default problems immediately, API updates in background
- **Check**: Refresh page and wait 5 seconds

### Issue 4: API Endpoints Returning 503
- **Cause**: Firebase not initialized in Vercel backend
- **Fix**: Ensure all FIREBASE_* env vars are set correctly in Vercel dashboard
- **Check**: Visit `/api/health` endpoint, should return 200 OK

## Step 4: Verification Checklist

- [ ] Frontend shows "Problem Library" heading
- [ ] 7 default problems visible (Two Sum, Valid Parentheses, etc.)
- [ ] Can click on a problem and see details  
- [ ] Admin login accepts username:admin, password:admin@9878
- [ ] /api/health returns 200 OK
- [ ] Problems load from Firebase (optional, falls back to defaults)

## Step 5: Local Testing

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:3000
```

## Important Notes

- All .env files should NOT be committed to git (they're in .gitignore)
- Set environment variables directly in Vercel dashboard
- Fallback problems ensure page always works, even if API is down
- Firebase credentials are real and working
