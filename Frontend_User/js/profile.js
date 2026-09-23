/* ============================================================
   PROFILE PAGE SCRIPT — Code_Learning
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(
        localStorage.getItem("user") ||
        localStorage.getItem("code_learning_current_user") ||
        "null"
    );

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    updateNavbar(user);
    loadProfile(user);
    setupTabs();
    setupSettingsForm(user);
    setupDeleteAccount(user);
});

/* ============================================================
   1. NAVBAR WITH USER PROFILE DROPDOWN
   ============================================================ */
function updateNavbar(user) {
    const navCta = document.getElementById("nav-cta");
    if (!navCta) return;

    const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
    const avatarStyle = user.avatar
        ? `background-image: url('${user.avatar}');`
        : "";

    navCta.innerHTML = `
        <div class="nav-user" id="navUser">
            <button class="nav-user-btn" id="navUserBtn" aria-label="User menu">
                <span class="nav-user-avatar" style="${avatarStyle}">
                    ${user.avatar ? "" : initial}
                </span>
                <span class="nav-user-name">${escapeHtml(user.name || "User")}</span>
                <i class="fas fa-chevron-down"></i>
            </button>

            <div class="nav-dropdown">
                <div class="dropdown-header">
                    <div class="u-avatar" style="${avatarStyle}">
                        ${user.avatar ? "" : initial}
                    </div>
                    <div class="u-info">
                        <strong>${escapeHtml(user.name || "User")}</strong>
                        <small>${escapeHtml(user.email || "")}</small>
                    </div>
                </div>

                <ul class="dropdown-menu">
                    <li>
                        <a href="profile.html">
                            <i class="fas fa-user"></i> My Profile
                        </a>
                    </li>
                    <li>
                        <a href="UserDashboard.html">
                            <i class="fas fa-chart-pie"></i> Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class="fas fa-book-open"></i> My Courses
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <i class="fas fa-cog"></i> Settings
                        </a>
                    </li>
                    <li><div class="dropdown-divider"></div></li>
                    <li>
                        <a href="#" class="logout" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Log out
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;

    const userWrap = document.getElementById("navUser");
    const userBtn = document.getElementById("navUserBtn");

    userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userWrap.classList.toggle("open");
    });

    document.addEventListener("click", () => {
        userWrap.classList.remove("open");
    });

    userWrap.querySelector(".nav-dropdown").addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        logout();
    });
}

/* ============================================================
   2. LOAD PROFILE DATA
   ============================================================ */
function loadProfile(user) {
    const nameEl = document.getElementById("profile-name");
    const emailEl = document.getElementById("profile-email");
    const joinedEl = document.getElementById("profile-joined");

    if (nameEl) nameEl.textContent = user.name || "User";
    if (emailEl) emailEl.textContent = user.email || "";

    if (joinedEl && user.joined) {
        const date = new Date(user.joined);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        joinedEl.textContent = `Member since ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
    const profileAvatar = document.getElementById("profile-avatar");
    if (profileAvatar) profileAvatar.textContent = initial;

    loadStats(user.id);
    loadUserCourses(user.id);
    loadProgress(user.id);

    const settingsName = document.getElementById("settings-name");
    const settingsEmail = document.getElementById("settings-email");
    if (settingsName) settingsName.value = user.name || "";
    if (settingsEmail) settingsEmail.value = user.email || "";
}

/* ============================================================
   3. STATS
   ============================================================ */
function loadStats(userId) {
    const stats = JSON.parse(localStorage.getItem(`user_stats_${userId}`) || "{}");

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    set("stat-courses", stats.courses || 0);
    set("stat-projects", stats.projects || 0);
    set("stat-achievements", stats.achievements || 0);
    set("stat-hours", stats.hours ? `${stats.hours}h` : "0h");
}

/* ============================================================
   4. USER COURSES
   ============================================================ */
function loadUserCourses(userId) {
    const grid = document.getElementById("course-grid");
    if (!grid) return;

    const courses = JSON.parse(localStorage.getItem(`user_courses_${userId}`) || "[]");

    if (!courses.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No courses yet</h3>
                <p>Start learning by enrolling in a course</p>
                <a href="index.html" class="btn-primary">Browse Courses</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = courses.map((course) => `
        <div class="course-card">
            <div class="course-thumb ${escapeHtml(course.category || "")}">
                <i class="fas ${escapeHtml(course.icon || "fa-code")}"></i>
            </div>
            <div class="course-info">
                <h4>${escapeHtml(course.title || "")}</h4>
                <div class="progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${course.progress || 0}%</span>
                </div>
                <small>${course.lessons || 0} lessons · ${escapeHtml(course.duration || "")}</small>
            </div>
            <button class="btn-continue" data-course="${course.id}">Continue</button>
        </div>
    `).join("");
}

/* ============================================================
   5. USER PROGRESS
   ============================================================ */
function loadProgress(userId) {
    const list = document.getElementById("progress-list");
    if (!list) return;

    const progress = JSON.parse(localStorage.getItem(`user_progress_${userId}`) || "[]");

    if (!progress.length) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-line"></i>
                <h3>No progress yet</h3>
                <p>Complete lessons to see your progress</p>
            </div>
        `;
        return;
    }

    list.innerHTML = progress.map((p) => `
        <div class="progress-item">
            <div class="progress-item-info">
                <h4>${escapeHtml(p.courseTitle || "")}</h4>
                <p>Lesson ${p.lesson || 0} of ${p.totalLessons || 0} · ${escapeHtml(p.topic || "")}</p>
            </div>
            <div class="progress-item-bar">
                <div class="progress-fill" style="width: ${p.percent || 0}%"></div>
            </div>
            <span class="progress-percent">${p.percent || 0}%</span>
        </div>
    `).join("");
}

/* ============================================================
   6. TABS
   ============================================================ */
function setupTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const panes = document.querySelectorAll(".tab-pane");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            panes.forEach((p) => p.classList.remove("active"));

            tab.classList.add("active");
            const pane = document.getElementById(`tab-${tab.dataset.tab}`);
            if (pane) pane.classList.add("active");
        });
    });
}

/* ============================================================
   7. SETTINGS FORM
   ============================================================ */
function setupSettingsForm(user) {
    const form = document.getElementById("settings-form");
    const msg = document.getElementById("settings-msg");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("settings-name").value.trim();
        const email = document.getElementById("settings-email").value.trim();
        const password = document.getElementById("settings-password").value;

        if (!name || !email) {
            showMsg(msg, "Name and email are required", "error");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMsg(msg, "Please enter a valid email", "error");
            return;
        }

        const updatedUser = { ...user, name, email };
        if (password) updatedUser.password = password;

        localStorage.setItem("code_learning_current_user", JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        const users = JSON.parse(localStorage.getItem("code_learning_users") || "[]");
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...updatedUser };
            localStorage.setItem("code_learning_users", JSON.stringify(users));
        }

        showMsg(msg, "Settings saved successfully!", "success");

        const profileName = document.getElementById("profile-name");
        const profileEmail = document.getElementById("profile-email");
        const profileAvatar = document.getElementById("profile-avatar");
        const navName = document.querySelector(".nav-user-name");
        const navAvatar = document.querySelector(".nav-user-avatar");

        if (profileName) profileName.textContent = name;
        if (profileEmail) profileEmail.textContent = email;
        if (profileAvatar) profileAvatar.textContent = name.charAt(0).toUpperCase();
        if (navName) navName.textContent = name;
        if (navAvatar) navAvatar.textContent = name.charAt(0).toUpperCase();

        document.getElementById("settings-password").value = "";

        setTimeout(() => {
            if (msg) msg.className = "form-msg";
        }, 3000);
    });
}

/* ============================================================
   8. DELETE ACCOUNT
   ============================================================ */
function setupDeleteAccount(user) {
    const btn = document.getElementById("delete-account");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

        const users = JSON.parse(localStorage.getItem("code_learning_users") || "[]");
        const filtered = users.filter((u) => u.id !== user.id);
        localStorage.setItem("code_learning_users", JSON.stringify(filtered));

        localStorage.removeItem("user");
        localStorage.removeItem("code_learning_current_user");
        localStorage.removeItem(`user_stats_${user.id}`);
        localStorage.removeItem(`user_courses_${user.id}`);
        localStorage.removeItem(`user_progress_${user.id}`);

        alert("Account deleted. Redirecting to home...");
        window.location.href = "index.html";
    });
}

/* ============================================================
   9. LOGOUT
   ============================================================ */
function logout() {
    if (!confirm("Are you sure you want to log out?")) return;

    localStorage.removeItem("user");
    localStorage.removeItem("code_learning_current_user");
    window.location.href = "index.html";
}

/* ============================================================
   10. HELPERS
   ============================================================ */
function showMsg(el, text, type = "error") {
    if (!el) return;
    el.textContent = text;
    el.className = `form-msg ${type}`;
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
