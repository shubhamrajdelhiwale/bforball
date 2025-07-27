document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll("[data-include]");

  includes.forEach(async (el) => {
    const file = el.getAttribute("data-include");
    if (file) {
      const res = await fetch(file);
      const html = await res.text();
      el.innerHTML = html;

      // Force wait after loading HTML
      setTimeout(() => {
        updateAuthUI();
        highlightActiveNavLink();
      }, 50);
    }
  });
});

function highlightActiveNavLink() {
  const currentPage = location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll("nav a");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("text-yellow-400", "border-b-2");
    } else {
      link.classList.remove("text-yellow-400", "border-b-2");
    }
  });
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = decodeURIComponent(atob(base64Url).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  return JSON.parse(base64);
}

function handleCredentialResponse(response) {
  const user = parseJwt(response.credential);
  console.log("👤 User logged in:", user);

  localStorage.setItem("user", JSON.stringify(user));

  db.collection("users").doc(user.email).set({
    name: user.name,
    email: user.email,
    picture: user.picture,
    loginAt: new Date()
  }).then(() => {
    console.log("✅ User saved to Firebase:", user.email);
    // ✅ Safe Blogger redirect
    window.location.replace("/");
  }).catch((error) => {
    console.error("❌ Error saving user:", error);
  });
}
window.handleCredentialResponse = handleCredentialResponse; // 👈 Important for Google API


function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("updateAuthUI called: user =", user);

  const signInBtn = document.getElementById("signInBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileBtn = document.getElementById("profileBtn");

  if (!signInBtn || !logoutBtn) {
    console.warn("Buttons not found in DOM.");
    return;
  }

  if (user) {
    console.log("User logged in: hiding signIn, showing profile, showing logout");
    // Force-hide signIn and show logout
    signInBtn.style.display = "none";
    logoutBtn.style.display = "inline-flex";
    profileBtn.style.display = "inline-flex";
  } else {
    console.log("User NOT logged in: showing signIn, hiding profile, hiding logout");
    signInBtn.style.display = "inline-flex";
    logoutBtn.style.display = "none";
    profileBtn.style.display = "none";
  }
}









function handleCredentialResponse(response) {
  const user = parseJwt(response.credential);
  console.log("👤 User logged in:", user);

  db.collection("users").doc(user.email).set({
    name: user.name,
    email: user.email,
    picture: user.picture,
    loginAt: new Date()
  }).then(() => {
    console.log("✅ User saved to Firebase:", user.email);
  }).catch((error) => {
    console.error("❌ Error saving user:", error);
  });
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

console.log("✅ includes.js loaded");

// ✅ Parse JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

// ✅ Handle Login
function handleCredentialResponse(response) {
  const user = parseJwt(response.credential);
  console.log("👤 User logged in:", user);

  localStorage.setItem("user", JSON.stringify(user));

  // ✅ Redirect after login
  window.location.replace("index.html"); // ← Blogger-safe
}
window.handleCredentialResponse = handleCredentialResponse;

function logout() {
  console.log("Logging out...");
  localStorage.removeItem("user");
  window.location.replace("login.html"); // 🔁 Same redirect method
}

// button hide and visible in login logout 
window.onload = function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // For login-only buttons
  document.querySelectorAll(".show-if-logged-in").forEach(el => {
    el.style.display = isLoggedIn ? "block" : "none";
  });

  // For logout-only buttons
  document.querySelectorAll(".show-if-logged-out").forEach(el => {
    el.style.display = isLoggedIn ? "none" : "block";
  });
};


// pull to refresh function 
let startY = 0;
let isPulledDown = false;

window.addEventListener("touchstart", function (e) {
  startY = e.touches[0].clientY;
}, false);

window.addEventListener("touchmove", function (e) {
  const currentY = e.touches[0].clientY;

  if (window.scrollY === 0 && currentY - startY > 50) {
    // Show loading indicator
    document.getElementById("pullDownIndicator").classList.remove("hidden");
    isPulledDown = true;
  }
}, false);

window.addEventListener("touchend", function () {
  if (isPulledDown) {
    // Wait for a short time, then reload
    setTimeout(() => {
      location.reload();
    }, 600);
  }
}, false);



// create community     


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const nameInput = form.querySelector("input[type='text']");
  const descInput = form.querySelector("textarea");
  const selectInput = form.querySelector("select");
  const goalInput = form.querySelectorAll("input[type='text']")[1];

  const communityList = document.querySelector("h2.text-lg.text-blue-800.mb-2").nextElementSibling;

  // Helper: create list item with delete icon
  function createCommunityItem(name) {
    const li = document.createElement("li");
    li.className = "relative group flex justify-between items-center";

    const text = document.createElement("span");
    text.textContent = `#${name.replace(/\s+/g, "_")}`;

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "❌";
    deleteBtn.className = "text-red-500 text-xs ml-2 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200";

    deleteBtn.addEventListener("click", () => {
      li.remove(); // remove the community
    });

    li.appendChild(text);
    li.appendChild(deleteBtn);

    return li;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const type = selectInput.value;
    const goal = goalInput.value.trim();

    if (!name || !description || !goal) {
      alert("Please fill in all fields.");
      return;
    }

    const newCommunity = createCommunityItem(name);
    communityList.appendChild(newCommunity);

    form.reset();
  });

  // Add delete to existing items
  const existingItems = communityList.querySelectorAll("li");
  existingItems.forEach((li) => {
    const name = li.textContent.replace("#", "");
    const newLi = createCommunityItem(name);
    li.replaceWith(newLi);
  });
});



// for startups section
const video = document.getElementById('video1');

// Trigger fullscreen if landscape on mobile
function handleOrientation() {
  if (window.innerWidth < 768) { // Small screen
    if (window.innerWidth > window.innerHeight) {
      // Landscape
      if (!document.fullscreenElement) {
        video.requestFullscreen().catch(err => {
          console.log("Fullscreen error:", err);
        });
      }
    } else {
      // Portrait - Exit fullscreen if needed
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }
}

// Listen to orientation changes
window.addEventListener('orientationchange', handleOrientation);
window.addEventListener('resize', handleOrientation);


// profile page sections js 
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active styles
    tabButtons.forEach(b => b.classList.remove('text-red-600', 'border-b-2', 'border-red-600', 'active-tab'));
    tabContents.forEach(content => content.classList.add('hidden'));

    // Add to clicked
    btn.classList.add('text-red-600', 'border-b-2', 'border-red-600', 'active-tab');
    const target = document.getElementById(`tab-${btn.dataset.tab}`);
    target.classList.remove('hidden');
  });
});


// submit suggestion demo value after submission 
// Handle form submission (demo only)
document.getElementById("suggestionForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("successMsg").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("successMsg").classList.add("hidden");
    this.reset();
  }, 5000);
});


// JS 404 Redirect Handler
const validPages = [
  "index.html",
  "contact.html",
  "suggestion.html",
  "about.html",
  "profile.html",
  "404.html"
  // add all your actual pages here
];

// Get current page filename
const path = window.location.pathname.split("/").pop() || "index.html";

// Check if the file is in valid list
if (!validPages.includes(path)) {
  window.location.href = "404.html";
}
