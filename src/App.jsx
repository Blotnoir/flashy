/* 
   TODO: ADD EMAIL VERIFICATION WHEN SIGNING UP (?) firebase
*/

import "./App.css";
import { useState, useEffect } from "react";
import { auth } from "./firebase"; // Firebase setup file
import { ref, push, set, remove } from "./firebase";
import { database } from "./firebase";
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword, onAuthStateChanged } from "./firebase";
import { LoginForm } from "./LoginForm";
import { SignUp } from "./SignUp";
import { FlashcardsFetcher } from "./FetchFlashcards";

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
  },
  stackButton: {
    position: 'absolute',
    left: '20px',
    top: '20px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    zIndex: 100,
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#357abd',
    },
  },
  sidebar: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '300px',
    height: '100vh',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    paddingTop: '70px',
    overflowY: 'auto',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease',
    zIndex: 99,
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  flashcardItem: {
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  flashcardItemActive: {
    backgroundColor: '#e0e0e0',
    borderLeft: '6px solid rgb(18, 148, 234)',
  },
  flashcardItemTitle: {
    fontWeight: '500',
    color: '#333',
    marginBottom: '5px',
  },
  flashcardItemPreview: {
    fontSize: '14px',
    color: '#666',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

function FlashcardApp() {
  const [flashcards, setFlashcards] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [viewedCards, setViewedCards] = useState(new Set());
  const [isStackOpen, setIsStackOpen] = useState(false);

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

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  // If still loading, show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  // Show Login or SignUp based on state
  if (!isAuthenticated) {
    return isSignUp ? (
      <SignUp onSignUp={handleSignUp} onSwitchToLogin={() => setIsSignUp(false)} />
    ) : (
      <LoginForm onLogin={handleLogin} onSwitchToSignUp={() => setIsSignUp(true)} />
    );
  }

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % flashcards.length;
      setViewedCards(prev => new Set([...prev, newIndex]));
      return newIndex;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1;
      setViewedCards(prev => new Set([...prev, newIndex]));
      return newIndex;
    });
  };

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
    setViewedCards(new Set([currentIndex])); // Reset viewed cards but keep current card
  };

  return (
    <div className={isDarkMode ? "app dark-mode" : "app"} style={styles.app}>
      <button 
        style={styles.stackButton}
        onClick={() => setIsStackOpen(!isStackOpen)}
      >
        Stack
      </button>
      
      <div 
        className={`sidebar ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
          ...styles.sidebar,
          ...(isStackOpen ? styles.sidebarOpen : {})
        }}
      >
        <h2 style={{ marginBottom: '20px' }}>Your Flashcards ({flashcards.length})</h2>
        {flashcards.map((flashcard, index) => (
          <div
            key={index}
            className={`flashcard-item ${isDarkMode ? 'dark-mode' : ''}`}
            style={{
              ...styles.flashcardItem,
              ...(index === currentIndex ? styles.flashcardItemActive : {}),
            }}
            onClick={() => {
              setCurrentIndex(index);
              setIsFlipped(false);
              setIsStackOpen(false); // Close the stack when a card is selected
            }}
          >
            <div style={styles.flashcardItemTitle}>
              {flashcard.question.substring(0, 30)}
              {flashcard.question.length > 30 ? '...' : ''}
            </div>
            <div style={styles.flashcardItemPreview}>
              {flashcard.answer.substring(0, 50)}
              {flashcard.answer.length > 50 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.mainContent}> 
        <FlashcardsFetcher setFlashcards={setFlashcards} />
        <h1 style={{ fontStyle: "italic", textShadow: "0px 1px 0px orange", }}>
          FLASHY
        </h1>
        <button id="dark-mode-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
        <button id="sign-out-btn" onClick={() => auth.signOut()}>
          Sign out
        </button>
        <div>
          <input
            style={{marginBottom: '10px', width: '200px'}}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Enter question"
          />
          <br />
          <input
            style={{marginBottom: '10px',width: '200px'}}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Enter answer"
          />
          <br></br>
          <button id="add-flashcard-button" onClick={handleAddFlashcard}>
            Add Flashcard
          </button>
        </div>
        {flashcards.length > 0 ? (
          <>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(viewedCards.size / flashcards.length) * 100}%` 
                  }}
                />
              </div>
              <div className="progress-text">
                {viewedCards.size} of {flashcards.length} cards viewed
              </div>
            </div>
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
          </>
        ) : (
          <p>No flashcards yet. Create one!</p>
        )}
      </div>
    </div>
  );
}

export default FlashcardApp;

