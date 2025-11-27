// @ts-ignore
import { fireApp, analytics } from '../../firebase-config.js';
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    updatePassword,
    sendPasswordResetEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

const auth = getAuth(fireApp);
const provider = new GoogleAuthProvider();
auth.languageCode = 'en';
auth.settings.appVerificationDisabledForTesting = true;


// Email and Password Signup
/**
 * @param {string} email
 * @param {string} password
 */
function emailSignup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log('Signup successful:', user);
            return { success: true, user };
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
                console.error('This email is already registered');
                return { success: false, error: 'This email is already registered' };
            } else if (errorCode === 'auth/weak-password') {
                console.error('Password should be at least 6 characters');
                return { success: false, error: 'Password should be at least 6 characters' };
            } else {
                console.error(errorCode, errorMessage);
                return { success: false, error: errorMessage };
            }
        });
}

/**
 * @param {string} email
 * @param {string} password
 */
async function emailLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Signed in 
        const user = userCredential.user;
        console.log('Login successful:', user);
        return { success: true, user };
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/user-not-found') {
            console.error('No account found with this email');
            return { success: false, error: 'No account found with this email' };
        } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
            console.error('Invalid email or password');
            return { success: false, error: 'Invalid email or password' };
        } else {
            console.error(errorCode, errorMessage);
            return { success: false, error: errorMessage };
        }
    }
}

// Google Signup
function googleLogin() {

    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            // @ts-ignore
            const token = credential.accessToken;
            // The signed-in user info.
            // @ts-ignore
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            // @ts-ignore
            const errorCode = error.code;
            // @ts-ignore
            const errorMessage = error.message;
            // The email of the user's account used.
            // @ts-ignore
            const email = error.customData.email;
            // The AuthCredential type that was used.
            // @ts-ignore
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}

/**
 * Initialize reCAPTCHA verifier for phone authentication
 * @param {string} containerId - HTML element ID for reCAPTCHA
 */
function initializeRecaptcha(containerId = 'recaptcha-container') {
    // @ts-ignore
    if (window.recaptchaVerifier) {
        // @ts-ignore
        return window.recaptchaVerifier;
    }

    // @ts-ignore
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'normal',
        // @ts-ignore
        'callback': (response) => {
            console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
            console.log('reCAPTCHA expired');
        }
    });

    // @ts-ignore
    return window.recaptchaVerifier;
}

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @param {string} recaptchaContainerId - HTML element ID for reCAPTCHA
 */
function phoneLogin(phoneNumber, recaptchaContainerId = 'recaptcha-container') {
    try {
        const appVerifier = initializeRecaptcha(recaptchaContainerId);
        
        return signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                // SMS sent successfully
                // @ts-ignore
                window.confirmationResult = confirmationResult;
                console.log('OTP sent to', phoneNumber);
                return { success: true, message: 'OTP sent to your phone' };
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if (errorCode === 'auth/invalid-phone-number') {
                    console.error('Invalid phone number format');
                    return { success: false, error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' };
                } else if (errorCode === 'auth/too-many-requests') {
                    console.error('Too many requests. Try again later');
                    return { success: false, error: 'Too many requests. Please try again later' };
                } else {
                    console.error(errorCode, errorMessage);
                    return { success: false, error: errorMessage };
                }
            });
    } catch (error) {
        console.error('Error initializing phone login:', error);
        return { success: false, error: 'Failed to initialize phone login' };
    }
}

/**
 * Verify OTP code sent to phone
 * @param {string} code - 6-digit OTP code
 */
function verifyPhoneOtp(code) {
    // @ts-ignore
    if (!window.confirmationResult) {
        return Promise.resolve({ success: false, error: 'No OTP request found. Please request OTP first' });
    }

    // @ts-ignore
    return window.confirmationResult.confirm(code)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Phone login successful:', user);
            // Clear the confirmation result
            // @ts-ignore
            window.confirmationResult = null;
            return { success: true, user };
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/invalid-verification-code') {
                console.error('Invalid OTP code');
                return { success: false, error: 'Invalid OTP code. Please try again' };
            } else if (errorCode === 'auth/code-expired') {
                console.error('OTP code expired');
                return { success: false, error: 'OTP code expired. Please request a new one' };
            } else {
                console.error(errorCode, errorMessage);
                return { success: false, error: errorMessage };
            }
        });
}

function logout() {
    signOut(auth).then(() => {
        // Sign-out successful.
    // @ts-ignore
    }).catch((error) => {
        // An error happened.
    });
}

/**
 * Change password for currently logged in user
 * @param {string} currentPassword - User's current password for re-authentication
 * @param {string} newPassword - New password to set
 */
async function changePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    
    if (!user) {
        return { success: false, error: 'No user is currently logged in' };
    }

    if (!user.email) {
        return { success: false, error: 'User does not have an email associated' };
    }

    try {
        // Re-authenticate user before changing password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        console.log('Password updated successfully');
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
            console.error('Current password is incorrect');
            return { success: false, error: 'Current password is incorrect' };
        } else if (errorCode === 'auth/weak-password') {
            console.error('New password is too weak');
            return { success: false, error: 'New password should be at least 6 characters' };
        } else if (errorCode === 'auth/requires-recent-login') {
            console.error('Please log in again before changing password');
            return { success: false, error: 'Please log in again before changing password' };
        } else {
            console.error(errorCode, errorMessage);
            return { success: false, error: errorMessage };
        }
    }
}

/**
 * Send password reset email to user
 * @param {string} email - Email address to send reset link to
 */
async function recoverPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent to', email);
        return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/user-not-found') {
            console.error('No account found with this email');
            return { success: false, error: 'No account found with this email' };
        } else if (errorCode === 'auth/invalid-email') {
            console.error('Invalid email address');
            return { success: false, error: 'Invalid email address' };
        } else if (errorCode === 'auth/too-many-requests') {
            console.error('Too many requests. Try again later');
            return { success: false, error: 'Too many requests. Please try again later' };
        } else {
            console.error(errorCode, errorMessage);
            return { success: false, error: errorMessage };
        }
    }
}

export { auth, emailSignup, emailLogin, googleLogin, phoneLogin, verifyPhoneOtp, logout, changePassword, recoverPassword };