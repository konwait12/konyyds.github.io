// 初始化博客数据
function initBlogs() {
    // 检查本地存储中是否已有博客数据
    if (!localStorage.getItem('kon-blogs')) {
        // 如果没有，从JSON文件加载初始数据
        fetch('data/blogs.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('kon-blogs', JSON.stringify(data));
                loadBlogs();
            })
            .catch(error => {
                console.error('加载初始博客数据失败:', error);
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
                    },
                    {
                        id: 2,
                        title: "Kali Linux入门指南",
                        content: "Kali Linux是安全专业人士和爱好者的首选工具。本指南将带您了解其基本功能和常用工具...",
                        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
                        date: "2024-01-10",
                        comments: 8,
                        category: "tools",
                        tags: ["Kali Linux", "渗透测试"]
                    }
                ];
                localStorage.setItem('kon-blogs', JSON.stringify(fallbackBlogs));
                loadBlogs();
            });
    } else {
        // 如果已有数据，直接加载
        loadBlogs();
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
    
    // 验证（实际应用中应该通过API验证）
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

// 加载博客列表
function loadBlogs() {
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    renderBlogs(blogs);
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
        
        // 处理图片（如果没有图片使用默认图）
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
    const categories = JSON.parse(localStorage.getItem('kon-categories') || '[]');
    const category = categories.find(c => c.slug === categorySlug);
    
    if (category) {
        return category.name;
    }
    
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
function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!searchTerm) {
        loadBlogs();
        return;
    }
    
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
    
    renderBlogs(filteredBlogs);
}

// 按分类筛选博客
function filterBlogsByCategory(category) {
    // 更新活动标签样式
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.toggle('active', tag.getAttribute('data-category') === category);
    });
    
    if (category === 'all') {
        loadBlogs();
        return;
    }
    
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    const filteredBlogs = blogs.filter(blog => blog.category === category);
    
    renderBlogs(filteredBlogs);
}

// 排序博客
function sortBlogs(sortBy) {
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
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
    
    // 主题切换
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
        });
    });
    
    // 点击页面其他区域关闭登录面板
    document.addEventListener('click', function(e) {
        const loginPanel = document.getElementById('login-panel');
        const loginTrigger = document.getElementById('login-trigger');
        
        if (loginPanel.style.display === 'block' && 
            !loginPanel.contains(e.target) && 
            e.target !== loginTrigger) {
            loginPanel.style.display = 'none';
        }
    });
}

// 应用主题
function applyTheme(theme) {
    const root = document.documentElement;
    
    switch (theme) {
        case 'light':
            root.style.setProperty('--primary-color', 'var(--theme-light-primary)');
            root.style.setProperty('--secondary-color', '#90caf9');
            root.style.setProperty('--bg-color', '#f5f7fa');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--text-color', '#333333');
            root.style.setProperty('--border-color', '#e0e0e0');
            root.style.setProperty('--hover-color', '#f0f0f0');
            break;
        case 'dark':
            root.style.setProperty('--primary-color', 'var(--theme-dark-primary)');
            root.style.setProperty('--secondary-color', '#4a5568');
            root.style.setProperty('--bg-color', '#1a202c');
            root.style.setProperty('--card-bg', '#2d3748');
            root.style.setProperty('--text-color', '#e2e8f0');
            root.style.setProperty('--border-color', '#4a5568');
            root.style.setProperty('--hover-color', '#4a5568');
            break;
        case 'blue':
            root.style.setProperty('--primary-color', 'var(--theme-blue-primary)');
            root.style.setProperty('--secondary-color', '#63b3ed');
            root.style.setProperty('--bg-color', '#e6f4ff');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--text-color', '#1a365d');
            root.style.setProperty('--border-color', '#bfdbfe');
            root.style.setProperty('--hover-color', '#ebf8ff');
            break;
        case 'green':
            root.style.setProperty('--primary-color', 'var(--theme-green-primary)');
            root.style.setProperty('--secondary-color', '#68d391');
            root.style.setProperty('--bg-color', '#f0fff4');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--text-color', '#22543d');
            root.style.setProperty('--border-color', '#c6f6d5');
            root.style.setProperty('--hover-color', '#f0fff4');
            break;
        default:
            // 默认主题
            root.style.setProperty('--primary-color', '#4e54c8');
            root.style.setProperty('--secondary-color', '#8f94fb');
            root.style.setProperty('--bg-color', '#1f1f38');
            root.style.setProperty('--card-bg', '#2a2a4a');
            root.style.setProperty('--text-color', '#f8f9fa');
            root.style.setProperty('--border-color', '#38385f');
            root.style.setProperty('--hover-color', '#38385f');
    }
    
    // 保存用户主题偏好
    localStorage.setItem('kon-myblog-theme', theme);
}

// 加载保存的主题
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('kon-myblog-theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
}

// 初始化页面
function init() {
    checkAdminLogin();
    initBlogs();
    initProfile();
    setupEventListeners();
    loadSavedTheme();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 清理本地存储数据（所有用户可见）
document.getElementById('clear-storage-btn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('确定要清理本地缓存吗？这将重置您看到的文章数据（不会影响服务器数据）')) {
        // 清除所有相关本地存储
        localStorage.removeItem('kon-blogs');
        localStorage.removeItem('kon-comments');
        localStorage.removeItem('kon-profile');
        localStorage.removeItem('kon-settings');
        
        // 重新加载页面，从初始JSON加载数据
        window.location.reload();
    }
});

// 在页面加载完成后添加监听
window.addEventListener('beforeunload', function() {
    // 清除所有localStorage中与该网站相关的数据
    // 方法1：清除清除所有localStorage数据
    localStorage.clear();
    
    // 方法2：如果需要保留其他网站数据（但通常同一域名下数据是隔离的）
    // 可以针对性删除已知的存储键
    /*
    const keys = ['kon-blogs', 'kon-comments', 'kon-myblog-blogs', 'kon-myblog-admin', 'kon-profile', 'kon-settings'];
    keys.forEach(key => localStorage.removeItem(key));
    */
});
