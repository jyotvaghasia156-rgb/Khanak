// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Replace this with your actual Firebase Project Configuration!
const firebaseConfig = {
    apiKey: "AIzaSyBJtp6yCzO7nOhBYYVgulT9_CzpAI8rP1w",
    authDomain: "project-37461da1-f43e-45bf-966.firebaseapp.com",
    projectId: "project-37461da1-f43e-45bf-966",
    storageBucket: "project-37461da1-f43e-45bf-966.firebasestorage.app",
    messagingSenderId: "475304614987",
    appId: "1:475304614987:web:e6cd76304c60cf2e1781ce",
    measurementId: "G-FB56DVR8H8"
};

// Initialize Firebase only if the API key has been replaced
let auth;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Intersection Observer for Fade-In
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});
window.addEventListener('load', () => {
    document.querySelectorAll('.fade-in').forEach(element => {
        if(element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add('visible');
        }
    });
});

// --------------------------------------------------------
// OTP VERIFICATION LOGIC (Phone Number)
// --------------------------------------------------------
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const phoneInput = document.getElementById('phone-number');
const otpModal = document.getElementById('otp-modal');
const closeOtpModal = document.getElementById('close-otp-modal');
const otpCodeInput = document.getElementById('otp-code');
const otpMessage = document.getElementById('otp-message');
const submitFormBtn = document.getElementById('submit-form-btn');

let confirmationResultObj = null;

if (sendOtpBtn && auth) {
    // Setup reCAPTCHA (required by Firebase for phone auth to prevent spam)
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'send-otp-btn', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved
        }
    });

    sendOtpBtn.addEventListener('click', () => {
        let phoneNumber = phoneInput.value.trim();
        
        // Auto-add +91 if they forgot it (fixing the bug)
        if (phoneNumber.length === 10 && !phoneNumber.startsWith('+')) {
            phoneNumber = "+91" + phoneNumber;
        } else if (!phoneNumber.startsWith('+')) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        sendOtpBtn.innerText = "Sending...";
        sendOtpBtn.disabled = true;

        signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                confirmationResultObj = confirmationResult;
                
                // Show Full Screen OTP Modal!
                otpModal.style.display = 'flex';
                sendOtpBtn.innerText = "OTP Sent!";
            })
            .catch((error) => {
                console.error("Error sending OTP:", error);
                sendOtpBtn.innerText = "Get OTP";
                sendOtpBtn.disabled = false;
                alert("Failed to send OTP. Ensure your Firebase keys are correct and the number is valid.");
            });
    });

    verifyOtpBtn.addEventListener('click', () => {
        const code = otpCodeInput.value.trim();
        if (!code || !confirmationResultObj) return;

        verifyOtpBtn.innerText = "Verifying...";
        verifyOtpBtn.disabled = true;

        confirmationResultObj.confirm(code).then((result) => {
            // User successfully verified
            otpMessage.innerText = "✅ Verified successfully!";
            otpMessage.className = "otp-message success";
            
            // Close modal after 1 second
            setTimeout(() => {
                otpModal.style.display = 'none';
                phoneInput.disabled = true;
                
                // ENBLE THE MAIN SUBMIT BUTTON
                submitFormBtn.disabled = false;
                submitFormBtn.style.opacity = '1';
                submitFormBtn.style.cursor = 'pointer';
            }, 1000);

        }).catch((error) => {
            console.error("Invalid OTP:", error);
            otpMessage.innerText = "❌ Invalid OTP. Try again.";
            otpMessage.className = "otp-message";
            verifyOtpBtn.innerText = "Verify & Continue";
            verifyOtpBtn.disabled = false;
        });
    });

    closeOtpModal.addEventListener('click', () => {
        otpModal.style.display = 'none';
        sendOtpBtn.innerText = "Get OTP";
        sendOtpBtn.disabled = false;
    });
} else if (sendOtpBtn && !auth) {
    // Fallback if Firebase isn't configured yet
    sendOtpBtn.addEventListener('click', () => {
        alert("Firebase is not configured yet! Please update script.js with your Firebase config keys.");
    });
}

// --------------------------------------------------------
// SAFE FORM SUBMISSION (Bypasses Browser Security Warning)
// --------------------------------------------------------
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop the default warning-prone submission

        const formData = new FormData(contactForm);
        let emailBody = "New Inquiry from Khanak Website:\n\n";
        
        formData.forEach((value, key) => {
            emailBody += `${key}: ${value}\n`;
        });

        // Safely trigger the email client
        const subject = encodeURIComponent("New Inquiry: " + formData.get("Full Name"));
        const body = encodeURIComponent(emailBody);
        window.location.href = `mailto:hello@khanak.com?subject=${subject}&body=${body}`;
        
        // Show success alert
        alert("Thank you! Your email client will now open to send your inquiry.");
    });
}
