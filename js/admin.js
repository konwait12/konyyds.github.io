// 初始化博客数据（首次加载时从JSON文件导入）
function initBlogs() {
    // 检查本地存储中是否已有数据
    if (!localStorage.getItem('kon-blogs')) {
        fetch('data/blogs.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('kon-blogs', JSON.stringify(data));
                renderBlogList();
                updateDashboardStats();
            })
            .catch(error => {
                console.error('加载初始博客数据失败:', error);
                //  fallback数据
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
                localStorage.setItem('kon-blogs', JSON.stringify(fallbackBlogs));
                renderBlogList();
                updateDashboardStats();
            });
    } else {
        renderBlogList();
        updateDashboardStats();
    }
}

// 渲染博客列表
function renderBlogList() {
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    const blogListElement = document.getElementById('blog-list');
    
    if (!blogListElement) return; // 防止DOM元素未加载
    
    blogListElement.innerHTML = '';
    
    if (blogs.length === 0) {
        blogListElement.innerHTML = '<p class="no-data">暂无文章，请点击"新增文章"按钮创建</p>';
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
                        <button class="btn btn-sm btn-edit" data-id="${blog.id}">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-delete" data-id="${blog.id}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    blogListElement.appendChild(table);
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const blogId = parseInt(this.getAttribute('data-id'));
            openEditModal(blogId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const blogId = parseInt(this.getAttribute('data-id'));
            deleteBlog(blogId);
        });
    });
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

// 打开编辑模态框
function openEditModal(blogId) {
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    const blog = blogs.find(b => b.id === blogId);
    
    const modal = document.getElementById('blog-modal');
    const modalTitle = document.getElementById('modal-title');
    const blogForm = document.getElementById('blog-form');
    
    if (!modal || !modalTitle || !blogForm) return;
    
    // 如果是新增文章
    if (!blogId) {
        modalTitle.textContent = '新增文章';
        blogForm.reset();
        document.getElementById('blog-id').value = '';
    } 
    // 如果是编辑已有文章
    else if (blog) {
        modalTitle.textContent = '编辑文章';
        document.getElementById('blog-id').value = blog.id;
        document.getElementById('blog-title').value = blog.title;
        document.getElementById('blog-category').value = blog.category;
        document.getElementById('blog-content').value = blog.content;
    }
    
    modal.style.display = 'block';
}

// 保存文章
function saveBlog(e) {
    e.preventDefault();
    
    const blogId = document.getElementById('blog-id').value;
    const title = document.getElementById('blog-title').value;
    const category = document.getElementById('blog-category').value;
    const content = document.getElementById('blog-content').value;
    
    if (!title || !content) {
        alert('标题和内容不能为空');
        return;
    }
    
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    const today = new Date().toLocaleDateString();
    
    // 编辑现有文章
    if (blogId) {
        const index = blogs.findIndex(b => b.id === parseInt(blogId));
        if (index !== -1) {
            blogs[index] = {
                ...blogs[index],
                title,
                category,
                content
            };
        }
    } 
    // 新增文章
    else {
        const newId = blogs.length > 0 
            ? Math.max(...blogs.map(b => b.id)) + 1 
            : 1;
        
        blogs.push({
            id: newId,
            title,
            content,
            category,
            image: `https://picsum.photos/600/400?random=${newId}`,
            date: today,
            comments: 0,
            tags: []
        });
    }
    
    // 保存到本地存储
    localStorage.setItem('kon-blogs', JSON.stringify(blogs));
    
    // 刷新列表并关闭模态框
    renderBlogList();
    updateDashboardStats();
    document.getElementById('blog-modal').style.display = 'none';
}

// 删除文章
function deleteBlog(blogId) {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
        return;
    }
    
    let blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    blogs = blogs.filter(blog => blog.id !== blogId);
    
    // 保存到本地存储
    localStorage.setItem('kon-blogs', JSON.stringify(blogs));
    
    // 同时删除相关评论
    const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    delete allComments[blogId];
    localStorage.setItem('kon-comments', JSON.stringify(allComments));
    
    // 刷新列表
    renderBlogList();
    updateDashboardStats();
}

// 更新仪表盘统计数据
function updateDashboardStats() {
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
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
function renderComments() {
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;
    
    const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    
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
                <th>文章</th>
                <th>评论者</th>
                <th>内容</th>
                <th>日期</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody>
            ${commentsArray.map(comment => `
                <tr>
                    <td>${comment.blogTitle}</td>
                    <td>${comment.author}</td>
                    <td class="comment-content">${comment.content}</td>
                    <td>${comment.date}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-delete-comment" 
                                data-blogid="${comment.blogId}" 
                                data-commentid="${comment.id}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    commentsContainer.innerHTML = '';
    commentsContainer.appendChild(table);
    
    // 添加删除评论事件
    document.querySelectorAll('.btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', function() {
            const blogId = parseInt(this.getAttribute('data-blogid'));
            const commentId = parseInt(this.getAttribute('data-commentid'));
            deleteComment(blogId, commentId);
        });
    });
}

// 删除评论
function deleteComment(blogId, commentId) {
    if (!confirm('确定要删除这条评论吗？')) {
        return;
    }
    
    const allComments = JSON.parse(localStorage.getItem('kon-comments') || '{}');
    
    if (allComments[blogId]) {
        allComments[blogId] = allComments[blogId].filter(
            comment => comment.id !== commentId
        );
        
        // 如果该文章没有评论了，删除整个键
        if (allComments[blogId].length === 0) {
            delete allComments[blogId];
        }
        
        localStorage.setItem('kon-comments', JSON.stringify(allComments));
        
        // 更新文章的评论数
        const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
        const blogIndex = blogs.findIndex(b => b.id === blogId);
        if (blogIndex !== -1) {
            blogs[blogIndex].comments = allComments[blogId] ? allComments[blogId].length : 0;
            localStorage.setItem('kon-blogs', JSON.stringify(blogs));
        }
        
        // 重新渲染评论列表和统计数据
        renderComments();
        updateDashboardStats();
    }
}

// 初始化设置表单
function initSettingsForm() {
    const settingsForm = document.getElementById('settings-form');
    if (!settingsForm) return;
    
    // 加载保存的设置
    const settings = JSON.parse(localStorage.getItem('kon-settings') || '{}');
    
    // 填充表单
    document.getElementById('site-title').value = settings.siteTitle || 'kon-myblog';
    document.getElementById('hero-title').value = settings.heroTitle || '欢迎来到我的技术博客';
    document.getElementById('hero-subtitle').value = settings.heroSubtitle || '网络安全学习者 | 记录成长，分享知识';
    document.getElementById('profile-desc').value = settings.profileDesc || '网络安全小白，热爱技术探索，记录学习路上的思考与实践。';
    
    // 表单提交事件
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newSettings = {
            siteTitle: document.getElementById('site-title').value,
            heroTitle: document.getElementById('hero-title').value,
            heroSubtitle: document.getElementById('hero-subtitle').value,
            profileDesc: document.getElementById('profile-desc').value
        };
        
        localStorage.setItem('kon-settings', JSON.stringify(newSettings));
        alert('设置已保存');
    });
}

// 初始化密码修改表单
function initPasswordForm() {
    const passwordForm = document.getElementById('password-form');
    if (!passwordForm) return;
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // 验证当前密码（默认初始密码）
        const savedPassword = localStorage.getItem('kon-admin-password') || 'hfhf888888';
        if (currentPassword !== savedPassword) {
            alert('当前密码不正确');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('两次输入的新密码不一致');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('密码长度不能少于6位');
            return;
        }
        
        // 保存新密码
        localStorage.setItem('kon-admin-password', newPassword);
        alert('密码修改成功，请使用新密码登录');
        
        // 重置表单
        passwordForm.reset();
    });
}

// 初始化标签页切换
function initTabs() {
    const tabButtons = document.querySelectorAll('.admin-tabs button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 更新按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应的内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // 特定标签页需要时重新加载数据
            if (tabId === 'comments-tab') {
                renderComments();
            }
        });
    });
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('kon-myblog-admin');
        window.location.href = 'index.html';
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 验证登录状态（已在HTML中处理，但再次确认）
    if (!localStorage.getItem('kon-myblog-admin')) {
        window.location.href = 'index.html';
        return;
    }
    
    // 初始化各个模块
    initBlogs();
    initTabs();
    initSettingsForm();
    initPasswordForm();
    
    // 事件监听 - 新增文章按钮
    const addBlogBtn = document.getElementById('add-blog-btn');
    if (addBlogBtn) {
        addBlogBtn.addEventListener('click', () => openEditModal());
    }
    
    // 事件监听 - 文章表单提交
    const blogForm = document.getElementById('blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', saveBlog);
    }
    
    // 事件监听 - 关闭模态框
    const closeBtn = document.querySelector('.close-btn');
    const modal = document.getElementById('blog-modal');
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // 点击模态框外部关闭
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // 事件监听 - 退出登录
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
