// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "Enter your firebase API key here",
    authDomain: "bin-buddy-4b96f.firebaseapp.com",
    projectId: "bin-buddy-4b96f",
    storageBucket: "bin-buddy-4b96f.firebasestorage.app",
    messagingSenderId: "1085957179948",
    appId: "1:1085957179948:web:e576dcf625d145e1119f89",
    measurementId: "G-HL3VRJYME6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login successful. Redirecting to homepage...");
            window.location.href = "index.html";
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;

            // Log the error and display a message to the user
            console.error(`Error (${errorCode}): ${errorMessage}`);
            alert(errorMessage);
        });
});
