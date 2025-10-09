
import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.js";

const LoginForm = ({onLogin}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and signup


  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      if (isSignUp) {
        // Sign up logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User signed up:", userCredential.user);
        alert("Account created! You can now log in.");
        setIsSignUp(false);
      } else {
        // Sign in logic
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(); // Notify parent of successful login
      }
    } catch (error) {
      console.error("Error code:", error.code);
      console.error("Full error:", error);
  
      switch (error.code) {
        case "auth/invalid-email":
          alert("Invalid email format. Please enter a valid email.");
          break;
        case "auth/user-not-found":
          alert("No user found with this email.");
          break;
        case "auth/wrong-password":
          alert("Incorrect password. Please try again.");
          break;
        case "auth/email-already-in-use":
          alert("This email is already registered. Please log in.");
          break;
        case "auth/invalid-credential":
          alert("Invalid email or password. Please try again.");
          break;
        default:
          alert(`An error occurred: ${error.message}`);
      }
    }
  };
  

  return (
    <div>
      <h2 style={{ textDecoration: "underline" }}>
        {isSignUp ? "Sign Up" : "Login"}
      </h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{ marginBottom: "10px" }}
          />
        </label>
        <br />
        <label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>
        <br />
        <button type="submit" id="login-button">
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>
      <p>
        {isSignUp
          ? "Already have an account? "
          : "Don't have an account yet? "}
        <button
          type="button"
          id="toggle-auth-button"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
