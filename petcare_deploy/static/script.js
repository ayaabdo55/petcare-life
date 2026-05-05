
(async function initNav() {
  let loggedIn = false;
  let username = "";
  try {
    const res  = await fetch("/api/me");
    const data = await res.json();
    loggedIn   = data.loggedIn;
    username   = data.username || "";
  } catch (e) {}


  //check if logged in show .. and if not
  const navActions = document.getElementById("navActions");
  if (navActions) {
    if (loggedIn) {
      navActions.innerHTML = `
        <a href="/bookings" class="btn btn-outline btn-sm">My Bookings</a>
        <span style="font-size:0.85rem;font-weight:600;color:#076e6e;margin:0 6px;">👋 ${username}</span>
        <button onclick="logOut()" class="btn btn-primary btn-sm">Logout</button>`;
    } else {
      navActions.innerHTML =
        '<a href="/auth" class="btn btn-primary btn-sm">Login / Register</a>';
    }
  }

  // Show/hide Book buttons
  document.querySelectorAll(".book-btn").forEach(btn => {
    btn.style.display = loggedIn ? "" : "none";
  });
})();

//when logout
async function logOut() {
  await fetch("/api/logout", { method: "POST" });
  showToast("Logged out. See you soon! 🐾", "success");
  setTimeout(() => { window.location.href = "/"; }, 1200);
}


/* ═══════════════════════════════════════════
   CLINICS PAGE — load cards from MySQL
═══════════════════════════════════════════ */
//get clinics and show them
async function loadClinics() {
  const grid = document.getElementById("clinicsGrid");
  if (!grid) return;

  // Check login state for book buttons
  const meRes  = await fetch("/api/me"); //whos user
  const meData = await meRes.json();
  const loggedIn = meData.loggedIn; // loggedin?

  grid.innerHTML = '<p style="text-align:center;color:#5c7b7b;padding:40px;">Loading clinics…</p>';

  try {
    const res  = await fetch("/api/clinics"); //get clinics 
    const data = await res.json();
    if (!data.ok || !data.clinics.length) {
      grid.innerHTML = '<p style="text-align:center;color:#5c7b7b;padding:40px;">No clinics found.</p>';
      return;
    }
//html for each clinic
    grid.innerHTML = data.clinics.map(c => `
      <div class="card" data-category="${c.category}">
        <div class="card-header" style="background:linear-gradient(135deg,#e0f7f7,#b2ecec);">
          🏥
        </div>
        <div class="card-body">
          <span class="card-badge ${c.badge_color}">${c.badge}</span>
          <h3>${c.name}</h3>
          <div class="card-meta">
            <span>📍 ${c.address}</span>
            <span>📞 ${c.phone}</span>
            <span>⏰ ${c.hours}</span>
            <span>⭐ ${c.rating} (${c.reviews} reviews)</span>
          </div>
          <p class="card-desc">${c.description.substring(0, 150)}${c.description.length > 150 ? '...' : ''}</p>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick='openClinicModal(${JSON.stringify(c)})'>
              View Details
            </button>
            ${loggedIn ? `
            <button class="btn btn-outline btn-sm" onclick="openBookingModal('${c.name.replace(/'/g,"\\'")}')">
              Book
            </button>` : ""}
          </div>
        </div>
      </div>
    `).join("");

    // Re-init search after cards are rendered
    initSearch("searchClinics", "clinicsGrid", "No clinics found. Try a different search.");
  } catch (e) {
    grid.innerHTML = '<p style="text-align:center;color:#ff6b8a;padding:40px;">Could not load clinics.</p>';
  }
}

// view details
function openClinicModal(c) {
  openModal(c.name, {
    emoji: '🏥',
    rows: [
      { icon: "📍", label: "Address",  value: c.address  },
      { icon: "📞", label: "Phone",    value: c.phone    },
      { icon: "⏰", label: "Hours",    value: c.hours    },
      { icon: "🩺", label: "Services", value: c.services },
      { icon: "⭐", label: "Rating",   value: `${c.rating}/5 from ${c.reviews} reviews` }
    ]
  });
}


/* ═══════════════════════════════════════════
   STORES PAGE — load cards from MySQL
═══════════════════════════════════════════ */
async function loadStores() {
  const grid = document.getElementById("storesGrid");
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center;color:#5c7b7b;padding:40px;">Loading stores…</p>';

  try {
    const res  = await fetch("/api/stores"); //ask for stores
    const data = await res.json();
    if (!data.ok || !data.stores.length) {
      grid.innerHTML = '<p style="text-align:center;color:#5c7b7b;padding:40px;">No stores found.</p>';
      return;
    }
// create html store cards
    grid.innerHTML = data.stores.map(s => `
      <div class="card" data-category="${s.category}">
        <div class="card-header" style="background:linear-gradient(135deg,#ffe8ee,#ffc2cc);">
          🏪
        </div>
        <div class="card-body">
          <span class="card-badge ${s.badge_color}">${s.badge}</span>
          <h3>${s.name}</h3>
          <div class="card-meta">
            <span>📍 ${s.address}</span>
            <span>📞 ${s.phone}</span>
            <span>⏰ ${s.hours}</span>
            <span>⭐ ${s.rating} (${s.reviews} reviews)</span>
          </div>
          <p class="card-desc">${s.description.substring(0, 150)}${s.description.length > 150 ? '...' : ''}</p>
          <div class="card-actions">
            <button class="btn btn-pink btn-sm" onclick='openStoreModal(${JSON.stringify(s)})'>
              View Details
            </button>
          </div>
        </div>
      </div>
    `).join("");

    initSearch("searchStores", "storesGrid", "No stores found. Try a different search.");
  } catch (e) {
    grid.innerHTML = '<p style="text-align:center;color:#ff6b8a;padding:40px;">Could not load stores.</p>';
  }
}

function openStoreModal(s) {
  openModal(s.name, {
    emoji: '🏪',
    rows: [
      { icon: "📍", label: "Address",  value: s.address  },
      { icon: "📞", label: "Phone",    value: s.phone    },
      { icon: "⏰", label: "Hours",    value: s.hours    },
      { icon: "🛒", label: "Products", value: s.products },
      { icon: "⭐", label: "Rating",   value: `${s.rating}/5 from ${s.reviews} reviews` }
    ]
  });
}


/* ═══════════════════════════════════════════
   BOOKINGS PAGE — View / Edit / Delete
═══════════════════════════════════════════ */
async function loadMyBookings() {
  const container = document.getElementById("bookingsList"); //where theyll appear 
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;color:#5c7b7b;padding:40px;">Loading your bookings…</p>';

  const meRes  = await fetch("/api/me"); //logged in?
  const meData = await meRes.json();
  if (!meData.loggedIn) {
    showToast("Please login first.", "error");
    setTimeout(() => { window.location.href = "/"; }, 1200);
    return;
  }

  try {
    const res  = await fetch("/api/bookings");
    const data = await res.json();

    if (!data.ok || !data.bookings.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#5c7b7b;">
          <div style="font-size:3rem;margin-bottom:12px;">📋</div>
          <h3 style="margin-bottom:8px;">No bookings yet</h3>
          <p>Head over to <a href="/clinics" style="color:#0d9e9e;font-weight:600;">Clinics</a> to book your first appointment.</p>
        </div>`;
      return;
    }

    container.innerHTML = data.bookings.map(b => `
      <div class="booking-card" id="bcard-${b.id}">
        <div class="booking-card-header">
          <div>
            <h3>🏥 ${b.clinic_name}</h3>
            <span class="booking-date">📅 ${b.visit_date}</span>
          </div>
          <div class="booking-card-actions">
            <button class="btn btn-outline btn-sm" onclick="openEditBooking(${b.id},'${b.clinic_name.replace(/'/g,"\\'")}','${b.pet_name.replace(/'/g,"\\'")}','${b.pet_type}','${b.visit_date}',\`${b.reason.replace(/`/g,"\\`")}\`)">
              ✏️ Edit
            </button>
            <button class="btn btn-sm" style="background:#ff6b8a;color:white;" onclick="deleteBooking(${b.id})">
              🗑️ Delete
            </button>
          </div>
        </div>
        <div class="booking-card-body">
          <span>🐾 <strong>Pet:</strong> ${b.pet_name} (${b.pet_type})</span>
          <span>📝 <strong>Reason:</strong> ${b.reason}</span>
          <span style="font-size:0.76rem;color:#aaa;">Booked on: ${b.created_at ? b.created_at.split(" ")[0] : ""}</span>
        </div>
      </div>
    `).join("");
  } catch (e) {
    container.innerHTML = '<p style="text-align:center;color:#ff6b8a;padding:40px;">Could not load bookings.</p>';
  }
}
//open it put existed data in form
/* ── Edit booking modal ── */
function openEditBooking(id, clinicName, petName, petType, date, reason) {
  document.getElementById("editBookingId").value        = id;
  document.getElementById("editBookingClinic").textContent = clinicName;
  document.getElementById("editPetName").value          = petName;
  document.getElementById("editPetType").value          = petType;
  document.getElementById("editDate").value             = date;
  document.getElementById("editReason").value           = reason;
  document.getElementById("editBookingOverlay").style.display = "flex";
}

function closeEditBooking() {
  document.getElementById("editBookingOverlay").style.display = "none";
}

async function submitEditBooking() {
  const id       = document.getElementById("editBookingId").value;
  const petName  = document.getElementById("editPetName").value.trim();
  const petType  = document.getElementById("editPetType").value;
  const date     = document.getElementById("editDate").value;
  const reason   = document.getElementById("editReason").value.trim();

  if (!petName || !petType || !date || !reason) {
    showToast("Please fill in all fields.", "error"); return;
  }

  try {
    const res  = await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petName, petType, date, reason })
    });
    const data = await res.json();
    if (data.ok) {
      closeEditBooking();
      showToast("Booking updated! ✅", "success");
      loadMyBookings();
    } else {
      showToast(data.error || "Could not update.", "error");
    }
  } catch {
    showToast("Could not reach the server.", "error");
  }
}

/* ── Delete booking ── */
async function deleteBooking(id) {
  if (!confirm("Delete this booking?")) return;
  try {
    const res  = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      showToast("Booking deleted.", "success");
      const card = document.getElementById(`bcard-${id}`);
      if (card) card.remove();
      // Check if list is now empty
      const container = document.getElementById("bookingsList");
      if (container && !container.querySelector(".booking-card")) loadMyBookings();
    } else {
      showToast(data.error || "Could not delete.", "error");
    }
  } catch {
    showToast("Could not reach the server.", "error");
  }
}

/* Edit overlay close on backdrop click */
const editOverlay = document.getElementById("editBookingOverlay");
if (editOverlay) {
  editOverlay.addEventListener("click", e => {
    if (e.target === editOverlay) closeEditBooking();
  });
}


/* ═══════════════════════════════════════════
   BOOKING MODAL (from clinics page)
═══════════════════════════════════════════ */
document.querySelectorAll(".book-btn").forEach(btn => {
  btn.addEventListener("click", () => openBookingModal(btn.getAttribute("data-clinic")));
});

function openBookingModal(clinicName) {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("bookDate").min              = today;
  document.getElementById("bookingClinicName").textContent = clinicName;
  document.getElementById("bookPetName").value         = "";
  document.getElementById("bookPetType").value         = "";
  document.getElementById("bookDate").value            = "";
  document.getElementById("bookReason").value          = "";
  document.getElementById("bookingOverlay").style.display = "flex";
}

function closeBookingModal() {
  document.getElementById("bookingOverlay").style.display = "none";
}

const bookingOverlay = document.getElementById("bookingOverlay");
if (bookingOverlay) {
  bookingOverlay.addEventListener("click", e => {
    if (e.target === bookingOverlay) closeBookingModal();
  });
}

async function submitBooking() {
  const clinicName = document.getElementById("bookingClinicName").textContent;
  const petName    = document.getElementById("bookPetName").value.trim();
  const petType    = document.getElementById("bookPetType").value;
  const date       = document.getElementById("bookDate").value;
  const reason     = document.getElementById("bookReason").value.trim();

  if (!petName || !petType || !date || !reason) {
    showToast("Please fill in all fields.", "error"); return;
  }

  try {
    const res  = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicName, petName, petType, date, reason })
    });
    const data = await res.json();
    if (data.ok) {
      closeBookingModal();
      showToast("Appointment booked! 🐾", "success");
    } else if (res.status === 401) {
      showToast("Please login first.", "error");
      setTimeout(() => { window.location.href = "/auth"; }, 1200);
    } else {
      showToast(data.error || "Could not save booking.", "error");
    }
  } catch {
    showToast("Could not reach the server.", "error");
  }
}


/* ═══════════════════════════════════════════
   AUTH FORMS
═══════════════════════════════════════════ */
const loginFormEl = document.getElementById("loginFormEl");
if (loginFormEl) {
  loginFormEl.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors("loginEmail","loginPass");
    const email = document.getElementById("loginEmail").value.trim();
    const pass  = document.getElementById("loginPass").value;
    let hasErr  = false;
    if (!email)              { setError("loginEmail","Email is required");     hasErr = true; }
    else if (!isValidEmail(email)) { setError("loginEmail","Enter a valid email"); hasErr = true; }
    if (!pass)               { setError("loginPass","Password is required");   hasErr = true; }
    else if (pass.length < 6){ setError("loginPass","At least 6 characters"); hasErr = true; }
    if (hasErr) return;

    try {
      const res  = await fetch("/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Welcome back, ${data.username}! 🐾`, "success");
        setTimeout(() => { window.location.href = "/"; }, 1200);
      } else {
        showToast(data.error || "Login failed.", "error");
      }
    } catch { showToast("Could not reach the server.", "error"); }
  });
}

const registerFormEl = document.getElementById("registerFormEl");
if (registerFormEl) {
  registerFormEl.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors("regName","regEmail","regPass","regConfirm");
    const name  = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass  = document.getElementById("regPass").value;
    const conf  = document.getElementById("regConfirm").value;
    let hasErr  = false;
    if (!name)                { setError("regName","Username is required");       hasErr = true; }
    else if (name.length < 3) { setError("regName","At least 3 characters");      hasErr = true; }
    if (!email)               { setError("regEmail","Email is required");          hasErr = true; }
    else if (!isValidEmail(email)) { setError("regEmail","Enter a valid email");   hasErr = true; }
    if (!pass)                { setError("regPass","Password is required");        hasErr = true; }
    else if (pass.length < 6) { setError("regPass","At least 6 characters");       hasErr = true; }
    if (!conf)                { setError("regConfirm","Please confirm password");  hasErr = true; }
    else if (pass !== conf)   { setError("regConfirm","Passwords do not match");   hasErr = true; }
    if (hasErr) return;

    try {
      const res  = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password: pass })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Account created! Welcome, ${data.username} 🐶`, "success");
        setTimeout(() => { window.location.href = "/"; }, 1200);
      } else {
        showToast(data.error || "Registration failed.", "error");
      }
    } catch { showToast("Could not reach the server.", "error"); }
  });
}

function switchToRegister() { document.querySelectorAll(".auth-tab")[1].click(); }
function switchToLogin()     { document.querySelectorAll(".auth-tab")[0].click(); }

const authTabs  = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
if (authTabs.length) {
  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      authTabs.forEach(t => t.classList.remove("active"));
      authForms.forEach(f => f.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });
}


/* ═══════════════════════════════════════════
   SEARCH / FILTER
═══════════════════════════════════════════ */
function initSearch(inputId, gridId, emptyMsg = "No results found 🐾") {
  const input = document.getElementById(inputId);
  const grid  = document.getElementById(gridId);
  if (!input || !grid) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const cards = Array.from(grid.querySelectorAll(".card"));
    let visible = 0;
    cards.forEach(card => {
      const show = card.textContent.toLowerCase().includes(q);
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    const noRes = grid.querySelector(".no-results");
    if (!visible) {
      if (!noRes) grid.insertAdjacentHTML("beforeend",
        `<div class="no-results"><span class="emoji">🔍</span>${emptyMsg}</div>`);
    } else {
      if (noRes) noRes.remove();
    }
  });
}


/* ═══════════════════════════════════════════
   CARD DETAIL MODAL
═══════════════════════════════════════════ */
function openModal(name, info) {
  let overlay = document.getElementById("detailModal");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "detailModal";
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9000;
      display:flex;align-items:center;justify-content:center;padding:20px;
      backdrop-filter:blur(4px);`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  }
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:36px;max-width:480px;width:100%;
         box-shadow:0 16px 60px rgba(0,0,0,0.2);position:relative;animation:popIn .28s ease">
      <button onclick="document.getElementById('detailModal').remove()"
        style="position:absolute;top:16px;right:18px;background:none;border:none;
               font-size:1.4rem;cursor:pointer;color:#5C7B7B;">✕</button>
      <div style="font-size:3rem;margin-bottom:14px;">${info.emoji}</div>
      <h2 style="font-size:1.4rem;font-weight:800;margin-bottom:8px;">${name}</h2>
      ${info.rows.map(r => `
        <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;
             border-bottom:1px solid #D6EEEE;font-size:0.88rem;color:#5C7B7B;">
          <span>${r.icon}</span>
          <span><strong style="color:#1A2E2E;">${r.label}:</strong> ${r.value}</span>
        </div>`).join("")}
      <button onclick="document.getElementById('detailModal').remove()"
        style="margin-top:22px;padding:11px 28px;background:linear-gradient(135deg,#0D9E9E,#076E6E);
               color:#fff;border:none;border-radius:99px;font-family:'Poppins',sans-serif;
               font-size:0.9rem;font-weight:600;cursor:pointer;width:100%;">Close</button>
    </div>`;
  if (!document.getElementById("popInKF")) {
    const s = document.createElement("style");
    s.id = "popInKF";
    s.textContent = "@keyframes popIn{from{transform:scale(.88);opacity:0}to{transform:scale(1);opacity:1}}";
    document.head.appendChild(s);
  }
}


/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function setError(inputId, msg) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(inputId + "Error");
  if (!input) return;
  input.classList.toggle("error", !!msg);
  if (err) err.textContent = msg || "";
}
function clearErrors(...ids) { ids.forEach(id => setError(id, "")); }

function showToast(msg, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3400);
}

