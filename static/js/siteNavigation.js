const SECTIONS = {
    INTRODUCTION: 'introduction',
    MODES: 'modes',
    EXERCISE: 'exercise'
};

const VALID_SECTIONS = new Set(Object.values(SECTIONS));

function initApp() {
    setupEventListeners();
    setupScrollEffect();
}

function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    const logoHome = document.getElementById('logo-home');
    if (logoHome) {
        logoHome.addEventListener('click', navigateToHome);
    }
}

function setupScrollEffect() {
    const header = document.getElementById('header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function navigateToHome() {
    hideAllSections();
    removeActiveLinks();

    document.getElementById('home-content').classList.add('active');

    scrollToTop();
}

function navigateToSection(sectionName) {
    if (!VALID_SECTIONS.has(sectionName)) {
        console.error(`Sección inválida: ${sectionName}`);
        return;
    }

    if (sectionName === SECTIONS.EXERCISE) {
        loadEjercicioContent();
        return;
    }

    hideAllSections();
    removeActiveLinks();

    const targetContent = document.getElementById(sectionName + '-content');
    if (targetContent) {
        targetContent.classList.add('active');
    }

    const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }

    scrollToTop();
}

function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
}

function removeActiveLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadEjercicioContent() {
    window.location.href = baseUrl + '/classify.html';
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', initApp);