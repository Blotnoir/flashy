// import {database, auth} from "./firebase";
// import { ref, push, set } from "firebase/database";

// export const saveFlashcard = (flashcard) => {
//     const userId = auth.currentUser?.uid;
//     if (!userId) {
//         alert("User not signed in");
//         return;
//     }

//     const flashcardsRef = ref(database, `users/${userId}/flashcards`);
//     const newFlashcardRef = push(flashcardsRef);

//     set(newFlashcardRef, flashcard)
//       .then(() => {
//         console.log('flashcard saved');
//       })
//       .catch((error) => {
//         console.error("error saving flashcard:", error);
//       });
// };

