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
                            <i class="fas fa-edit"></i> 编辑（源码教程）
                        </button>
                        <button class="btn btn-sm btn-delete" data-id="${blog.id}">
                            <i class="fas fa-trash"></i> 删除（源码教程）
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
            // 编辑按钮改为显示源码修改教程
            showEditSourceCodeTutorial(blogId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const blogId = parseInt(this.getAttribute('data-id'));
            // 删除按钮改为显示源码修改教程
            showDeleteSourceCodeTutorial(blogId);
        });
    });
}

// 显示编辑文章的源代码修改教程
function showEditSourceCodeTutorial(blogId) {
    const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
    const blog = blogs.find(b => b.id === blogId);
    
    if (!blog) return;
    
    alert(`【编辑文章源代码修改教程】
1. 打开仓库中的 data/blogs.json 文件
2. 找到id为 ${blogId} 的文章对象：
{
  "id": ${blogId},
  "title": "${blog.title}",
  "content": "${blog.content.substring(0, 30)}...",
  ...
}
3. 修改需要更新的字段（title、content、category等）
4. 注意保持JSON格式正确性（逗号、引号等）
5. 保存文件并提交到GitHub仓库
6. 等待页面部署后生效`);
}

// 显示删除文章的源代码修改教程
function showDeleteSourceCodeTutorial(blogId) {
    alert(`【删除文章源代码修改教程】
1. 打开仓库中的 data/blogs.json 文件
2. 找到id为 ${blogId} 的文章对象
3. 删除该对象（注意删除前后的逗号，确保JSON格式正确）
4. 同时删除评论数据：打开 data/comments.json，删除key为 ${blogId} 的评论数组
5. 保存文件并提交到GitHub仓库
6. 等待页面部署后生效`);
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

// 打开编辑模态框（保留函数但实际不会被调用）
function openEditModal(blogId) {
    // 此函数已被禁用，改为显示源码教程
}

// 保存文章（保留函数但实际不会被调用）
function saveBlog(e) {
    e.preventDefault();
    alert('请通过修改源代码的方式更新文章，具体教程请点击"编辑（源码教程）"按钮查看');
}

// 删除文章（保留函数但实际不会被调用）
function deleteBlog(blogId) {
    // 此函数已被禁用，改为显示源码教程
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
    
    // 事件监听 - 新增文章按钮（改为显示源码教程）
    const addBlogBtn = document.getElementById('add-blog-btn');
    if (addBlogBtn) {
        addBlogBtn.addEventListener('click', () => {
            const blogs = JSON.parse(localStorage.getItem('kon-blogs') || '[]');
            const newId = blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1;
            
            alert(`【新增文章源代码修改教程】
1. 打开仓库中的 data/blogs.json 文件
2. 在数组中添加新的文章对象，格式如下：
{
  "id": ${newId},  // 确保ID唯一（比现有最大ID大1）
  "title": "文章标题",
  "content": "文章内容（支持换行）",
  "image": "图片URL",  // 如：https://images.unsplash.com/xxx
  "date": "${new Date().toISOString().split('T')[0]}",  // 日期格式：YYYY-MM-DD
  "comments": 0,  // 初始评论数为0
  "category": "security",  // 分类标识（security/tools/ctf/linux）
  "tags": ["标签1", "标签2"]  // 文章标签数组
}
3. 保存文件并提交到GitHub仓库
4. 等待页面部署后生效`);
        });
    }
    
    // 事件监听 - 文章表单提交（禁用默认保存功能）
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
