import firebase from 'firebase';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyDVRd3xIrkwR7oiuBRhxtqtmWe77FNK-v4",
    authDomain: "htne2021.firebaseapp.com",
    projectId: "htne2021",
    storageBucket: "htne2021.appspot.com",
    messagingSenderId: "438236152677",
    appId: "1:438236152677:web:3d10d50ada7db7e939978c",
    measurementId: "G-1L76NHEZGQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();