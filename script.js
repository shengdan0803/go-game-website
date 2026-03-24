// ==================== 导航栏功能 ====================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.getElementById('navbar');

// 移动端菜单切换
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// 点击导航链接后关闭移动端菜单
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// 滚动时导航栏样式变化
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==================== 平滑滚动 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== 滚动动画 ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// 观察所有需要动画的元素
document.querySelectorAll('.timeline-item, .project-card, .skill-item, .about-content, .contact-content').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ==================== 技能条动画 ====================
const skillsSection = document.querySelector('.skills');
let skillsAnimated = false;

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !skillsAnimated) {
            skillsAnimated = true;
            document.querySelectorAll('.skill-progress').forEach(bar => {
                const targetWidth = bar.getAttribute('data-width') || bar.style.width;
                bar.style.width = targetWidth;
            });
        }
    });
}, { threshold: 0.3 });

if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// ==================== 表单提交 ====================
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 这里可以添加实际的表单提交逻辑
    // 例如通过 AJAX 发送到后端服务器

    alert('感谢您的消息！我会尽快回复您。\n\n注意：这是一个演示表单，实际不会发送消息。');
    contactForm.reset();
});

// ==================== 导航高亮 ====================
const sections = document.querySelectorAll('section[id]');

const highlightNav = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
};

window.addEventListener('scroll', highlightNav);

// ==================== 页面加载动画 ====================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== 鼠标跟随效果（可选） ====================
const createMouseFollower = () => {
    const follower = document.createElement('div');
    follower.className = 'mouse-follower';
    follower.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(108, 92, 231, 0.3);
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
        display: none;
    `;
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        follower.style.display = 'block';
    });

    const animate = () => {
        const distX = mouseX - followerX;
        const distY = mouseY - followerY;

        followerX += distX * 0.1;
        followerY += distY * 0.1;

        follower.style.left = followerX - 10 + 'px';
        follower.style.top = followerY - 10 + 'px';

        requestAnimationFrame(animate);
    };

    animate();
};

// 只在桌面端启用鼠标跟随效果
if (window.innerWidth > 968) {
    // createMouseFollower(); // 取消注释以启用
}

// ==================== 统计数字动画 ====================
const animateStats = () => {
    const stats = document.querySelectorAll('.stat-item h4');

    stats.forEach(stat => {
        const target = stat.innerText;
        const isPlus = target.includes('+');
        const number = parseInt(target.replace(/[^0-9]/g, ''));
        let current = 0;
        const increment = number / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        const counter = setInterval(() => {
            current += increment;
            if (current >= number) {
                stat.innerText = target;
                clearInterval(counter);
            } else {
                stat.innerText = Math.floor(current) + (target.includes('万') ? '万' : '') + (isPlus ? '+' : '');
            }
        }, stepTime);
    });
};

const statsSection = document.querySelector('.about-stats');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            animateStats();
        }
    });
}, { threshold: 0.5 });

if (statsSection) {
    statsObserver.observe(statsSection);
}

// ==================== 打字机效果优化 ====================
const typingText = document.querySelector('.typing-text');
if (typingText) {
    // 在动画结束后移除光标
    setTimeout(() => {
        typingText.style.borderRight = 'none';
    }, 4500);
}

// ==================== 项目卡片悬浮效果增强 ====================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ==================== 时间线动画 ====================
const timelineItems = document.querySelectorAll('.timeline-item');

timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-50px)';

    setTimeout(() => {
        item.style.transition = 'all 0.6s ease';
    }, 100);
});

const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, { threshold: 0.2 });

timelineItems.forEach(item => {
    timelineObserver.observe(item);
});

console.log('🎉 崔盛丹的个人网页已加载完成！');
console.log('📧 联系邮箱：dd1406098292@163.com');
console.log('📱 联系电话：157 1630 0237');
