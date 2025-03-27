/**
 * AI导航 - 视觉效果脚本
 * 实现高级视觉效果，包括粒子背景、卡片3D倾斜和数据流动画
 */

document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有视觉效果
    initEffects();
});

// 全局变量用于控制
let morphingBgAnimationId = null;

/**
 * 初始化所有效果
 */
function initEffects() {
    // 初始化页面过渡效果
    initPageTransitions();
    
    // 初始化卡片倾斜效果
    initTiltEffect();
    
    // 检查用户首选项以决定是否启用某些效果
    const preferences = JSON.parse(localStorage.getItem('ai-nav-preferences')) || {
        enableParticles: true,
        enableDataStreams: true,
        enableMorphingBg: true,
        enableMouseEffects: false
    };
    
    // 基于用户偏好初始化效果
    if (preferences.enableParticles) {
        initParticles();
    }
    
    if (preferences.enableDataStreams) {
        initDataStreams();
    }
    
    if (preferences.enableMorphingBg) {
        initMorphingBackground();
    }
    
    if (preferences.enableMouseEffects) {
        initMouseGlow();
    }
}

/**
 * 初始化粒子效果
 */
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 40,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#6e56cf'
                },
                shape: {
                    type: ['circle', 'triangle', 'polygon'],
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.2,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.2,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#6e56cf',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.8,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 3
                    }
                }
            },
            retina_detect: true
        });
    }

    // 为深色模式监听主题变化
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', updateParticlesTheme);
    }

    // 初始应用正确的粒子主题
    updateParticlesTheme();
}

/**
 * 根据当前主题更新粒子颜色
 */
function updateParticlesTheme() {
    if (typeof pJSDom === 'undefined' || !pJSDom.length) return;
    
    const isDarkMode = document.body.classList.contains('dark-theme');
    const colorTheme = document.body.getAttribute('data-color-theme') || 'default';
    
    let particleColor, linkColor;
    
    switch(colorTheme) {
        case 'green':
            particleColor = isDarkMode ? '#34d399' : '#10b981';
            linkColor = isDarkMode ? '#34d399' : '#10b981';
            break;
        case 'red':
            particleColor = isDarkMode ? '#f87171' : '#ef4444';
            linkColor = isDarkMode ? '#f87171' : '#ef4444';
            break;
        case 'pink':
            particleColor = isDarkMode ? '#f472b6' : '#ec4899';
            linkColor = isDarkMode ? '#f472b6' : '#ec4899';
            break;
        default:
            particleColor = isDarkMode ? '#9f8aef' : '#6e56cf';
            linkColor = isDarkMode ? '#9f8aef' : '#6e56cf';
    }
    
    // 更新粒子颜色
    pJSDom[0].pJS.particles.color.value = particleColor;
    pJSDom[0].pJS.particles.line_linked.color = linkColor;
    
    // 更新现有粒子
    for (let i = 0; i < pJSDom[0].pJS.particles.array.length; i++) {
        const particle = pJSDom[0].pJS.particles.array[i];
        particle.color.value = particleColor;
    }
    
    // 更新线条颜色
    pJSDom[0].pJS.fn.particlesRefresh();
}

/**
 * 初始化卡片的3D倾斜效果
 */
function initTiltEffect() {
    if (typeof VanillaTilt === 'undefined') return;
    
    // 为所有卡片添加倾斜效果
    VanillaTilt.init(document.querySelectorAll(".card"), {
        max: 8,
        speed: 300,
        glare: true,
        "max-glare": 0.2,
        scale: 1.03
    });
}

/**
 * 初始化页面过渡动画
 */
function initPageTransitions() {
    // 为内容区域添加随机淡入延迟，创造错落有致的效果
    const contentElements = document.querySelectorAll('.card, .ai-assistant, .recommendations, header, nav, footer');
    contentElements.forEach((element, index) => {
        const delay = 0.1 + Math.random() * 0.3; // 100ms到400ms之间的随机延迟
        element.style.transitionDelay = `${delay}s`;
        element.classList.add('fade-in-element');
    });
    
    // 导航链接点击时的平滑过渡
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 现有的导航逻辑保持不变，这里只添加过渡效果
            const allSections = document.querySelectorAll('.content-section');
            allSections.forEach(section => {
                section.classList.add('section-exit');
            });
            
            setTimeout(() => {
                allSections.forEach(section => {
                    section.classList.remove('section-exit');
                });
            }, 300);
        });
    });
}

/**
 * 初始化数据流动画
 */
function initDataStreams() {
    const streams = document.querySelectorAll('.data-stream');
    
    streams.forEach(stream => {
        // 为每个数据流设置随机属性
        const duration = 15 + Math.random() * 20; // 15-35秒
        const delay = Math.random() * 5; // 0-5秒延迟
        const size = 0.5 + Math.random() * 1.5; // 0.5-2倍大小
        
        stream.style.setProperty('--duration', `${duration}s`);
        stream.style.setProperty('--delay', `${delay}s`);
        stream.style.setProperty('--size', size);
        
        // 创建数据点
        const pointCount = 10 + Math.floor(Math.random() * 15); // 10-25个数据点
        
        for (let i = 0; i < pointCount; i++) {
            const dataPoint = document.createElement('div');
            dataPoint.className = 'data-point';
            
            // 随机数据点大小和透明度
            const pointSize = 3 + Math.random() * 5; // 3-8px
            const opacity = 0.2 + Math.random() * 0.5; // 0.2-0.7
            
            dataPoint.style.width = `${pointSize}px`;
            dataPoint.style.height = `${pointSize}px`;
            dataPoint.style.opacity = opacity;
            
            // 随机延迟
            const pointDelay = Math.random() * duration;
            dataPoint.style.animationDelay = `${pointDelay}s`;
            
            stream.appendChild(dataPoint);
        }
    });
    
    // 随机改变数据流的路径
    setInterval(() => {
        streams.forEach(stream => {
            // 随机生成新的控制点
            const curve1 = 10 + Math.random() * 40;
            const curve2 = 10 + Math.random() * 40;
            
            // 应用新的贝塞尔曲线
            stream.style.setProperty('--curve1', curve1);
            stream.style.setProperty('--curve2', curve2);
        });
    }, 10000); // 每10秒改变一次
}

/**
 * 初始化背景渐变变形效果
 */
function initMorphingBackground() {
    const body = document.body;
    let hue = 0;
    
    // 只有在用户启用了渐变背景动画时才激活
    // 注意：这里可以通过设置面板来控制是否启用
    
    function updateGradient() {
        hue = (hue + 0.1) % 360;
        
        // 使用HSL颜色以便于控制色相变化
        let color1, color2;
        
        const colorTheme = body.getAttribute('data-color-theme') || 'default';
        const isDarkMode = body.classList.contains('dark-theme');
        
        // 根据主题设置基础色相
        let baseHue1, baseHue2;
        
        switch(colorTheme) {
            case 'green':
                baseHue1 = 160;
                baseHue2 = 220;
                break;
            case 'red':
                baseHue1 = 0;
                baseHue2 = 40;
                break;
            case 'pink':
                baseHue1 = 320;
                baseHue2 = 270;
                break;
            default:
                baseHue1 = 260;
                baseHue2 = 200;
        }
        
        // 微妙地改变色相，不要偏离太远
        const hue1 = (baseHue1 + Math.sin(hue * 0.05) * 5) % 360;
        const hue2 = (baseHue2 + Math.cos(hue * 0.05) * 5) % 360;
        
        // 为深色模式调整亮度和饱和度
        if (isDarkMode) {
            color1 = `hsla(${hue1}, 30%, 10%, 0.15)`;
            color2 = `hsla(${hue2}, 30%, 10%, 0.15)`;
        } else {
            color1 = `hsla(${hue1}, 30%, 60%, 0.15)`;
            color2 = `hsla(${hue2}, 30%, 60%, 0.15)`;
        }
        
        // 更新径向渐变
        body.style.backgroundImage = `
            radial-gradient(circle at ${20 + Math.sin(hue * 0.02) * 10}% ${35 + Math.cos(hue * 0.03) * 5}%, ${color1} 0%, transparent 50%),
            radial-gradient(circle at ${75 + Math.cos(hue * 0.02) * 10}% ${15 + Math.sin(hue * 0.03) * 5}%, ${color2} 0%, transparent 60%)
        `;
        
        // 慢速动画，请求下一帧
        requestAnimationFrame(updateGradient);
    }
    
    // 开始背景动画
    // 这里可以添加条件判断，只有在用户启用动态背景时才执行
    // 例如：if (userPreferences.dynamicBackground) { ... }
    requestAnimationFrame(updateGradient);
}

/**
 * 鼠标跟踪效果 - 光标周围的光晕
 */
function initMouseGlow() {
    const glowEffect = document.createElement('div');
    glowEffect.className = 'mouse-glow';
    document.body.appendChild(glowEffect);
    
    // 鼠标移动时更新光晕位置
    document.addEventListener('mousemove', (e) => {
        glowEffect.style.left = `${e.clientX}px`;
        glowEffect.style.top = `${e.clientY}px`;
    });
    
    // 鼠标进入可点击元素时改变光晕
    const interactiveElements = document.querySelectorAll('a, button, .card, .nav-link');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            glowEffect.classList.add('glow-active');
        });
        
        element.addEventListener('mouseleave', () => {
            glowEffect.classList.remove('glow-active');
        });
    });
} 