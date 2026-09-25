// --------------------------------------------------------
// EMAILJS INITIALIZATION
// --------------------------------------------------------
// TODO: Replace with your actual EmailJS Public Key
emailjs.init("YOUR_PUBLIC_KEY");

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
// OTP VERIFICATION LOGIC (EmailJS)
// --------------------------------------------------------
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const emailInput = document.getElementById('email-address');
const otpModal = document.getElementById('otp-modal');
const closeOtpModal = document.getElementById('close-otp-modal');
const otpCodeInput = document.getElementById('otp-code');
const otpMessage = document.getElementById('otp-message');
const submitFormBtn = document.getElementById('submit-form-btn');

let generatedOTP = null;

if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        sendOtpBtn.innerText = "Sending...";
        sendOtpBtn.disabled = true;

        // Generate a random 6-digit code
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

        // Send Email via EmailJS
        emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
            to_email: email,
            otp_code: generatedOTP
        })
        .then(() => {
            otpModal.style.display = 'flex';
            sendOtpBtn.innerText = "OTP Sent!";
        })
        .catch((error) => {
            console.error("Error sending OTP via EmailJS:", error);
            sendOtpBtn.innerText = "Verify Email";
            sendOtpBtn.disabled = false;
            alert("EmailJS is not configured yet! Please add your keys in script.js.");
        });
    });

    verifyOtpBtn.addEventListener('click', () => {
        const code = otpCodeInput.value.trim();
        if (!code || !generatedOTP) return;

        verifyOtpBtn.innerText = "Verifying...";
        verifyOtpBtn.disabled = true;

        if (code === generatedOTP) {
            // Success!
            otpMessage.innerText = "✅ Verified successfully!";
            otpMessage.className = "otp-message success";
            
            setTimeout(() => {
                otpModal.style.display = 'none';
                emailInput.disabled = true;
                
                // ENABLE THE MAIN SUBMIT BUTTON
                submitFormBtn.disabled = false;
                submitFormBtn.style.opacity = '1';
                submitFormBtn.style.cursor = 'pointer';
            }, 1000);
        } else {
            // Failed
            otpMessage.innerText = "❌ Invalid OTP. Try again.";
            otpMessage.className = "otp-message";
            verifyOtpBtn.innerText = "Verify & Continue";
            verifyOtpBtn.disabled = false;
        }
    });

    closeOtpModal.addEventListener('click', () => {
        otpModal.style.display = 'none';
        sendOtpBtn.innerText = "Verify Email";
        sendOtpBtn.disabled = false;
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
