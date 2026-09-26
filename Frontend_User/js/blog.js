        const FEATURED_POST = {
            id: 1,
            title: '10 Essential JavaScript Tips Every Developer Should Know in 2026',
            excerpt: 'Master modern JavaScript with these practical tips — from destructuring and async/await to debouncing and memoization. Boost your productivity with these techniques used by senior developers.',
            category: 'JavaScript',
            categoryIcon: 'fab fa-js',
            icon: 'fab fa-js',
            author: 'Dara Sok',
            date: 'Sep 22, 2026',
            readTime: '8 min read'
        };

        const POSTS = [
            {
                id: 2,
                title: 'Building a Responsive Navbar with Pure CSS',
                excerpt: 'Learn how to create a modern responsive navigation bar without any JavaScript.',
                category: 'CSS',
                icon: 'fab fa-css3-alt',
                gradient: 'grad-2',
                author: 'Anna Chen',
                readTime: '5 min'
            },
            {
                id: 3,
                title: 'React Hooks Explained: useState, useEffect, and More',
                excerpt: 'A beginner-friendly guide to understanding React Hooks and when to use each one.',
                category: 'React',
                icon: 'fab fa-react',
                gradient: 'grad-3',
                author: 'Sokha Vann',
                readTime: '10 min'
            },
            {
                id: 4,
                title: 'Python vs JavaScript: Which Should You Learn First?',
                excerpt: 'Comparing two of the most popular programming languages for beginners.',
                category: 'Career',
                icon: 'fab fa-python',
                gradient: 'grad-4',
                author: 'Kevin Lee',
                readTime: '6 min'
            },
            {
                id: 5,
                title: 'Understanding Async/Await in JavaScript',
                excerpt: 'Demystifying asynchronous JavaScript with practical examples and common pitfalls.',
                category: 'JavaScript',
                icon: 'fas fa-code',
                gradient: 'grad-5',
                author: 'Maria Santos',
                readTime: '7 min'
            },
            {
                id: 6,
                title: 'SQL vs NoSQL: Choosing the Right Database',
                excerpt: 'A practical guide to picking between relational and non-relational databases.',
                category: 'Database',
                icon: 'fas fa-database',
                gradient: 'grad-6',
                author: 'Lisa Park',
                readTime: '9 min'
            },
            {
                id: 7,
                title: '10 CSS Tricks You Wish You Knew Earlier',
                excerpt: 'Hidden CSS features that will make your styling faster and cleaner.',
                category: 'CSS',
                icon: 'fab fa-css3-alt',
                gradient: 'grad-2',
                author: 'Rithy Chea',
                readTime: '5 min'
            }
        ];

        const POPULAR_POSTS = [
            'How to Learn to Code in 2026: Complete Roadmap',
            'The Ultimate Guide to Flexbox and Grid',
            'Understanding Promises in JavaScript',
            'Top 10 VS Code Extensions for Developers',
            'Why TypeScript is Taking Over JavaScript'
        ];

        function renderFeatured() {
            const container = document.getElementById('featured-post');

            if (!container) {
                return;
            }

            const initial = FEATURED_POST.author.charAt(0).toUpperCase();

            container.innerHTML = `
                <div class="featured-image">
                    <i class="${FEATURED_POST.icon}"></i>
                    <span class="featured-badge">
                        ⭐ Featured
                    </span>
                </div>

                <div class="featured-content">

                    <span class="post-category">
                        <i class="${FEATURED_POST.categoryIcon}"></i>
                        ${FEATURED_POST.category}
                    </span>

                    <h3>${FEATURED_POST.title}</h3>

                    <p>${FEATURED_POST.excerpt}</p>

                    <div class="post-meta">

                        <div class="author">
                            <div class="author-avatar">
                                ${initial}
                            </div>

                            <span>${FEATURED_POST.author}</span>
                        </div>

                        <span>
                            <i class="fas fa-calendar"></i>
                            ${FEATURED_POST.date}
                        </span>

                        <span>
                            <i class="fas fa-clock"></i>
                            ${FEATURED_POST.readTime}
                        </span>

                    </div>

                </div>
            `;
        }

        function renderPosts(posts = POSTS) {
            const grid = document.getElementById('posts-grid');

            if (!grid) {
                return;
            }

            if (!posts.length) {
                grid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>

                        <h3>No articles found</h3>

                        <p>
                            Try adjusting your search.
                        </p>
                    </div>
                `;

                return;
            }

            grid.innerHTML = posts.map(post => {
                const initial = post.author.charAt(0).toUpperCase();

                return `
                    <div
                        class="post-card"
                        onclick="viewPost(${post.id})"
                    >

                        <div class="post-image ${post.gradient}">
                            <i class="${post.icon}"></i>
                        </div>

                        <div class="post-body">

                            <span class="post-category">
                                ${post.category}
                            </span>

                            <h3>${post.title}</h3>

                            <p>${post.excerpt}</p>

                            <div class="post-meta">

                                <div class="author">

                                    <div class="author-avatar">
                                        ${initial}
                                    </div>

                                    <span>${post.author}</span>

                                </div>

                                <span>
                                    <i class="fas fa-clock"></i>
                                    ${post.readTime}
                                </span>

                            </div>

                        </div>

                    </div>
                `;
            }).join('');
        }

        function renderPopular() {
            const list = document.getElementById('popular-list');

            if (!list) {
                return;
            }

            list.innerHTML = POPULAR_POSTS.map((title, index) => `
                <li
                    class="popular-item"
                    onclick="viewPost(${index + 10})"
                >

                    <div class="popular-number">
                        ${index + 1}
                    </div>

                    <div class="popular-content">

                        <h4>${title}</h4>

                        <small>
                            ${Math.floor(Math.random() * 5 + 1)}k views
                        </small>

                    </div>

                </li>
            `).join('');
        }

        let currentSearch = '';

        function applySearch() {
            const query = currentSearch.toLowerCase().trim();

            if (!query) {
                renderPosts();
                return;
            }

            const filteredPosts = POSTS.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.category.toLowerCase().includes(query)
            );

            renderPosts(filteredPosts);
        }

        function subscribe() {
            const input = document.getElementById('newsletter-email');

            if (!input) {
                return;
            }

            const email = input.value.trim();

            if (!email) {
                showToast(
                    'Please enter your email',
                    'error'
                );

                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                showToast(
                    'Please enter a valid email',
                    'error'
                );

                return;
            }

            showToast(
                'Subscribed successfully!',
                'success'
            );

            input.value = '';
        }

        function viewPost(id) {
            const post =
                POSTS.find(item => item.id === id) ||
                FEATURED_POST;

            showToast(
                `Opening "${post.title.substring(0, 40)}..."`,
                'info'
            );
        }

        function showToast(message, type = 'info') {
            const existingToast =
                document.querySelector('.dash-toast');

            if (existingToast) {
                existingToast.remove();
            }

            const toastTypes = {
                success: {
                    background: '#ecfdf5',
                    border: '#10b981',
                    color: '#065f46',
                    icon: 'fa-check-circle'
                },

                error: {
                    background: '#fef2f2',
                    border: '#ef4444',
                    color: '#991b1b',
                    icon: 'fa-circle-exclamation'
                },

                info: {
                    background: '#eff6ff',
                    border: '#4f46e5',
                    color: '#1e40af',
                    icon: 'fa-info-circle'
                }
            };

            const config =
                toastTypes[type] ||
                toastTypes.info;

            if (!document.getElementById('toast-styles')) {
                const style = document.createElement('style');

                style.id = 'toast-styles';

                style.textContent = `
                    .dash-toast {
                        position: fixed;
                        bottom: 24px;
                        right: 24px;
                        display: flex;
                        align-items: center;
                        gap: 0.65rem;
                        padding: 0.9rem 1.4rem;
                        border-radius: 12px;
                        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                        font-size: 0.88rem;
                        font-weight: 600;
                        font-family: 'Plus Jakarta Sans', sans-serif;
                        z-index: 99999;
                        animation: toastShow 0.35s cubic-bezier(.34, 1.56, .64, 1);
                        max-width: 340px;
                    }

                    @keyframes toastShow {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `;

                document.head.appendChild(style);
            }

            const toast = document.createElement('div');

            toast.className = 'dash-toast';

            toast.style.background = config.background;
            toast.style.borderLeft = `4px solid ${config.border}`;
            toast.style.color = config.color;

            toast.innerHTML = `
                <i
                    class="fas ${config.icon}"
                    style="color: ${config.border}"
                ></i>

                <span>${message}</span>
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                toast.style.transition = 'all 0.3s ease';

                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 2800);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const searchInput =
                document.getElementById('search-input');

            const searchButton =
                document.getElementById('search-btn');

            if (searchInput) {
                searchInput.addEventListener('input', event => {
                    currentSearch = event.target.value;
                    applySearch();
                });
            }

            if (searchButton) {
                searchButton.addEventListener('click', () => {
                    currentSearch = searchInput.value;
                    applySearch();
                });
            }

            renderFeatured();
            renderPosts();
            renderPopular();
        });