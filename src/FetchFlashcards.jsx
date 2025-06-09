import { useEffect } from "react";
import { ref, get } from "firebase/database";
import { auth } from "./firebase";
import { database } from "./firebase";

export const FlashcardsFetcher = ({ setFlashcards }) => {
  useEffect(() => {
    const fetchFlashcards = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const flashcardsRef = ref(database, `users/${userId}/flashcards`);
      try {
        const snapshot = await get(flashcardsRef);
        if (snapshot.exists()) {
          const flashcardsData = snapshot.val();
          const flashcardsArray = Object.keys(flashcardsData).map((key) => ({
            id: key,
            ...flashcardsData[key],
          }));
          setFlashcards(flashcardsArray);
        } else {
          console.log("No flashcards found.");
        }
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };

    fetchFlashcards();
  }, [setFlashcards]);

  return null; // This component doesn't render anything
};
