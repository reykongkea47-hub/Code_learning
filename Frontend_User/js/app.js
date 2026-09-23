const API_BASE = "http://localhost:8000";

async function apiRequest(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

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

/* ---------- Signup ---------- */
const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = document.getElementById("form-msg");

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            await apiRequest("/api/auth/register.php", {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
            });

            showMsg(msg, "Account created — redirecting to login...", "success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } catch (err) {
            showMsg(msg, err.message);
        }
    });
}

/* ---------- Login ---------- */
const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = document.getElementById("form-msg");

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const data = await apiRequest("/api/auth/login.php", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            if (!data.user) {
                throw new Error("User information not found");
            }

            localStorage.setItem("user", JSON.stringify(data.user));

            showMsg(msg, "Logged in — redirecting...", "success");

            setTimeout(() => {
                window.location.href = "2.html";
            }, 800);
        } catch (err) {
            showMsg(msg, err.message);
        }
    });
}

/* ---------- Course Grid ---------- */
const courseGrid = document.getElementById("course-grid");

if (courseGrid) {
    apiRequest("/api/courses/index.php")
        .then((data) => {
            if (!data.courses || !data.courses.length) {
                courseGrid.innerHTML = `
                    <p class="empty-state">No courses published yet</p>
                `;
                return;
            }

            courseGrid.innerHTML = data.courses
                .map(
                    (c) => `
                        <div class="course-card">
                            <h3>${escapeHtml(c.title)}</h3>
                            <p>${escapeHtml(c.description || "")}</p>
                            ${
                                c.instructor
                                    ? `<span class="instructor">taught by ${escapeHtml(c.instructor)}</span>`
                                    : ""
                            }
                        </div>
                    `
                )
                .join("");
        })
        .catch(() => {
            courseGrid.innerHTML = `
                <p class="empty-state">Could not load courses — is the API running?</p>
            `;
        });
}

/* ---------- Navbar Auto-Render ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const navCta = document.getElementById("nav-cta");
    if (!navCta) return;

    const user = JSON.parse(
        localStorage.getItem("user") ||
        localStorage.getItem("code_learning_current_user") ||
        "null"
    );

    if (!user) {
        navCta.innerHTML = `
            <a href="login.html" class="btn-login">
                <i class="fas fa-sign-in-alt"></i> Log in
            </a>
            <a href="SingUp.html" class="btn-signup">
                <i class="fas fa-user-plus"></i> Sign up
            </a>
        `;
        return;
    }

    const initial = (user.name || "U").charAt(0).toUpperCase();
    navCta.innerHTML = `
        <div class="nav-user" id="navUser">
            <button class="nav-user-btn" id="navUserBtn">
                <span class="nav-user-avatar">${initial}</span>
                <span class="nav-user-name">${user.name || "User"}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="nav-dropdown">
                <div class="dropdown-header">
                    <div class="u-avatar">${initial}</div>
                    <div class="u-info">
                        <strong>${user.name || "User"}</strong>
                        <small>${user.email || ""}</small>
                    </div>
                </div>
                <ul class="dropdown-menu">
                    <li><a href="profile.html"><i class="fas fa-user"></i> My Profile</a></li>
                    <li><a href="UserDashboard.html"><i class="fas fa-chart-pie"></i> Dashboard</a></li>
                    <li><a href="#"><i class="fas fa-book-open"></i> My Courses</a></li>
                    <li><a href="#"><i class="fas fa-cog"></i> Settings</a></li>
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

    const wrap = document.getElementById("navUser");
    document.getElementById("navUserBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        wrap.classList.toggle("open");
    });
    document.addEventListener("click", () => wrap.classList.remove("open"));

    document.getElementById("logout-btn").addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Log out?")) {
            localStorage.removeItem("user");
            localStorage.removeItem("code_learning_current_user");
            window.location.href = "index.html";
        }
    });
});
