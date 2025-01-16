import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

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
