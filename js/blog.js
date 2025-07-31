// 初始化博客详情页
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态（保留登录状态的本地存储，因为没有后端）
    checkAdminLogin();
    
    // 从URL获取博客ID
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    
    if (blogId) {
        // 加载博客内容
        loadBlog(blogId);
        
        // 加载相关文章
        loadRelatedPosts(blogId);
        
        // 加载评论
        loadComments(blogId);
    } else {
        showError("博客ID参数缺失", "请从博客列表中选择文章");
    }
    
    // 评论表单提交
    document.getElementById('comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitComment(blogId);
    });
    
    // 详情页搜索功能
    document.getElementById('detail-search-btn').addEventListener('click', handleDetailSearch);
    document.getElementById('detail-search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleDetailSearch();
    });
});

// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('kon-myblog-admin') === 'true';
    if (isLoggedIn) {
        document.getElementById('admin-link-detail').style.display = 'block';
    }
}

// 获取博客数据（直接从JSON文件获取）
async function getBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        return await response.json();
    } catch (error) {
        console.error('获取博客数据失败:', error);
        return [];
    }
}

// 加载博客内容
async function loadBlog(blogId) {
    // 获取所有博客
    const blogs = await getBlogs();
    const blog = blogs.find(b => b.id == blogId);
    const blogArticle = document.getElementById('blog-article');
    
    if (!blog) {
        showError("博客不存在", "请求的博客文章不存在或已被删除");
        return;
    }
    
    blogArticle.innerHTML = `
        <div class="blog-header">
            <h1 class="blog-title">${blog.title}</h1>
            <div class="blog-meta">
                <span><i class="far fa-user"></i> 作者</span>
                <span><i class="far fa-calendar"></i> ${formatDate(blog.date)}</span>
                <span><i class="far fa-comment"></i> ${blog.comments} 条评论</span>
                <span><i class="far fa-folder"></i> ${getCategoryName(blog.category)}</span>
            </div>
        </div>
        
        <div class="blog-image">
            <img src="${blog.image}" alt="${blog.title}">
        </div>
        
        <div class="blog-content">
            ${blog.content}
        </div>
        
        <div class="blog-tags">
            ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;
}

// 加载相关文章
async function loadRelatedPosts(currentBlogId) {
    const blogs = await getBlogs();
    const currentBlog = blogs.find(b => b.id == currentBlogId);
    const relatedContainer = document.getElementById('related-container');
    
    if (!currentBlog) return;
    
    // 获取相同分类的文章（排除当前文章）
    const relatedBlogs = blogs.filter(blog => 
        blog.category === currentBlog.category && 
        blog.id != currentBlogId
    ).slice(0, 3); // 最多显示3篇
    
    if (relatedBlogs.length === 0) {
        relatedContainer.innerHTML = '<p>暂无相关文章</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedBlogs.map(blog => `
        <div class="blog-card">
            <div class="blog-image">
                <img src="${blog.image}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(blog.date)}</span>
                </div>
                <h4>${blog.title}</h4>
                <a href="blog-detail.html?id=${blog.id}">
                    阅读更多 <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
}

// 加载评论（评论仍使用localStorage，因为没有后端存储）
function loadComments(blogId) {
    const commentsContainer = document.getElementById('comments-container');
    const commentsCount = document.getElementById('comments-count');
    
    // 从localStorage获取评论
    const comments = JSON.parse(localStorage.getItem(`blog-${blogId}-comments`)) || [];
    
    commentsCount.textContent = comments.length;
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="no-comments">
                <i class="far fa-comment-dots"></i>
                <p>暂无评论，成为第一个评论者吧！</p>
            </div>
        `;
        return;
    }
    
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.name}</span>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
        </div>
    `).join('');
}

// 提交评论
function submitComment(blogId) {
    const name = document.getElementById('comment-name').value;
    const email = document.getElementById('comment-email').value;
    const content = document.getElementById('comment-content').value;
    
    if (!name || !email || !content) {
        alert('请填写所有字段');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址');
        return;
    }
    
    const newComment = {
        name,
        email,
        content,
        date: new Date().toISOString()
    };
    
    // 获取现有评论
    const comments = JSON.parse(localStorage.getItem(`blog-${blogId}-comments`)) || [];
    comments.push(newComment);
    
    // 保存评论
    localStorage.setItem(`blog-${blogId}-comments`, JSON.stringify(comments));
    
    // 重新加载评论
    loadComments(blogId);
    
    // 重置表单
    document.getElementById('comment-form').reset();
    
    alert('评论已提交，感谢您的参与！');
}

// 详情页搜索处理
function handleDetailSearch() {
    const searchTerm = document.getElementById('detail-search-input').value.trim();
    if (searchTerm) {
        // 存储搜索词
        localStorage.setItem('kon-myblog-search', searchTerm);
        // 跳转到首页并触发搜索
        window.location.href = 'index.html#blogs';
    }
}

// 显示错误信息
function showError(title, message) {
    document.getElementById('blog-article').innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${title}</h3>
            <p>${message}</p>
            <a href="index.html" class="btn btn-primary">返回首页</a>
        </div>
    `;
}

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function getCategoryName(category) {
    const categories = {
        'security': '网络安全',
        'tools': '工具实践',
        'ctf': 'CTF竞赛',
        'linux': 'Linux探索'
    };
    return categories[category] || '未分类';
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
```

\##\# 2. js/main.js
```javascript
// 初始化博客数据
async function initBlogs() {
    // 直接从JSON文件加载数据
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        renderBlogs(blogs);
    } catch (error) {
        console.error('加载博客数据失败:', error);
        // 使用备用数据
        const fallbackBlogs = [
            {
                id: 1,
                title: "网络安全基础：如何保护你的在线隐私",
                content: "在数字时代，保护个人隐私变得尤为重要。本文将介绍基本的网络安全概念和实践，帮助您建立第一道防线...",
                image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                date: "2024-01-15",
                comments: 12,
                category: "security",
                tags: ["网络安全", "隐私保护"]
            }
        ];
        renderBlogs(fallbackBlogs);
    }
}

// 初始化个人资料
function initProfile() {
    const profile = JSON.parse(localStorage.getItem('kon-profile') || '{}');
    
    if (profile.avatar) {
        document.getElementById('profile-avatar').src = profile.avatar;
    }
    
    if (profile.description) {
        document.getElementById('profile-description').textContent = profile.description;
    }
    
    if (profile.skills) {
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = '';
        
        profile.skills.split(',').forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill.trim();
            skillsContainer.appendChild(skillTag);
        });
    }
    
    // 加载网站设置
    const settings = JSON.parse(localStorage.getItem('kon-settings') || '{}');
    if (settings.siteTitle) {
        document.title = `${settings.siteTitle} - 网络安全技术博客`;
        document.querySelector('.logo h1').textContent = settings.siteTitle;
    }
    
    if (settings.heroTitle) {
        document.querySelector('.hero h2').textContent = settings.heroTitle;
    }
    
    if (settings.heroSubtitle) {
        document.querySelector('.hero p').textContent = settings.heroSubtitle;
    }
}

// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('kon-myblog-admin') === 'true';
    const adminNotice = document.getElementById('admin-notice');
    const adminLink = document.getElementById('admin-link');
    
    if (isLoggedIn) {
        adminNotice.style.display = 'block';
        adminLink.style.display = 'block';
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 简单验证
    if (username === 'kon-myblog' && password === 'hfhf888888') {
        localStorage.setItem('kon-myblog-admin', 'true');
        checkAdminLogin();
        document.getElementById('login-panel').style.display = 'none';
        document.getElementById('login-form').reset();
        alert('登录成功，已跳转到管理后台');
        window.location.href = 'admin.html';
    } else {
        alert('用户名或密码错误');
    }
}

// 渲染博客列表
function renderBlogs(blogsToRender) {
    const blogsContainer = document.getElementById('blogs-container');
    blogsContainer.innerHTML = '';
    
    if (blogsToRender.length === 0) {
        blogsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>没有找到匹配的文章</h3>
                <p>请尝试其他搜索关键词或分类</p>
            </div>
        `;
        return;
    }
    
    // 按日期排序（最新的在前）
    const sortedBlogs = [...blogsToRender].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedBlogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        
        // 处理图片
        const imageUrl = blog.image || 'https://picsum.photos/600/400?random=' + blog.id;
        
        blogCard.innerHTML = `
            <div class="blog-image">
                <img src="${imageUrl}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span><i class="far fa-calendar"></i> ${blog.date}</span>
                    <span><i class="far fa-comment"></i> ${blog.comments} 评论</span>
                    <span class="blog-category">${getCategoryName(blog.category)}</span>
                </div>
                <h4>${blog.title}</h4>
                <p>${blog.content.substring(0, 120)}${blog.content.length > 120 ? '...' : ''}</p>
                <a href="blog-detail.html?id=${blog.id}">
                    阅读更多 <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        blogsContainer.appendChild(blogCard);
    });
}

// 获取分类名称
function getCategoryName(categorySlug) {
    // 默认分类名称映射
    const defaultCategories = {
        'security': '网络安全',
        'tools': '工具实践',
        'tutorial': '教程',
        'ctf': 'CTF竞赛',
        'linux': 'Linux系统',
        'uncategorized': '未分类'
    };
    
    return defaultCategories[categorySlug] || '未分类';
}

// 处理搜索
async function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        
        if (!searchTerm) {
            renderBlogs(blogs);
            return;
        }
        
        const filteredBlogs = blogs.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm) ||
            blog.content.toLowerCase().includes(searchTerm) ||
            (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
        
        renderBlogs(filteredBlogs);
    } catch (error) {
        console.error('搜索失败:', error);
    }
}

// 按分类筛选博客
async function filterBlogsByCategory(category) {
    // 更新活动标签样式
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.toggle('active', tag.getAttribute('data-category') === category);
    });
    
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        
        if (category === 'all') {
            renderBlogs(blogs);
            return;
        }
        
        const filteredBlogs = blogs.filter(blog => blog.category === category);
        renderBlogs(filteredBlogs);
    } catch (error) {
        console.error('筛选失败:', error);
    }
}

// 排序博客
async function sortBlogs(sortBy) {
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        let sortedBlogs = [...blogs];
        
        switch (sortBy) {
            case 'newest':
                sortedBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                sortedBlogs.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'popular':
                sortedBlogs.sort((a, b) => b.comments - a.comments);
                break;
        }
        
        renderBlogs(sortedBlogs);
    } catch (error) {
        console.error('排序失败:', error);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // 登录触发按钮
    document.getElementById('login-trigger').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-panel').style.display = 'block';
    });
    
    // 搜索功能
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 分类筛选
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterBlogsByCategory(category);
        });
    });
    
    // 排序功能
    document.getElementById('sort-select').addEventListener('change', function() {
        sortBlogs(this.value);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initBlogs();
    initProfile();
    checkAdminLogin();
    setupEventListeners();
});
```

\##\# 3. js/admin.js
```javascript
// 注意：去掉本地存储后，管理员功能将无法保存更改
// 以下代码仅保留查看功能，编辑和删除功能会被禁用

// 初始化博客数据（从JSON文件加载）
async function initBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        renderBlogList(blogs);
        updateDashboardStats(blogs);
    } catch (error) {
        console.error('加载博客数据失败:', error);
        const fallbackBlogs = [
            {
                id: 1,
                title: "示例文章",
                content: "这是一篇示例文章，用于初始化博客数据。",
                image: "https://picsum.photos/600/400",
                date: new Date().toLocaleDateString(),
                comments: 0,
                category: "security",
                tags: ["示例"]
            }
        ];
        renderBlogList(fallbackBlogs);
        updateDashboardStats(fallbackBlogs);
    }
}

// 渲染博客列表
function renderBlogList(blogs) {
    const blogListElement = document.getElementById('blog-list');
    
    if (!blogListElement) return;
    
    blogListElement.innerHTML = '';
    
    if (blogs.length === 0) {
        blogListElement.innerHTML = '<p class="no-data">暂无文章</p>';
        return;
    }
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'blogs-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>标题</th>
                <th>分类</th>
                <th>发布日期</th>
                <th>评论数</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            ${blogs.map(blog => `
                <tr>
                    <td>${blog.id}</td>
                    <td>${blog.title}</td>
                    <td>${getCategoryName(blog.category)}</td>
                    <td>${blog.date}</td>
                    <td>${blog.comments}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-edit" disabled title="已禁用，因为移除了本地存储">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-delete" disabled title="已禁用，因为移除了本地存储">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    blogListElement.appendChild(table);
}

// 获取分类名称
function getCategoryName(category) {
    const categories = {
        'security': '网络安全',
        'tools': '工具实践',
        'ctf': 'CTF竞赛',
        'linux': 'Linux探索'
    };
    return categories[category] || '未分类';
}

// 更新仪表盘统计数据
function updateDashboardStats(blogs) {
    const comments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    
    // 计算评论总数
    let totalComments = 0;
    Object.values(comments).forEach(commentList => {
        totalComments += commentList.length;
    });
    
    // 计算分类数量
    const categories = new Set();
    blogs.forEach(blog => categories.add(blog.category));
    
    // 更新统计数字
    const statsElements = {
        totalBlogs: document.getElementById('stat-total-blogs'),
        totalComments: document.getElementById('stat-total-comments'),
        totalCategories: document.getElementById('stat-total-categories'),
        latestPost: document.getElementById('stat-latest-post')
    };
    
    if (statsElements.totalBlogs) {
        statsElements.totalBlogs.textContent = blogs.length;
    }
    
    if (statsElements.totalComments) {
        statsElements.totalComments.textContent = totalComments;
    }
    
    if (statsElements.totalCategories) {
        statsElements.totalCategories.textContent = categories.size;
    }
    
    // 更新最新文章
    if (statsElements.latestPost && blogs.length > 0) {
        // 按日期排序，取最新的
        const sortedBlogs = [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        statsElements.latestPost.textContent = sortedBlogs[0].title;
    }
}

// 渲染评论管理
async function renderComments() {
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;
    
    const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        
        // 转换为数组并添加文章标题
        const commentsArray = [];
        Object.keys(allComments).forEach(blogId => {
            const blog = blogs.find(b => b.id === parseInt(blogId));
            allComments[blogId].forEach(comment => {
                commentsArray.push({
                    ...comment,
                    blogId: parseInt(blogId),
                    blogTitle: blog ? blog.title : '未知文章'
                });
            });
        });
        
        // 按日期排序（最新的在前）
        commentsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (commentsArray.length === 0) {
            commentsContainer.innerHTML = '<p class="no-data">暂无评论</p>';
            return;
        }
        
        // 创建评论表格
        const table = document.createElement('table');
        table.className = 'comments-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>文章</th>
                    <th>评论者</th>
                    <th>评论内容</th>
                    <th>日期</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${commentsArray.map((comment, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${comment.blogTitle}</td>
                        <td>${comment.author}</td>
                        <td>${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}</td>
                        <td>${comment.date}</td>
                        <td class="actions">
                            <button class="btn btn-sm btn-delete" disabled title="已禁用，因为移除了本地存储">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        commentsContainer.appendChild(table);
    } catch (error) {
        console.error('加载评论失败:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('kon-myblog-admin') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // 初始化页面
    initBlogs();
    renderComments();
    
    // 禁用新增文章按钮
    document.getElementById('add-blog-btn').setAttribute('disabled', true);
    document.getElementById('add-blog-btn').setAttribute('title', '已禁用，因为移除了本地存储');
});
```

\##\# 4. js/utils.js
```javascript
// 获取博客数据（直接从JSON文件获取）
async function getBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        return await response.json();
    } catch (error) {
        console.error('获取博客数据失败:', error);
        return [];
    }
}

// 获取分类名称
function getCategoryName(category) {
    const categories = {
        'security': '网络安全',
        'tools': '工具使用',
        'tutorial': '教程',
        'ctf': 'CTF竞赛',
        'linux': 'Linux系统'
    };
    return categories[category] || '未分类';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 生成图表颜色
function generateChartColors(count) {
    const colors = [
        'rgba(78, 84, 200, 0.7)',
        'rgba(255, 107, 107, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)'
    ];
    
    return colors.slice(0, count);
}

// 验证邮箱格式
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
```

\##\# 5. blog-detail.html (修改脚本部分)
```html
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // 从URL获取博客ID
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = parseInt(urlParams.get('id'));
        
        if (!blogId) {
            document.getElementById('detail-content').innerHTML = '<p>抱歉，请求的文章不存在或已被删除。</p>';
            return;
        }
        
        // 加载博客文章
        loadBlog(blogId);
    });
    
    // 加载博客文章
    async function loadBlog(blogId) {
        try {
            const response = await fetch('data/blogs.json');
            const blogs = await response.json();
            const blog = blogs.find(b => b.id === blogId);
            
            if (!blog) {
                document.getElementById('detail-content').innerHTML = '<p>抱歉，请求的文章不存在或已被删除。</p>';
                return;
            }
            
            // 填充文章内容
            document.getElementById('detail-title').innerText = blog.title;
            document.getElementById('detail-date').innerHTML = `<i class="far fa-calendar"></i> ${blog.date}`;
            document.getElementById('detail-comments').innerHTML = `<i class="far fa-comment"></i> ${blog.comments} 评论`;
            
            const categories = {
                'security': '网络安全',
                'tools': '工具实践',
                'ctf': 'CTF竞赛',
                'linux': 'Linux探索'
            };
            document.getElementById('detail-category').innerText = categories[blog.category] || '未分类';
            
            document.getElementById('detail-image').src = blog.image;
            document.getElementById('detail-image').alt = blog.title;
            
            // 格式化内容（简单处理换行）
            document.getElementById('detail-content').innerHTML = `<p>${blog.content.replace(/\n/g, '</p><p>')}</p>`;
            
            // 加载评论
            loadComments(blogId);
        } catch (error) {
            console.error('加载博客失败:', error);
            document.getElementById('detail-content').innerHTML = '<p>加载文章时出错，请稍后再试。</p>';
        }
    }
    
    // 加载评论
    function loadComments(blogId) {
        // 从localStorage获取评论
        const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
        const comments = allComments[blogId] || [];
        
        // 更新评论计数
        document.getElementById('comments-count').innerText = comments.length;
        
        // 渲染评论
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';
        
        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.style.background = 'var(--card-bg)';
            commentEl.style.padding = '1rem';
            commentEl.style.borderRadius = '4px';
            commentEl.style.marginBottom = '1rem';
            
            commentEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>${comment.author}</strong>
                    <small>${comment.date}</small>
                </div>
                <p>${comment.content}</p>
            `;
            
            commentsContainer.appendChild(commentEl);
        });
    }
    
    // 提交评论
    function submitComment(e) {
        e.preventDefault();
        
        const blogId = parseInt(new URLSearchParams(window.location.search).get('id'));
        const author = document.getElementById('comment-author').value;
        const content = document.getElementById('comment-content').value;
        
        if (!author || !content) return;
        
        // 创建评论对象
        const comment = {
            id: Date.now(),
            author,
            content,
            date: new Date().toLocaleString()
        };
        
        // 保存到localStorage
        const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
        if (!allComments[blogId]) {
            allComments[blogId] = [];
        }
        allComments[blogId].push(comment);
        localStorage.setItem('kon-comments', JSON.stringify(allComments));
        
        // 重新加载评论并重置表单
        loadComments(blogId);
        document.getElementById('comment-form').reset();
        
        // 更新评论计数显示
        const commentsCount = document.getElementById('comments-count');
        commentsCount.innerText = parseInt(commentsCount.innerText) + 1;
    }
</script>
```

\##\# 修改说明：
1. 所有从本地存储获取博客数据的代码都改为直接从 `data/blogs.json` 请求
2. 移除了所有将博客数据保存到本地存储的代码
3. 管理员功能中的编辑、删除和新增文章功能被禁用，因为没有了本地存储来保存更改
4. 评论功能仍然使用本地存储，因为没有后端服务器来保存评论
5. 登录状态仍然使用本地存储，因为没有后端认证系统

这些修改后，博客内容将直接从 `data/blogs.json` 文件加载，所有更改需要直接编辑该JSON文件才能生效。以下是去掉本地存储功能、直接使用 `data/blogs.json` 数据所需修改的文件代码：

\##\# 1. js/blog.js
```javascript
// 初始化博客详情页
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态（保留登录状态的本地存储，因为没有后端）
    checkAdminLogin();
    
    // 从URL获取博客ID
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    
    if (blogId) {
        // 加载博客内容
        loadBlog(blogId);
        
        // 加载相关文章
        loadRelatedPosts(blogId);
        
        // 加载评论
        loadComments(blogId);
    } else {
        showError("博客ID参数缺失", "请从博客列表中选择文章");
    }
    
    // 评论表单提交
    document.getElementById('comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitComment(blogId);
    });
    
    // 详情页搜索功能
    document.getElementById('detail-search-btn').addEventListener('click', handleDetailSearch);
    document.getElementById('detail-search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleDetailSearch();
    });
});

// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('kon-myblog-admin') === 'true';
    if (isLoggedIn) {
        document.getElementById('admin-link-detail').style.display = 'block';
    }
}

// 获取博客数据（直接从JSON文件获取）
async function getBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        return await response.json();
    } catch (error) {
        console.error('获取博客数据失败:', error);
        return [];
    }
}

// 加载博客内容
async function loadBlog(blogId) {
    // 获取所有博客
    const blogs = await getBlogs();
    const blog = blogs.find(b => b.id == blogId);
    const blogArticle = document.getElementById('blog-article');
    
    if (!blog) {
        showError("博客不存在", "请求的博客文章不存在或已被删除");
        return;
    }
    
    blogArticle.innerHTML = `
        <div class="blog-header">
            <h1 class="blog-title">${blog.title}</h1>
            <div class="blog-meta">
                <span><i class="far fa-user"></i> 作者</span>
                <span><i class="far fa-calendar"></i> ${formatDate(blog.date)}</span>
                <span><i class="far fa-comment"></i> ${blog.comments} 条评论</span>
                <span><i class="far fa-folder"></i> ${getCategoryName(blog.category)}</span>
            </div>
        </div>
        
        <div class="blog-image">
            <img src="${blog.image}" alt="${blog.title}">
        </div>
        
        <div class="blog-content">
            ${blog.content}
        </div>
        
        <div class="blog-tags">
            ${blog.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;
}

// 加载相关文章
async function loadRelatedPosts(currentBlogId) {
    const blogs = await getBlogs();
    const currentBlog = blogs.find(b => b.id == currentBlogId);
    const relatedContainer = document.getElementById('related-container');
    
    if (!currentBlog) return;
    
    // 获取相同分类的文章（排除当前文章）
    const relatedBlogs = blogs.filter(blog => 
        blog.category === currentBlog.category && 
        blog.id != currentBlogId
    ).slice(0, 3); // 最多显示3篇
    
    if (relatedBlogs.length === 0) {
        relatedContainer.innerHTML = '<p>暂无相关文章</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedBlogs.map(blog => `
        <div class="blog-card">
            <div class="blog-image">
                <img src="${blog.image}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(blog.date)}</span>
                </div>
                <h4>${blog.title}</h4>
                <a href="blog-detail.html?id=${blog.id}">
                    阅读更多 <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
}

// 加载评论（评论仍使用localStorage，因为没有后端存储）
function loadComments(blogId) {
    const commentsContainer = document.getElementById('comments-container');
    const commentsCount = document.getElementById('comments-count');
    
    // 从localStorage获取评论
    const comments = JSON.parse(localStorage.getItem(`blog-${blogId}-comments`)) || [];
    
    commentsCount.textContent = comments.length;
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = `
            <div class="no-comments">
                <i class="far fa-comment-dots"></i>
                <p>暂无评论，成为第一个评论者吧！</p>
            </div>
        `;
        return;
    }
    
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.name}</span>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <div class="comment-content">
                ${comment.content}
            </div>
        </div>
    `).join('');
}

// 提交评论
function submitComment(blogId) {
    const name = document.getElementById('comment-name').value;
    const email = document.getElementById('comment-email').value;
    const content = document.getElementById('comment-content').value;
    
    if (!name || !email || !content) {
        alert('请填写所有字段');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址');
        return;
    }
    
    const newComment = {
        name,
        email,
        content,
        date: new Date().toISOString()
    };
    
    // 获取现有评论
    const comments = JSON.parse(localStorage.getItem(`blog-${blogId}-comments`)) || [];
    comments.push(newComment);
    
    // 保存评论
    localStorage.setItem(`blog-${blogId}-comments`, JSON.stringify(comments));
    
    // 重新加载评论
    loadComments(blogId);
    
    // 重置表单
    document.getElementById('comment-form').reset();
    
    alert('评论已提交，感谢您的参与！');
}

// 详情页搜索处理
function handleDetailSearch() {
    const searchTerm = document.getElementById('detail-search-input').value.trim();
    if (searchTerm) {
        // 存储搜索词
        localStorage.setItem('kon-myblog-search', searchTerm);
        // 跳转到首页并触发搜索
        window.location.href = 'index.html\#blogs';
    }
}

// 显示错误信息
function showError(title, message) {
    document.getElementById('blog-article').innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>${title}</h3>
            <p>${message}</p>
            <a href="index.html" class="btn btn-primary">返回首页</a>
        </div>
    `;
}

// 工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function getCategoryName(category) {
    const categories = {
        'security': '网络安全',
        'tools': '工具实践',
        'ctf': 'CTF竞赛',
        'linux': 'Linux探索'
    };
    return categories[category] || '未分类';
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
```

\##\# 2. js/main.js
```javascript
// 初始化博客数据
async function initBlogs() {
    // 直接从JSON文件加载数据
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        renderBlogs(blogs);
    } catch (error) {
        console.error('加载博客数据失败:', error);
        // 使用备用数据
        const fallbackBlogs = [
            {
                id: 1,
                title: "网络安全基础：如何保护你的在线隐私",
                content: "在数字时代，保护个人隐私变得尤为重要。本文将介绍基本的网络安全概念和实践，帮助您建立第一道防线...",
                image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
                date: "2024-01-15",
                comments: 12,
                category: "security",
                tags: ["网络安全", "隐私保护"]
            }
        ];
        renderBlogs(fallbackBlogs);
    }
}

// 初始化个人资料
function initProfile() {
    const profile = JSON.parse(localStorage.getItem('kon-profile') || '{}');
    
    if (profile.avatar) {
        document.getElementById('profile-avatar').src = profile.avatar;
    }
    
    if (profile.description) {
        document.getElementById('profile-description').textContent = profile.description;
    }
    
    if (profile.skills) {
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = '';
        
        profile.skills.split(',').forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill.trim();
            skillsContainer.appendChild(skillTag);
        });
    }
    
    // 加载网站设置
    const settings = JSON.parse(localStorage.getItem('kon-settings') || '{}');
    if (settings.siteTitle) {
        document.title = `${settings.siteTitle} - 网络安全技术博客`;
        document.querySelector('.logo h1').textContent = settings.siteTitle;
    }
    
    if (settings.heroTitle) {
        document.querySelector('.hero h2').textContent = settings.heroTitle;
    }
    
    if (settings.heroSubtitle) {
        document.querySelector('.hero p').textContent = settings.heroSubtitle;
    }
}

// 检查管理员登录状态
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('kon-myblog-admin') === 'true';
    const adminNotice = document.getElementById('admin-notice');
    const adminLink = document.getElementById('admin-link');
    
    if (isLoggedIn) {
        adminNotice.style.display = 'block';
        adminLink.style.display = 'block';
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 简单验证
    if (username === 'kon-myblog' && password === 'hfhf888888') {
        localStorage.setItem('kon-myblog-admin', 'true');
        checkAdminLogin();
        document.getElementById('login-panel').style.display = 'none';
        document.getElementById('login-form').reset();
        alert('登录成功，已跳转到管理后台');
        window.location.href = 'admin.html';
    } else {
        alert('用户名或密码错误');
    }
}

// 渲染博客列表
function renderBlogs(blogsToRender) {
    const blogsContainer = document.getElementById('blogs-container');
    blogsContainer.innerHTML = '';
    
    if (blogsToRender.length === 0) {
        blogsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>没有找到匹配的文章</h3>
                <p>请尝试其他搜索关键词或分类</p>
            </div>
        `;
        return;
    }
    
    // 按日期排序（最新的在前）
    const sortedBlogs = [...blogsToRender].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedBlogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        
        // 处理图片
        const imageUrl = blog.image || 'https://picsum.photos/600/400?random=' + blog.id;
        
        blogCard.innerHTML = `
            <div class="blog-image">
                <img src="${imageUrl}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span><i class="far fa-calendar"></i> ${blog.date}</span>
                    <span><i class="far fa-comment"></i> ${blog.comments} 评论</span>
                    <span class="blog-category">${getCategoryName(blog.category)}</span>
                </div>
                <h4>${blog.title}</h4>
                <p>${blog.content.substring(0, 120)}${blog.content.length > 120 ? '...' : ''}</p>
                <a href="blog-detail.html?id=${blog.id}">
                    阅读更多 <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        blogsContainer.appendChild(blogCard);
    });
}

// 获取分类名称
function getCategoryName(categorySlug) {
    // 默认分类名称映射
    const defaultCategories = {
        'security': '网络安全',
        'tools': '工具实践',
        'tutorial': '教程',
        'ctf': 'CTF竞赛',
        'linux': 'Linux系统',
        'uncategorized': '未分类'
    };
    
    return defaultCategories[categorySlug] || '未分类';
}

// 处理搜索
async function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        
        if (!searchTerm) {
            renderBlogs(blogs);
            return;
        }
        
        const filteredBlogs = blogs.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm) ||
            blog.content.toLowerCase().includes(searchTerm) ||
            (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
        
        renderBlogs(filteredBlogs);
    } catch (error) {
        console.error('搜索失败:', error);
    }
}

// 按分类筛选博客
async function filterBlogsByCategory(category) {
    // 更新活动标签样式
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.toggle('active', tag.getAttribute('data-category') === category);
    });
    
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        
        if (category === 'all') {
            renderBlogs(blogs);
            return;
        }
        
        const filteredBlogs = blogs.filter(blog => blog.category === category);
        renderBlogs(filteredBlogs);
    } catch (error) {
        console.error('筛选失败:', error);
    }
}

// 排序博客
async function sortBlogs(sortBy) {
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        let sortedBlogs = [...blogs];
        
        switch (sortBy) {
            case 'newest':
                sortedBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                sortedBlogs.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'popular':
                sortedBlogs.sort((a, b) => b.comments - a.comments);
                break;
        }
        
        renderBlogs(sortedBlogs);
    } catch (error) {
        console.error('排序失败:', error);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // 登录触发按钮
    document.getElementById('login-trigger').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-panel').style.display = 'block';
    });
    
    // 搜索功能
    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 分类筛选
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterBlogsByCategory(category);
        });
    });
    
    // 排序功能
    document.getElementById('sort-select').addEventListener('change', function() {
        sortBlogs(this.value);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initBlogs();
    initProfile();
    checkAdminLogin();
    setupEventListeners();
});
```

\##\# 3. js/admin.js
```javascript
// 注意：去掉本地存储后，管理员功能将无法保存更改
// 以下代码仅保留查看功能，编辑和删除功能会被禁用

// 初始化博客数据（从JSON文件加载）
async function initBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        renderBlogList(blogs);
        updateDashboardStats(blogs);
    } catch (error) {
        console.error('加载博客数据失败:', error);
        const fallbackBlogs = [
            {
                id: 1,
                title: "示例文章",
                content: "这是一篇示例文章，用于初始化博客数据。",
                image: "https://picsum.photos/600/400",
                date: new Date().toLocaleDateString(),
                comments: 0,
                category: "security",
                tags: ["示例"]
            }
        ];
        renderBlogList(fallbackBlogs);
        updateDashboardStats(fallbackBlogs);
    }
}

// 渲染博客列表
function renderBlogList(blogs) {
    const blogListElement = document.getElementById('blog-list');
    
    if (!blogListElement) return;
    
    blogListElement.innerHTML = '';
    
    if (blogs.length === 0) {
        blogListElement.innerHTML = '<p class="no-data">暂无文章</p>';
        return;
    }
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'blogs-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>标题</th>
                <th>分类</th>
                <th>发布日期</th>
                <th>评论数</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            ${blogs.map(blog => `
                <tr>
                    <td>${blog.id}</td>
                    <td>${blog.title}</td>
                    <td>${getCategoryName(blog.category)}</td>
                    <td>${blog.date}</td>
                    <td>${blog.comments}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-edit" disabled title="已禁用，因为移除了本地存储">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-delete" disabled title="已禁用，因为移除了本地存储">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    blogListElement.appendChild(table);
}

// 获取分类名称
function getCategoryName(category) {
    const categories = {
        'security': '网络安全',
        'tools': '工具实践',
        'ctf': 'CTF竞赛',
        'linux': 'Linux探索'
    };
    return categories[category] || '未分类';
}

// 更新仪表盘统计数据
function updateDashboardStats(blogs) {
    const comments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    
    // 计算评论总数
    let totalComments = 0;
    Object.values(comments).forEach(commentList => {
        totalComments += commentList.length;
    });
    
    // 计算分类数量
    const categories = new Set();
    blogs.forEach(blog => categories.add(blog.category));
    
    // 更新统计数字
    const statsElements = {
        totalBlogs: document.getElementById('stat-total-blogs'),
        totalComments: document.getElementById('stat-total-comments'),
        totalCategories: document.getElementById('stat-total-categories'),
        latestPost: document.getElementById('stat-latest-post')
    };
    
    if (statsElements.totalBlogs) {
        statsElements.totalBlogs.textContent = blogs.length;
    }
    
    if (statsElements.totalComments) {
        statsElements.totalComments.textContent = totalComments;
    }
    
    if (statsElements.totalCategories) {
        statsElements.totalCategories.textContent = categories.size;
    }
    
    // 更新最新文章
    if (statsElements.latestPost && blogs.length > 0) {
        // 按日期排序，取最新的
        const sortedBlogs = [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        statsElements.latestPost.textContent = sortedBlogs[0].title;
    }
}

// 渲染评论管理
async function renderComments() {
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;
    
    const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    
    try {
        const response = await fetch('data/blogs.json');
        const blogs = await response.json();
        
        // 转换为数组并添加文章标题
        const commentsArray = [];
        Object.keys(allComments).forEach(blogId => {
            const blog = blogs.find(b => b.id === parseInt(blogId));
            allComments[blogId].forEach(comment => {
                commentsArray.push({
                    ...comment,
                    blogId: parseInt(blogId),
                    blogTitle: blog ? blog.title : '未知文章'
                });
            });
        });
        
        // 按日期排序（最新的在前）
        commentsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (commentsArray.length === 0) {
            commentsContainer.innerHTML = '<p class="no-data">暂无评论</p>';
            return;
        }
        
        // 创建评论表格
        const table = document.createElement('table');
        table.className = 'comments-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>文章</th>
                    <th>评论者</th>
                    <th>评论内容</th>
                    <th>日期</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${commentsArray.map((comment, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${comment.blogTitle}</td>
                        <td>${comment.author}</td>
                        <td>${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}</td>
                        <td>${comment.date}</td>
                        <td class="actions">
                            <button class="btn btn-sm btn-delete" disabled title="已禁用，因为移除了本地存储">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        commentsContainer.appendChild(table);
    } catch (error) {
        console.error('加载评论失败:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('kon-myblog-admin') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // 初始化页面
    initBlogs();
    renderComments();
    
    // 禁用新增文章按钮
    document.getElementById('add-blog-btn').setAttribute('disabled', true);
    document.getElementById('add-blog-btn').setAttribute('title', '已禁用，因为移除了本地存储');
});
```

\##\# 4. js/utils.js
```javascript
// 获取博客数据（直接从JSON文件获取）
async function getBlogs() {
    try {
        const response = await fetch('data/blogs.json');
        return await response.json();
    } catch (error) {
        console.error('获取博客数据失败:', error);
        return [];
    }
}

// 获取分类名称
function getCategoryName(category) {
    const categories = {
        'security': '网络安全',
        'tools': '工具使用',
        'tutorial': '教程',
        'ctf': 'CTF竞赛',
        'linux': 'Linux系统'
    };
    return categories[category] || '未分类';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 生成图表颜色
function generateChartColors(count) {
    const colors = [
        'rgba(78, 84, 200, 0.7)',
        'rgba(255, 107, 107, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)'
    ];
    
    return colors.slice(0, count);
}

// 验证邮箱格式
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
