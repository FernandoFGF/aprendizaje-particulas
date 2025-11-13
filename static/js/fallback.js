const FallbackManager = {
    resources: {
        css: '/static/css/bootstrap.min.css',
        icons: '/static/css/bootstrap-icons.min.css',
        js: '/static/js/bootstrap.bundle.min.js'
    },

    init() {
        this.setupErrorHandling();
        this.setupProactiveCheck();
    },

    setupErrorHandling() {
        window.fallbackToLocalCSS = (element) => this.handleFallback(element, 'css');
        window.fallbackToLocalIcons = (element) => this.handleFallback(element, 'icons');
        window.fallbackToLocalJS = (element) => this.handleFallback(element, 'js');
    },

    handleFallback(element, type) {
        console.warn(`Fallback activado para ${type}`);
        element.onerror = null;

        switch(type) {
            case 'css':
                element.href = this.resources.css;
                break;
            case 'icons':
                element.href = this.resources.icons;
                break;
            case 'js':
                element.src = this.resources.js;
                break;
        }
    },

    setupProactiveCheck() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkResources());
        } else {
            this.checkResources();
        }
    },

    checkResources() {
        setTimeout(() => {
            const bootstrapLoaded = typeof bootstrap !== 'undefined' ||
                                  document.querySelector('.btn');

            if (!bootstrapLoaded) {
                console.warn('Bootstrap no detectado, verificando recursos...');
                this.forceLocalFallback();
            }
        }, 2000);
    },

    forceLocalFallback() {
        const bootstrapCSS = document.querySelector('link[href*="bootstrap"]');
        const bootstrapIcons = document.querySelector('link[href*="bootstrap-icons"]');
        const bootstrapJS = document.querySelector('script[src*="bootstrap"]');

        if (bootstrapCSS) this.handleFallback(bootstrapCSS, 'css');
        if (bootstrapIcons) this.handleFallback(bootstrapIcons, 'icons');
        if (bootstrapJS) this.handleFallback(bootstrapJS, 'js');
    }
};

FallbackManager.init();