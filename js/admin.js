// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "Your API KEY",
    authDomain: "Your AUTH DOMAIN",
    projectId: "Your Project Id",
    storageBucket: "XXXXXXXXX",
    messagingSenderId: "XXXXXXXXX",
    appId: "XXXXXXXXXXX",
    measurementId: "XXXXXXXXX"
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
            console.log("Login successful. Redirecting to Admin Panel...");
            window.location.href = "adminpanel.html";
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
