// Import necessary modules and functions from React and Firebase
import { createContext, FC } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration object containing keys and identifiers for the app
const firebaseConfig = {
   apiKey: "AIzaSyAfJusTCc8cAf7tqOCmFMrKE8MsNzm1gow",
   authDomain: "chatronix-c1808.firebaseapp.com",
   projectId: "chatronix-c1808",
   storageBucket: "chatronix-c1808.appspot.com",
   messagingSenderId: "228752602135",
   appId: "1:228752602135:web:1475be8c34e88663425852",
   measurementId: "G-L6WLHXQLSC"
};

// Initialize Firebase with the configuration object
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage services
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Firebase Authentication with AsyncStorage for persistence
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Define the FirestoreContext with both Firestore and Storage services
export const FirestoreContext = createContext({
  db: db,
  storage: storage, // Include the Storage service in the context
});

// FirestoreProvider component to provide Firestore context to child components
export const FirestoreProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirestoreContext.Provider value={{db, storage}}>
      {children} {/* Render the child components */}
    </FirestoreContext.Provider>
  );
};
