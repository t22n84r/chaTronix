import { createContext, FC } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
   apiKey: "AIzaSyAfJusTCc8cAf7tqOCmFMrKE8MsNzm1gow",
   authDomain: "chatronix-c1808.firebaseapp.com",
   projectId: "chatronix-c1808",
   storageBucket: "chatronix-c1808.appspot.com",
   messagingSenderId: "228752602135",
   appId: "1:228752602135:web:1475be8c34e88663425852",
   measurementId: "G-L6WLHXQLSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage for persistence
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


// Define the context with a type of Firestore or null
export const FirestoreContext = createContext<Firestore | null>(null);

export const FirestoreProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirestoreContext.Provider value={db}>
      {children}
    </FirestoreContext.Provider>
  );
};
