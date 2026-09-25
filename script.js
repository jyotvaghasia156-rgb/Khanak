// --------------------------------------------------------
// UI ANIMATIONS & EFFECTS (Runs First)
// --------------------------------------------------------

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

// Hero Parallax Effect
document.addEventListener("DOMContentLoaded", () => {
    const heroBg = document.querySelector('.hero-bg');
    const heroText = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroBg && heroText) {
            heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroText.style.transform = `translateY(${scrolled * 0.2}px)`;
            heroText.style.opacity = 1 - (scrolled * 0.003);
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
// EMAILJS INITIALIZATION & OTP LOGIC
// --------------------------------------------------------
try {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("ExVacF0AKGwRNjnmK");
    }
} catch (e) {
    console.error("EmailJS could not be initialized:", e);
}

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
        if (typeof emailjs === 'undefined') {
            alert("EmailJS is blocked by your browser. Please disable your adblocker to verify your email.");
            return;
        }

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
        emailjs.send("service_jje0v0l", "template_w68c7ww", {
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
            alert("EmailJS Error: " + JSON.stringify(error));
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
        const submitBtn = document.getElementById('submit-form-btn');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        // Build the template parameters based on the instructions
        const templateParams = {
            from_name: formData.get("Full Name"),
            customer_email: formData.get("Email"),
            phone_number: formData.get("Phone"),
            event_type: formData.get("Event Type"),
            event_date: formData.get("Event Date"),
            location: formData.get("Location"),
            vision: formData.get("Vision Details")
        };

        // Send via EmailJS
        emailjs.send("service_jje0v0l", "template_0kfbres", templateParams)
            .then(() => {
                alert("Thank you! Your inquiry has been sent directly to the artist. We will be in touch soon.");
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            })
            .catch((error) => {
                console.error("Error submitting form:", error);
                alert("Failed to send inquiry: " + JSON.stringify(error));
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    });
}
