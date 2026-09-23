const API_BASE = "http://localhost:8000";

async function apiRequest(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
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
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
}

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
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!data.user || data.user.role !== "admin") {
                showMsg(msg, "This account does not have admin access");
                return;
            }

            localStorage.setItem("admin", JSON.stringify(data.user));

            showMsg(
                msg,
                "Logged in — redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (err) {
            showMsg(msg, err.message);
        }
    });
}

const courseTableBody = document.getElementById("course-table-body");

if (courseTableBody) {
    const admin = JSON.parse(
        localStorage.getItem("admin") || "null"
    );

    if (!admin) {
        window.location.href = "login.html";
    } else {
        const adminName = document.getElementById("admin-name");

        if (adminName) {
            adminName.textContent = admin.name || "Admin";
        }

        loadCourses();
        loadUsers();
    }

    document
        .getElementById("logout-link")
        ?.addEventListener("click", async (e) => {
            e.preventDefault();

            await apiRequest("/api/auth/logout.php", {
                method: "POST",
            }).catch(() => {});

            localStorage.removeItem("admin");

            window.location.href = "login.html";
        });

    document
        .getElementById("add-course-form")
        ?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const msg = document.getElementById("course-form-msg");

            const title = document
                .getElementById("title")
                .value
                .trim();

            const description = document
                .getElementById("description")
                .value
                .trim();

            const instructor = document
                .getElementById("instructor")
                .value
                .trim();

            try {
                await apiRequest("/api/courses/index.php", {
                    method: "POST",
                    body: JSON.stringify({
                        title: title,
                        description: description,
                        instructor: instructor,
                    }),
                });

                showMsg(
                    msg,
                    "Course added",
                    "success"
                );

                e.target.reset();

                loadCourses();

            } catch (err) {
                showMsg(msg, err.message);
            }
        });
}

function loadCourses() {
    apiRequest("/api/courses/index.php")
        .then((data) => {
            if (!data.courses || !data.courses.length) {
                courseTableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            No courses yet
                        </td>
                    </tr>
                `;
                return;
            }

            courseTableBody.innerHTML = data.courses
                .map(
                    (c) => `
                        <tr>
                            <td>
                                ${escapeHtml(c.id ?? "—")}
                            </td>

                            <td>
                                ${escapeHtml(c.title)}
                            </td>

                            <td>
                                ${escapeHtml(c.instructor || "—")}
                            </td>

                            <td>
                                ${escapeHtml(c.description || "—")}
                            </td>
                        </tr>
                    `
                )
                .join("");
        })
        .catch((err) => {
            console.error("Failed to load courses:", err);

            courseTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        Could not load courses
                    </td>
                </tr>
            `;
        });
}

function loadUsers() {
    apiRequest("/api/admin/users.php")
        .then((data) => {
            console.log("Users API:", data);

            const users = data.users || [];

            const totalUsers =
                document.getElementById("total-users");

            if (totalUsers) {
                totalUsers.textContent = users.length;
            }

            const usersTableBody =
                document.getElementById("users-table-body");

            if (usersTableBody) {
                if (!users.length) {
                    usersTableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="empty-state">
                                No users yet
                            </td>
                        </tr>
                    `;
                } else {
                    usersTableBody.innerHTML = users
                        .map(
                            (user) => `
                                <tr>
                                    <td>
                                        ${escapeHtml(user.id)}
                                    </td>

                                    <td>
                                        <div class="user-cell">
                                            <div class="user-avatar">
                                                ${escapeHtml(
                                                    (user.name || "U")
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </div>
                                            ${escapeHtml(user.name)}
                                        </div>
                                    </td>

                                    <td>
                                        ${escapeHtml(user.email)}
                                    </td>

                                    <td>
                                        <span class="badge badge-success">
                                            ${escapeHtml(user.role)}
                                        </span>
                                    </td>

                                    <td>
                                        <span class="badge badge-success">
                                            Active
                                        </span>
                                    </td>

                                    <td>
                                        —
                                    </td>
                                </tr>
                            `
                        )
                        .join("");
                }
            }

            const recentUsersBody =
                document.getElementById("recent-users-body");

            if (recentUsersBody) {
                if (!users.length) {
                    recentUsersBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="empty-state">
                                No users yet
                            </td>
                        </tr>
                    `;
                } else {
                    recentUsersBody.innerHTML = users
                        .slice(0, 5)
                        .map(
                            (user) => `
                                <tr>
                                    <td>
                                        <div class="user-cell">
                                            <div class="user-avatar">
                                                ${escapeHtml(
                                                    (user.name || "U")
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </div>
                                            ${escapeHtml(user.name)}
                                        </div>
                                    </td>

                                    <td>
                                        ${escapeHtml(user.email)}
                                    </td>

                                    <td>
                                        <span class="badge badge-success">
                                            ${escapeHtml(user.role)}
                                        </span>
                                    </td>

                                    <td>
                                        <span class="badge badge-success">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            `
                        )
                        .join("");
                }
            }

            createUserChart(users);

        })
        .catch((err) => {
            console.error("Failed to load users:", err);

            const totalUsers =
                document.getElementById("total-users");

            if (totalUsers) {
                totalUsers.textContent = "0";
            }

            const usersTableBody =
                document.getElementById("users-table-body");

            if (usersTableBody) {
                usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            Could not load users
                        </td>
                    </tr>
                `;
            }

            const recentUsersBody =
                document.getElementById("recent-users-body");

            if (recentUsersBody) {
                recentUsersBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            Could not load users
                        </td>
                    </tr>
                `;
            }
        });
}

function createUserChart(users) {
    const canvas = document.getElementById("userChart");

    if (!canvas) {
        return;
    }

    const userCount = users.filter(
        (user) => user.role === "user"
    ).length;

    const adminCount = users.filter(
        (user) => user.role === "admin"
    ).length;

    if (window.userChart instanceof Chart) {
        window.userChart.destroy();
    }

    window.userChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Users", "Admins"],
            datasets: [
                {
                    data: [userCount, adminCount],
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}
