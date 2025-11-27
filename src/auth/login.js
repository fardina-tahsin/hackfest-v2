// ============================
// EMAIL LOGIN
// ============================
document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  alert(`Login with email: ${email} | ${password}`);
  // → Replace alert with API call
};

// ============================
// PHONE LOGIN + OTP
// ============================
const otpSection = document.getElementById("otp-section");

// Fake OTP for demo
let generatedOTP = null;

document.getElementById("send-otp-btn").onclick = () => {
  const phone = document.getElementById("phone-login").value;

  if (!phone.startsWith("+")) {
    alert("Phone must be in international format (e.g., +880...)");
    return;
  }

  // Generate a random OTP for demo
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("OTP:", generatedOTP); // In real use, sent via server/SMS

  otpSection.classList.remove("hidden");
  alert("OTP sent!");
};

document.getElementById("verify-otp-btn").onclick = () => {
  const otp = document.getElementById("otp-input").value;

  if (otp === generatedOTP) {
    alert("Phone login success!");
  } else {
    alert("Invalid OTP");
  }
};

// ============================
// GOOGLE LOGIN
// ============================
document.getElementById("google-login-btn").onclick = () => {
  alert("Google login clicked!");
  // → Replace with actual Google OAuth implementation
};

// ============================
// FORGOT PASSWORD
// ============================
const forgotPasswordSection = document.getElementById("forgot-password-section");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");

document.getElementById("forgot-password-btn").onclick = () => {
  forgotPasswordSection.classList.toggle("hidden");
  // Clear messages when toggling
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
};

document.getElementById("cancel-recovery-btn").onclick = () => {
  forgotPasswordSection.classList.add("hidden");
  document.getElementById("recovery-email").value = "";
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
};

document.getElementById("send-recovery-btn").onclick = async () => {
  const email = document.getElementById("recovery-email").value;

  // Clear previous messages
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");

  if (!email || !email.includes("@")) {
    errorMessage.textContent = "Please enter a valid email address";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Simulate API call
  try {
    // → Replace with actual API call
    successMessage.textContent = "Recovery email sent! Check your inbox.";
    successMessage.classList.remove("hidden");
  } catch (error) {
    errorMessage.textContent = "Failed to send recovery email. Try again.";
    errorMessage.classList.remove("hidden");
  }
};


// login logic

import {
        emailSignup,
        emailLogin,
        googleLogin,
        phoneLogin,
        verifyPhoneOtp,
        recoverPassword,
    } from "../script/login.js";

    let email = "";
    let password = "";
    let phoneNumber = "";
    let otpCode = "";
    let user = null;
    let loading = true;
    let errorMessage = "";
    let successMessage = "";
    let showOtpInput = false;
    let showForgotPassword = false;
    let recoveryEmail = "";
    let generatedOTP = null;

    async function handleLogin() {
        errorMessage = "";
        alert(`Login with email: ${email} | ${password}`);
        // const result = await emailLogin(email, password);
        // if (!result.success) {
        //     errorMessage = result.error;
        // }
    }

    async function handlePhoneLogin() {
        errorMessage = "";
        if (!phoneNumber.startsWith("+")) {
            alert("Phone must be in international format (e.g., +880...)");
            return;
        }
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("OTP:", generatedOTP);
        showOtpInput = true;
        alert("OTP sent!");
    }

    async function handleVerifyOtp() {
        errorMessage = "";
        if (otpCode === generatedOTP) {
            alert("Phone login success!");
            showOtpInput = false;
            otpCode = "";
            phoneNumber = "";
        } else {
            alert("Invalid OTP");
        }
    }

    async function handleRecoverPassword() {
        errorMessage = "";
        successMessage = "";
        
        if (!recoveryEmail) {
            errorMessage = "Please enter your email address";
            return;
        }

        const result = await recoverPassword(recoveryEmail);
        if (result.success) {
            successMessage = result.message || "Recovery email sent! Check your inbox.";
            recoveryEmail = "";
        } else {
            errorMessage = result.error || "Failed to send recovery email";
        }
    }

    function toggleForgotPassword() {
        showForgotPassword = !showForgotPassword;
        errorMessage = "";
        successMessage = "";
    }