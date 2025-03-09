// TODO: Implement email verification after user signs up.
// TODO: Show alert boxes for when no exisiting email or password is incorrect. 
// TODO: Improve flashcard styling for mobile





import React, { useState, useEffect } from "react";
import { auth } from "./firebase"; // Firebase setup file
import { ref, push, set, remove } from "./firebase";
import { database } from "./firebase";
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, onAuthStateChanged } from "./firebase";
import "./App.css";
import Login from "./Login"; // Login component
import SignUp from "./SignUp"; // Sign-up component
import FlashcardsFetcher from "./FetchFlashcards";


function FlashcardApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle user authentication state persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false); // Authentication status determined
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      return;
    }
    try {
      await setPersistence(auth, browserLocalPersistence); // Ensure session persistence
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error logging in:", error.message);
      // alert("Failed to log in. Please try again.");
    }
  };

  const handleSignUp = async (email, password) => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      alert("Account created successfully! Please log in.");
      setIsSignUp(false); // Switch back to login after signup
    } catch (error) {
      console.error("Error signing up:", error.message);
      alert("Failed to create account. Please try again.");
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // If still loading, show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // Show Login or SignUp based on state
  if (!isAuthenticated) {
    return isSignUp ? (
      <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setIsSignUp(false)} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToSignUp={() => setIsSignUp(true)} />
    );
  }

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () =>
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);

  const handlePrev = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );

  const handleAddFlashcard = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      const newFlashcard = { question: newQuestion, answer: newAnswer };
      const userId = auth.currentUser?.uid;

      setFlashcards((prev = []) => [...prev, newFlashcard]);

      if (userId) {
        const flashcardsRef = ref(database, `users/${userId}/flashcards`);
        const newFlashcardRef = push(flashcardsRef);

        set(newFlashcardRef, newFlashcard)
          .then(() => {
            console.log("Flashcard saved to Firebase!");
          })
          .catch((error) => {
            console.error("Error saving flashcard:", error);
            setFlashcards((prev) => prev.filter((fc) => fc !== newFlashcard));
          });
      }

      setNewQuestion("");
      setNewAnswer("");
    }
  };

  const handleDeleteFlashcard = (index) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const flashcardToDelete = flashcards[index];
    if (!flashcardToDelete) return;

    const flashcardRef = ref(
      database,
      `users/${userId}/flashcards/${flashcardToDelete.id}`
    );

    remove(flashcardRef)
      .then(() => {
        console.log("Flashcard deleted from Firebase.");
        setFlashcards((prev) => prev.filter((_, i) => i !== index));
        setCurrentIndex((prev) =>
          prev === flashcards.length - 1 ? prev - 1 : prev
        );
      })
      .catch((error) =>
        console.error("Error deleting flashcard from Firebase:", error)
      );
  };

  const handleShuffle = () => {
    setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div className={isDarkMode ? "app dark-mode" : "app"}>
      <FlashcardsFetcher setFlashcards={setFlashcards} />
      <h1 style={{ fontStyle: "italic", textShadow: "0px 1px 0px yellow" }}>
        FLASHY
      </h1>
      <button id="dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </button>
      <button id = "sign-out-btn" onClick={() => auth.signOut()}>
        Sign out
        </button>
      <div>
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter question"
        />
        <br />
        <input
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Enter answer"
        />
        <button id="add-flashcard-button" onClick={handleAddFlashcard}>
          Add Flashcard
        </button>
      </div>
      {flashcards.length > 0 ? (
        <div className="flashcard-container">
          <div
            className={`flashcard ${isFlipped ? "is-flipped" : ""}`}
            onClick={handleFlip}
          >
            <div className="flashcard-side flashcard-front">
              <span className="corner-label">Q</span>
              {flashcards[currentIndex].question}
            </div>
            <div className="flashcard-side flashcard-back">
              <span className="corner-label">A</span>
              {flashcards[currentIndex].answer}
            </div>
          </div>
          <div className="controls">
            <button onClick={handlePrev}>Previous</button>
            <button onClick={handleNext}>Next</button>
            <button onClick={handleShuffle}>Shuffle</button>
            <button
              onClick={() => handleDeleteFlashcard(currentIndex)}
              id="delete-flashcard-button"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <p>No flashcards yet. Create one!</p>
      )}
    </div>
  );
}

export default FlashcardApp;

