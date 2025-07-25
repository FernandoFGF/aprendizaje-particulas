class LearnNavigator {
    constructor(particles) {
        this.particles = particles || [];
        this.currentIndex = 0;
        this.zoomInstance = null;
        this.characteristicsVisible = false;
        this.initElements();
        this.setupEventListeners();
        this.updateUI();
    }

    initElements() {
        this.elements = {
            zoomImage: document.getElementById('zoom-image'),
            particleNumber: document.getElementById('particle-number'),
            totalParticles: document.getElementById('total-particles'),
            progressBar: document.getElementById('progress-bar'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            showCharacteristicsBtn: document.getElementById('show-characteristics-btn'),
            characteristicsPanel: document.getElementById('characteristics-panel'),
            interactionType: document.getElementById('interaction-type'),
            flavor: document.getElementById('flavor'),
            interactionMode: document.getElementById('interaction-mode')
        };
    }

    setupEventListeners() {
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.navigate(1));
        }
        if (this.elements.showCharacteristicsBtn) {
            this.elements.showCharacteristicsBtn.addEventListener('click', () => this.toggleCharacteristics());
        }
    }

    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.particles.length) {
            this.currentIndex = newIndex;
            this.characteristicsVisible = false;
            this.updateUI();
        }
    }

    toggleCharacteristics() {
        this.characteristicsVisible = !this.characteristicsVisible;
        this.updateCharacteristicsDisplay();
    }

    updateCharacteristicsDisplay() {
        if (!this.elements.characteristicsPanel || !this.elements.showCharacteristicsBtn) return;

        if (this.characteristicsVisible) {
            this.elements.characteristicsPanel.classList.remove('characteristics-hidden');
            this.elements.characteristicsPanel.classList.add('characteristics-visible');
            this.elements.showCharacteristicsBtn.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Ocultar Características';
            this.updateCharacteristicsContent();
        } else {
            this.elements.characteristicsPanel.classList.add('characteristics-hidden');
            this.elements.characteristicsPanel.classList.remove('characteristics-visible');
            this.elements.showCharacteristicsBtn.innerHTML = '<i class="bi bi-eye me-2"></i>Mostrar Características';
        }
    }

    updateCharacteristicsContent() {
        if (this.particles.length === 0) return;

        const particle = this.particles[this.currentIndex];

        const interactionTypeMap = {
            0: 'CC (Corriente Cargada)',
            1: 'NC (Corriente Neutra)'
        };

        const flavorMap = {
            12: 'Electrón',
            14: 'Muón',
            16: 'Tau'
        };

        const interactionModeMap = {
            0: 'QE (Quasi-Elástico)',
            1: 'MEC (Meson Exchange Current)',
            2: 'RES (Resonancia)',
            3: 'DIS (Deep Inelastic Scattering)',
            10: 'COH (Coherente)'
        };

        if (this.elements.interactionType) {
            this.elements.interactionType.textContent = interactionTypeMap[particle.tipo_interaccion] || 'Desconocido';
        }
        if (this.elements.flavor) {
            this.elements.flavor.textContent = flavorMap[particle.sabor] || 'Desconocido';
        }
        if (this.elements.interactionMode) {
            this.elements.interactionMode.textContent = interactionModeMap[particle.modo_interaccion] || 'Desconocido';
        }
    }

    updateUI() {
        if (this.particles.length === 0) {
            this.disableNavigation();
            return;
        }

        const particle = this.particles[this.currentIndex];

        if (this.elements.zoomImage) {
            this.elements.zoomImage.src = `/imagen_externa/${encodeURIComponent(particle.path)}`;
            this.elements.zoomImage.dataset.zoom = `/imagen_externa/${encodeURIComponent(particle.path)}`;

            if (this.zoomInstance) {
                this.zoomInstance.destroy();
            }
            this.zoomInstance = new ImageZoom(this.elements.zoomImage, {
                zoomFactor: 3,
                lensSize: 200,
                borderWidth: 3,
                borderColor: '#fff',
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
            });
        }

        if (this.elements.particleNumber) {
            this.elements.particleNumber.textContent = this.currentIndex + 1;
        }
        if (this.elements.totalParticles) {
            this.elements.totalParticles.textContent = this.particles.length;
        }

        if (this.elements.progressBar) {
            const progress = ((this.currentIndex + 1) / this.particles.length) * 100;
            this.elements.progressBar.style.width = `${progress}%`;
        }

        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = this.currentIndex === 0;
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = this.currentIndex === this.particles.length - 1;
        }

        this.updateCharacteristicsDisplay();
    }

    disableNavigation() {
        if (this.elements.prevBtn) this.elements.prevBtn.disabled = true;
        if (this.elements.nextBtn) this.elements.nextBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const particlesDataElement = document.getElementById('particles-data');
    let particles = [];

    if (particlesDataElement) {
        try {
            particles = JSON.parse(particlesDataElement.textContent);
        } catch (e) {
            console.error('Error parsing particles data:', e);
        }
    }

    window.learnNavigator = new LearnNavigator(particles);
});