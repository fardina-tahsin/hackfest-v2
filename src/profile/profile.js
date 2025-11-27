import { fireApp } from "../../firebase-config.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth";
import { saveUserProfile, getUserProfile } from "./db.js";

const auth = getAuth(fireApp);
let currentUser = null;

// DOM Elements
const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const displayNameCell = document.getElementById("display-name");
const tableEmailCell = document.getElementById("table-email");
const phoneCell = document.getElementById("phone");
const bioCell = document.getElementById("bio");
const createdAtCell = document.getElementById("created-at");
const editBtn = document.getElementById("edit-profile-btn");
const logoutBtn = document.getElementById("logout-btn");

// Modal elements
const modal = document.getElementById("edit-modal");
const editName = document.getElementById("edit-name");
const editEmail = document.getElementById("edit-email");
const editBio = document.getElementById("edit-bio");
const editPhone = document.getElementById("edit-phone");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Check auth state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserProfile(user);
    } else {
        window.location.href = "../auth/login.html";
    }
});

async function loadUserProfile(user) {
    profileName.textContent = user.displayName || "User";
    profileEmail.textContent = user.email || "";
    profileAvatar.src = user.photoURL || "https://via.placeholder.com/100";
    
    // Load extra data from Firestore
    const profile = await getUserProfile(user.uid);
    
    displayNameCell.textContent = user.displayName || "—";
    tableEmailCell.textContent = user.email || "—";
    phoneCell.textContent = profile?.phone || user.phoneNumber || "—";
    bioCell.textContent = profile?.bio || "—";
    createdAtCell.textContent = user.metadata?.creationTime 
        ? new Date(user.metadata.creationTime).toLocaleDateString() 
        : "—";
}

// Open edit modal
editBtn.addEventListener("click", async () => {
    const profile = await getUserProfile(currentUser.uid);
    editName.value = currentUser.displayName || "";
    editEmail.value = currentUser.email || "";
    editBio.value = profile?.bio || "";
    editPhone.value = profile?.phone || "";
    modal.classList.remove("hidden");
});

// Cancel
cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Save
saveBtn.addEventListener("click", async () => {
    try {
        // Update Firebase Auth display name
        await updateProfile(currentUser, { displayName: editName.value });
        
        // Update email if changed and valid
        const newEmail = editEmail.value.trim();
        if (newEmail && newEmail !== currentUser.email) {
            try {
                // Send verification to new email first
                await verifyBeforeUpdateEmail(currentUser, newEmail);
                alert("Verification email sent to " + newEmail + ". Please verify to complete the email change.");
            } catch (emailError) {
                if (emailError.code === "auth/requires-recent-login") {
                    alert("Please log out and log back in to change your email.");
                } else {
                    throw emailError;
                }
            }
        }
        
        // Save extra fields to Firestore
        await saveUserProfile(currentUser.uid, {
            bio: editBio.value,
            phone: editPhone.value
        });
        
        modal.classList.add("hidden");
        await loadUserProfile(currentUser);
    } catch (error) {
        console.error("Save error:", error);
        alert("Error saving profile: " + error.message);
    }
});

// Logout
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../auth/login.html";
    } catch (error) {
        console.error("Logout error:", error);
    }
});
