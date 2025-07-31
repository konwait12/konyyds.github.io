// 获取博客数据
function getBlogs() {
    return JSON.parse(localStorage.getItem('kon-myblog-blogs')) || [
        // 初始博客数据
        {
            id: 1,
            title: "网络安全基础：如何保护你的在线隐私",
            content: "在数字时代，保护个人隐私变得尤为重要。本文将介绍基本的网络安全概念和实践，帮助您建立第一道防线...",
            fullContent: `<h2>网络安全基础：如何保护你的在线隐私</h2>
            <p>在数字时代，保护个人隐私变得尤为重要。随着我们越来越多地将个人信息存储在云端并在网上进行交易，了解如何保护这些信息免受窥探至关重要。</p>
            <h3>1. 强密码的重要性</h3>
            <p>使用强密码是保护在线账户的第一道防线。一个强密码应该：</p>
            <ul>
                <li>至少包含12个字符</li>
                <li>混合使用大小写字母、数字和特殊符号</li>
                <li>避免使用个人信息（如姓名、生日等）</li>
                <li>不同账户使用不同密码</li>
            </ul>
            <h3>2. 双因素认证(2FA)</h3>
            <p>双因素认证为您的账户提供了额外的安全层。即使有人获取了您的密码，他们也需要第二个验证因素才能登录。常见的2FA方法包括：</p>
            <ul>
                <li>短信验证码</li>
                <li>身份验证器应用（如Google Authenticator）</li>
                <li>硬件安全密钥</li>
            </ul>`,
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            date: "2023-07-15",
            author: "网络安全小白",
            comments: 12,
            category: "security",
            tags: ["网络安全", "隐私保护"]
        },
        // 更多博客数据...
    ];
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