
const API_BASE = "http://127.0.0.1:8000";

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

function showMsg(element, text, type = "error") {
    if (!element) return;

    element.textContent = text;
    element.className = `form-msg ${type}`;
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function getAdmin() {
    try {
        return JSON.parse(localStorage.getItem("admin") || "null");
    } catch {
        return null;
    }
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const message = document.getElementById("form-msg");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput?.value.trim() || "";
        const password = passwordInput?.value || "";

        if (!email || !password) {
            showMsg(message, "Please enter email and password");
            return;
        }

        try {
            const data = await apiRequest("/api/admin/auth/login.php", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!data.user) {
                throw new Error("User information was not returned");
            }

            if (data.user.role !== "admin") {
                showMsg(
                    message,
                    "This account does not have admin access"
                );
                return;
            }

            localStorage.setItem(
                "admin",
                JSON.stringify(data.user)
            );

            showMsg(
                message,
                "Login successful. Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (error) {
            console.error("Login error:", error);
            showMsg(message, error.message || "Failed to fetch");
        }
    });
}

const courseTableBody = document.getElementById("course-table-body");

if (courseTableBody) {
    const admin = getAdmin();

    if (!admin || admin.role !== "admin") {
        window.location.href = "login.html";
    } else {
        const adminName = document.getElementById("admin-name");
        const adminAvatar = document.getElementById("admin-avatar");

        if (adminName) {
            adminName.textContent = admin.name || "Admin";
        }

        if (adminAvatar) {
            adminAvatar.textContent = (admin.name || "A")
                .charAt(0)
                .toUpperCase();
        }

        loadUsers();
        loadCourses();
    }

    const logoutLink = document.getElementById("logout-link");

    if (logoutLink) {
        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                await apiRequest("/api/admin/auth/logout.php", {
                    method: "POST"
                });
            } catch (error) {
                console.warn("Logout API error:", error);
            }

            localStorage.removeItem("admin");
            window.location.href = "login.html";
        });
    }

    const addCourseForm = document.getElementById("add-course-form");

    if (addCourseForm) {
        addCourseForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const message = document.getElementById("course-form-msg");
            const title = document.getElementById("title")?.value.trim() || "";
            const instructor = document.getElementById("instructor")?.value.trim() || "";
            const description = document.getElementById("description")?.value.trim() || "";

            if (!title || !instructor || !description) {
                showMsg(
                    message,
                    "Please fill in all course fields"
                );
                return;
            }

            try {
                await apiRequest("/api/courses/index.php", {
                    method: "POST",
                    body: JSON.stringify({
                        title,
                        instructor,
                        description
                    })
                });

                showMsg(
                    message,
                    "Course added successfully",
                    "success"
                );

                addCourseForm.reset();
                loadCourses();

            } catch (error) {
                console.error("Add course error:", error);
                showMsg(
                    message,
                    error.message || "Failed to add course"
                );
            }
        });
    }
}

async function loadUsers() {
    const totalUsersElement =
        document.getElementById("total-users");

    const activeStudentsElement =
        document.getElementById("active-students");

    const usersTableBody =
        document.getElementById("users-table-body");

    const recentUsersBody =
        document.getElementById("recent-users-body");

    try {
        const data = await apiRequest(
            "/api/admin/users.php"
        );

        console.log("Users API:", data);

        const users = Array.isArray(data.users)
            ? data.users
            : [];

        const totalUsers = Number(
            data.count ?? users.length
        );

        console.log("Total users:", totalUsers);
        console.log("Users:", users);

        if (totalUsersElement) {
            totalUsersElement.textContent = totalUsers;
        }

        const studentCount = users.filter(
            (user) => user.role === "student"
        ).length;

        if (activeStudentsElement) {
            activeStudentsElement.textContent = studentCount;
        }

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
                    .map((user) => {
                        const name = user.name || "Unknown";
                        const email = user.email || "—";
                        const role = user.role || "—";
                        const avatar = name
                            .charAt(0)
                            .toUpperCase();

                        return `
                            <tr>
                                <td>
                                    ${escapeHtml(user.id)}
                                </td>

                                <td>
                                    <div class="user-cell">
                                        <div class="user-avatar">
                                            ${escapeHtml(avatar)}
                                        </div>

                                        ${escapeHtml(name)}
                                    </div>
                                </td>

                                <td>
                                    ${escapeHtml(email)}
                                </td>

                                <td>
                                    <span class="badge badge-success">
                                        ${escapeHtml(role)}
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
                        `;
                    })
                    .join("");
            }
        }

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
                    .map((user) => {
                        const name = user.name || "Unknown";
                        const email = user.email || "—";
                        const role = user.role || "—";
                        const avatar = name
                            .charAt(0)
                            .toUpperCase();

                        return `
                            <tr>
                                <td>
                                    <div class="user-cell">
                                        <div class="user-avatar">
                                            ${escapeHtml(avatar)}
                                        </div>

                                        ${escapeHtml(name)}
                                    </div>
                                </td>

                                <td>
                                    ${escapeHtml(email)}
                                </td>

                                <td>
                                    <span class="badge badge-success">
                                        ${escapeHtml(role)}
                                    </span>
                                </td>

                                <td>
                                    <span class="badge badge-success">
                                        Active
                                    </span>
                                </td>
                            </tr>
                        `;
                    })
                    .join("");
            }
        }

        createUserChart(users);

    } catch (error) {
        console.error("Failed to load users:", error);

        if (totalUsersElement) {
            totalUsersElement.textContent = "0";
        }

        if (activeStudentsElement) {
            activeStudentsElement.textContent = "0";
        }

        if (usersTableBody) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        Could not load users
                    </td>
                </tr>
            `;
        }

        if (recentUsersBody) {
            recentUsersBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        Could not load users
                    </td>
                </tr>
            `;
        }
    }
}

function createUserChart(users) {
    const canvas = document.getElementById("userChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const adminCount = users.filter(
        (user) => user.role === "admin"
    ).length;

    const userCount = users.filter(
        (user) => user.role === "user"
    ).length;

    const studentCount = users.filter(
        (user) => user.role === "student"
    ).length;

    const otherCount = users.filter(
        (user) =>
            !["admin", "user", "student"].includes(user.role)
    ).length;

    if (window.userChart instanceof Chart) {
        window.userChart.destroy();
    }

    window.userChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: [
                "Admins",
                "Users",
                "Students",
                "Other"
            ],

            datasets: [
                {
                    data: [
                        adminCount,
                        userCount,
                        studentCount,
                        otherCount
                    ]
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

async function loadCourses() {
    if (!courseTableBody) {
        return;
    }

    try {
        const data = await apiRequest(
            "/api/courses/index.php"
        );

        const courses = Array.isArray(data.courses)
            ? data.courses
            : [];

        const courseCount =
            data.count ?? courses.length;

        updateCourseCount(courseCount);

        if (!courses.length) {
            courseTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        No courses yet
                    </td>
                </tr>
            `;

            return;
        }

        courseTableBody.innerHTML = courses
            .map((course) => {
                return `
                    <tr>
                        <td>
                            ${escapeHtml(course.id ?? "—")}
                        </td>

                        <td>
                            ${escapeHtml(course.title ?? "—")}
                        </td>

                        <td>
                            ${escapeHtml(
                                course.instructor || "—"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                course.description || "—"
                            )}
                        </td>
                    </tr>
                `;
            })
            .join("");

    } catch (error) {
        console.error(
            "Failed to load courses:",
            error
        );

        courseTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Could not load courses
                </td>
            </tr>
        `;

        updateCourseCount(0);
    }
}

function updateCourseCount(count) {
    const element =
        document.getElementById("total-courses");

    if (element) {
        element.textContent = count;
    }
}
