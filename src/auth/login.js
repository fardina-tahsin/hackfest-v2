import {
    emailLogin,
    googleLogin,
    phoneLogin,
    verifyPhoneOtp,
    recoverPassword,
} from "./auth.js";

// DOM Elements
const otpSection = document.getElementById("otp-section");
const forgotPasswordSection = document.getElementById("forgot-password-section");
const successMessageEl = document.getElementById("success-message");
const errorMessageEl = document.getElementById("error-message");

// ============================
// EMAIL LOGIN
// ============================
document.getElementById("login-btn").onclick = async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    const result = await emailLogin(email, password);
    if (result.success) {
        alert("Login successful!");
        // Redirect to home or dashboard
        window.location.href = "/";
    } else {
        alert(result.error || "Login failed");
    }
};

// ============================
// PHONE LOGIN + OTP
// ============================
document.getElementById("send-otp-btn").onclick = async () => {
    const phone = document.getElementById("phone-login").value;

    if (!phone.startsWith("+")) {
        alert("Phone must be in international format (e.g., +880...)");
        return;
    }

    const result = await phoneLogin(phone, "recaptcha-container");
    if (result.success) {
        otpSection.classList.remove("hidden");
        alert(result.message || "OTP sent!");
    } else {
        alert(result.error || "Failed to send OTP");
    }
};

document.getElementById("verify-otp-btn").onclick = async () => {
    const otp = document.getElementById("otp-input").value;

    if (!otp) {
        alert("Please enter the OTP");
        return;
    }

    const result = await verifyPhoneOtp(otp);
    if (result.success) {
        alert("Phone login successful!");
        otpSection.classList.add("hidden");
        window.location.href = "/";
    } else {
        alert(result.error || "Invalid OTP");
    }
};

// ============================
// GOOGLE LOGIN
// ============================
document.getElementById("google-login-btn").onclick = async () => {
    try {
        await googleLogin();
        // Google login handles redirect internally
    } catch (error) {
        alert("Google login failed");
    }
};

// ============================
// FORGOT PASSWORD
// ============================
document.getElementById("forgot-password-btn").onclick = () => {
    forgotPasswordSection.classList.toggle("hidden");
    successMessageEl.classList.add("hidden");
    errorMessageEl.classList.add("hidden");
};

document.getElementById("cancel-recovery-btn").onclick = () => {
    forgotPasswordSection.classList.add("hidden");
    document.getElementById("recovery-email").value = "";
    successMessageEl.classList.add("hidden");
    errorMessageEl.classList.add("hidden");
};

document.getElementById("send-recovery-btn").onclick = async () => {
    const email = document.getElementById("recovery-email").value;

    successMessageEl.classList.add("hidden");
    errorMessageEl.classList.add("hidden");

    if (!email || !email.includes("@")) {
        errorMessageEl.textContent = "Please enter a valid email address";
        errorMessageEl.classList.remove("hidden");
        return;
    }

    const result = await recoverPassword(email);
    if (result.success) {
        successMessageEl.textContent = result.message || "Recovery email sent! Check your inbox.";
        successMessageEl.classList.remove("hidden");
        document.getElementById("recovery-email").value = "";
    } else {
        errorMessageEl.textContent = result.error || "Failed to send recovery email";
        errorMessageEl.classList.remove("hidden");
    }
};