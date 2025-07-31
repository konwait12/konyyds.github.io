// 初始化博客详情页
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
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

// 加载博客内容
function loadBlog(blogId) {
    // 获取所有博客
    const blogs = getBlogs();
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
                <span><i class="far fa-user"></i> ${blog.author}</span>
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
function loadRelatedPosts(currentBlogId) {
    const blogs = getBlogs();
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

// 加载评论
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
    
    // 更新博客评论数
    updateBlogCommentCount(blogId, comments.length);
    
    // 提示用户
    alert('评论已提交，感谢您的参与！');
}

// 更新博客评论数
function updateBlogCommentCount(blogId, count) {
    const blogs = getBlogs();
    const blogIndex = blogs.findIndex(b => b.id == blogId);
    
    if (blogIndex !== -1) {
        blogs[blogIndex].comments = count;
        localStorage.setItem('kon-myblog-blogs', JSON.stringify(blogs));
    }
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