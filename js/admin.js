// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB4ATeApLEEAWRn13Ts5A30wBe6XgTkMUQ",
    authDomain: "bin-buddy-e0c27.firebaseapp.com",
    projectId: "bin-buddy-e0c27",
    storageBucket: "bin-buddy-e0c27.firebasestorage.app",
    messagingSenderId: "1083287122611",
    appId: "1:1083287122611:web:c9e0691b3f9c14ae87f6c6",
    measurementId: "G-CVC1PTT0NC"
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
            window.location.href = "https://docs.google.com/spreadsheets/d/1RxtOwwD5Y4pi5y1LuDMiTXyB4b-z4iu5Nq0v-0t6Qck/edit?usp=sharing";
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
