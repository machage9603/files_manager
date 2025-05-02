
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let firebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
}

// Export services
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export const db = getFirestore(firebaseApp);
export default firebaseApp;

// Firestore exports
export { collection, addDoc, query, where, getDocs, doc, getDoc, Timestamp };

// --- Authentication Functions ---

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Signed in user:", user);
        return user;
    } catch (error: unknown) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log("User signed out");
    } catch (error: unknown) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const subscribeToAuthStateChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- Storage Functions ---

export const uploadFile = async (file: File, userId: string, folderPath: string = 'documents') => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    const storageRef = ref(storage, `user_files/${userId}/${folderPath}/${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log('Uploaded a blob or file!', snapshot);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadURL);
        return downloadURL;
    } catch (error: unknown) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export const getFileDownloadURL = async (filePath: string) => {
    const storageRef = ref(storage, filePath);
    try {
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error: unknown) {
        console.error("Error getting download URL:", error);
        throw error;
    }
};