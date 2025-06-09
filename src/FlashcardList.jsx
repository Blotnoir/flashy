import React, { useState } from 'react';

const styles = {
  container: {
    width: '300px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#357abd',
    },
  },
  flashcardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  flashcard: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e9e9e9',
    },
  },
  flashcardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  flashcardTitle: {
    fontWeight: '500',
    color: '#333',
  },
  flashcardActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666',
    '&:hover': {
      color: '#333',
    },
  },
  flashcardContent: {
    fontSize: '14px',
    color: '#666',
  },
};

export const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([
    { id: 1, title: 'JavaScript Basics', content: 'Variables, functions, and control flow' },
    { id: 2, title: 'React Hooks', content: 'useState, useEffect, and custom hooks' },
    { id: 3, title: 'CSS Flexbox', content: 'Flex container and item properties' },
  ]);

  const handleDelete = (id) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  const handleEdit = (id) => {
    // TODO: Implement edit functionality
    console.log('Edit flashcard:', id);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Flashcards</h2>
        <button style={styles.addButton}>Add New</button>
      </div>
      <div style={styles.flashcardList}>
        {flashcards.map((flashcard) => (
          <div key={flashcard.id} style={styles.flashcard}>
            <div style={styles.flashcardHeader}>
              <span style={styles.flashcardTitle}>{flashcard.title}</span>
              <div style={styles.flashcardActions}>
                <button 
                  style={styles.actionButton}
                  onClick={() => handleEdit(flashcard.id)}
                >
                  ✏️
                </button>
                <button 
                  style={styles.actionButton}
                  onClick={() => handleDelete(flashcard.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            <div style={styles.flashcardContent}>
              {flashcard.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 