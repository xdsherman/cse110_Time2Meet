import firebase from "firebase";


const db = firebase.initializeApp({
    apiKey: "AIzaSyCjmOPX5YvEQ4Um4dfa7hVmg_8fngRaDgM",
    authDomain: "time2meet-d3731.firebaseapp.com",
    databaseURL: "https://time2meet-d3731.firebaseio.com",
    projectId: "time2meet-d3731",
    storageBucket: "time2meet-d3731.appspot.com",
    messagingSenderId: "628740672847",
    appId: "1:628740672847:web:5dc5916d028a46524d093a",
    measurementId: "G-7E9LGX07GL"
});

export default db;
export const provider2 = new firebase.auth.GoogleAuthProvider()
