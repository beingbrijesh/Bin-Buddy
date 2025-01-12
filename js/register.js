import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
const auth = getAuth(app);

document.getElementById("submit").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully");
        console.log("User created:", userCredential);
        window.location.href = "loginpage.html";
    } catch (error) {
        console.error("Error creating account:", error);
        alert("Error: " + error.message);
    }
});
