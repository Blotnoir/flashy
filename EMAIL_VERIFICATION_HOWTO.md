# Email Verification Implementation Guide

This guide explains how to implement email verification for user accounts in the Flashy flashcard app using Firebase Authentication.

## Overview

Email verification ensures that users have access to the email address they used to create their account. This helps prevent fake accounts and ensures users can receive important notifications.

## Implementation Steps

### 1. Update Firebase Imports

Add `sendEmailVerification` to your Firebase auth imports:

```javascript
// In LoginForm.jsx
import { sendEmailVerification, signInWithEmailAndPassword, createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from "firebase/auth";

// In App.jsx
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
```

### 2. Update LoginForm.jsx

#### Add State for Verification
```javascript
const [isVerificationSent, setIsVerificationSent] = useState(false);
```

#### Modify Sign-Up Logic
```javascript
if (isSignUp) {
  // Sign up logic
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  console.log("User signed up:", userCredential.user);
  
  // Send email verification
  await sendEmailVerification(userCredential.user);
  setIsVerificationSent(true);
  alert("Account created! Please check your email and verify your account before logging in.");
  setIsSignUp(false);
} else {
  // ... existing login logic
}
```

#### Add Email Verification Check to Login
```javascript
// Sign in logic
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Check if email is verified
if (!userCredential.user.emailVerified) {
  alert("Please verify your email before logging in. Check your inbox for a verification email.");
  return;
}

onLogin(); // Notify parent of successful login
```

### 3. Update App.jsx

#### Add Email Verification State
```javascript
const [isEmailVerified, setIsEmailVerified] = useState(false);
```

#### Update Authentication State Handler
```javascript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsAuthenticated(true);
      setIsEmailVerified(user.emailVerified);
      
      // Reload user to get the latest verification status
      user.reload().then(() => {
        setIsEmailVerified(user.emailVerified);
      }).catch((error) => {
        console.error("Error reloading user:", error);
      });
    } else {
      setIsAuthenticated(false);
      setIsEmailVerified(false);
    }
    setIsLoading(false);
  });

  return () => unsubscribe();
}, []);
```

#### Add Email Verification UI
Add this code after the authentication check but before the main app content:

```javascript
// Show email verification notice if authenticated but not verified
if (isAuthenticated && !isEmailVerified) {
  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      alert("Verification email sent! Please check your inbox and spam folder.");
    } catch (error) {
      console.error("Error sending verification email:", error);
      if (error.code === "auth/too-many-requests") {
        alert("Too many verification requests. Please wait a few minutes before trying again.");
      } else {
        alert("Error sending verification email. Please try again.");
      }
    }
  };

  const handleRefreshStatus = async () => {
    try {
      await auth.currentUser.reload();
      setIsEmailVerified(auth.currentUser.emailVerified);
      if (auth.currentUser.emailVerified) {
        alert("Email verified! You can now access Flashy.");
      } else {
        alert("Email not yet verified. Please check your email and click the verification link.");
      }
    } catch (error) {
      console.error("Error refreshing user status:", error);
      alert("Error checking verification status. Please try again.");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h2>Email Verification Required</h2>
      <p>Please check your email and click the verification link to access Flashy.</p>
      <p><strong>Important:</strong> Verification links expire after 1 hour and can only be used once.</p>
      <p>If you didn't receive the email or the link expired, click "Resend Verification Email" below.</p>
      <p>Also check your spam/junk folder for the verification email.</p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={handleResendVerification}
          style={{
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Resend Verification Email
        </button>
        <button 
          onClick={handleRefreshStatus}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Verification Status
        </button>
        <button 
          onClick={() => auth.signOut()}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
```

## Key Features

### 1. Automatic Email Sending
- Verification emails are automatically sent when users sign up
- Users receive clear instructions about checking their email

### 2. Verification Status Checking
- App checks if email is verified before allowing login
- Real-time status updates when users return to the app

### 3. User-Friendly Interface
- Clear messaging about verification requirements
- Resend functionality for expired or lost emails
- Manual status refresh option
- Sign out option for users who want to use a different account

### 4. Error Handling
- Handles rate limiting (too many requests)
- Provides helpful error messages
- Graceful fallbacks for network issues

## Firebase Console Configuration

### 1. Enable Email Verification
1. Go to Firebase Console → Authentication → Sign-in method
2. Ensure "Email/Password" is enabled
3. Under "Email/Password" settings, ensure "Email link (passwordless sign-in)" is configured if needed

### 2. Email Templates
1. Go to Authentication → Templates
2. Customize the email verification template:
   - Subject line
   - Email body
   - Sender name
   - Action URL (usually your app's domain)

### 3. Authorized Domains
1. Go to Authentication → Settings → Authorized domains
2. Add your app's domain to ensure verification links work

## Testing

### 1. Test Email Sending
- Create a new account and verify the email is sent
- Check spam folder if email doesn't arrive

### 2. Test Verification Flow
- Click the verification link in the email
- Return to the app and verify access is granted

### 3. Test Error Cases
- Try logging in before verification
- Test resend functionality
- Test with expired verification links

## Security Considerations

1. **Verification Links Expire**: Firebase verification links expire after 1 hour
2. **One-Time Use**: Each verification link can only be used once
3. **Rate Limiting**: Firebase limits how often verification emails can be sent
4. **Email Validation**: Ensure proper email format validation

## Troubleshooting

### Common Issues

1. **Email Not Received**
   - Check spam/junk folder
   - Verify email address is correct
   - Wait a few minutes for delivery

2. **Verification Link Not Working**
   - Links expire after 1 hour
   - Links can only be used once
   - Use "Resend Verification Email" button

3. **"Too Many Requests" Error**
   - Wait a few minutes before trying again
   - Firebase has built-in rate limiting

4. **App Not Recognizing Verification**
   - Use "Check Verification Status" button
   - Try refreshing the page
   - Sign out and back in

## Future Enhancements

1. **Custom Email Templates**: Create branded email templates
2. **Verification Reminders**: Send follow-up emails for unverified accounts
3. **Analytics**: Track verification rates and user behavior
4. **Multiple Email Support**: Allow users to change their email address
5. **SMS Verification**: Add phone number verification as an alternative

## Code Cleanup

When implementing this feature, remember to:
- Remove any TODO comments about email verification
- Update error handling to include verification-specific errors
- Test thoroughly across different browsers and devices
- Consider accessibility for the verification UI
