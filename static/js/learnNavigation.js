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
            interactionMode: document.getElementById('interaction-mode'),
            heavyIonTracks: document.getElementById('heavy-ion-tracks'),
            lightIonTracks: document.getElementById('light-ion-tracks'),
            photonShowers: document.getElementById('photon-showers'),
            electronShowers: document.getElementById('electron-showers')
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

    async navigate(direction) {
        const baseUrl = window.appConfig ? window.appConfig.baseUrl : '';

        try {
            const response = await fetch(`${baseUrl}/check_session`);
            if (!response.ok) {
                alert('Tu sesión ha expirado. Serás redirigido a la página de inicio de sesión.');
                window.location.reload();
                return;
            }
        } catch (error) {
            alert('Error de conexión. La página se recargará.');
            window.location.reload();
            return;
        }

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
            14: 'Muon',
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
            this.elements.interactionType.textContent = interactionTypeMap[particle.interaction_type] || 'Desconocido';
        }
        if (this.elements.flavor) {
            this.elements.flavor.textContent = flavorMap[particle.flavor] || 'Desconocido';
        }
        if (this.elements.interactionMode) {
            this.elements.interactionMode.textContent = interactionModeMap[particle.interaction_mode] || 'Desconocido';
        }
        if (this.elements.heavyIonTracks) {
            this.elements.heavyIonTracks.textContent = particle.heavy_ion_track_count || '0';
        }
        if (this.elements.lightIonTracks) {
            this.elements.lightIonTracks.textContent = particle.light_ion_track_count || '0';
        }
        if (this.elements.photonShowers) {
            this.elements.photonShowers.textContent = particle.photon_shower_count || '0';
        }
        if (this.elements.electronShowers) {
            this.elements.electronShowers.textContent = particle.electron_shower_count || '0';
        }
    }

    updateUI() {
        if (this.particles.length === 0) {
            this.disableNavigation();
            return;
        }

        const particle = this.particles[this.currentIndex];

        if (this.elements.zoomImage) {
            const baseUrl = window.appConfig ? window.appConfig.baseUrl : '';
            const serveImagesViaFlask = window.appConfig ? window.appConfig.serveImagesViaFlask : true;

            this.elements.zoomImage.src = `${baseUrl}/imagen_externa/learning/${encodeURIComponent(particle.image_path)}`;
            this.elements.zoomImage.dataset.zoom = `${baseUrl}/imagen_externa/learning/${encodeURIComponent(particle.image_path)}`;

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

        this.updateEnergyValues(particle);
        this.updateCharacteristicsDisplay();
    }

    updateEnergyValues(particle) {
        const neutrinoEnergyElement = document.getElementById('learn-neutrino-energy');
        if (neutrinoEnergyElement && particle.neutrino_energy !== undefined) {
            const formattedEnergy = parseFloat(particle.neutrino_energy).toFixed(6);
            neutrinoEnergyElement.textContent = `${formattedEnergy} GeV`;
        }

        const depositedEnergyElement = document.getElementById('learn-deposited-energy');
        if (depositedEnergyElement && particle.neutrino_energy !== undefined && particle.invisible_energy !== undefined) {
            const depositedEnergy = parseFloat(particle.neutrino_energy) - parseFloat(particle.invisible_energy || 0);
            const formattedDepositedEnergy = depositedEnergy.toFixed(6);
            depositedEnergyElement.textContent = `${formattedDepositedEnergy} GeV`;
        }
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