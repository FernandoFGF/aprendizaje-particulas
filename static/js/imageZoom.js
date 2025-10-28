class ImageZoom {
    constructor(imageElement, options = {}) {
        this.image = imageElement;
        this.options = {
            zoomFactor: options.zoomFactor || 3,
            lensSize: options.lensSize || 200,
            borderWidth: options.borderWidth || 3,
            borderColor: options.borderColor || '#fff',
            shadowBlur: options.shadowBlur || 20,
            shadowColor: options.shadowColor || 'rgba(0, 0, 0, 0.3)',
            ...options
        };

        this.isActive = false;
        this.zoomContainer = null;
        this.lastMousePos = { clientX: 0, clientY: 0 };

        this.init();
    }

    init() {
        this.createZoomElements();
        this.bindEvents();
    }

    createZoomElements() {
        this.zoomContainer = document.createElement('div');
        this.zoomContainer.className = 'image-zoom-container';
        this.zoomContainer.style.cssText = `
            position: fixed;
            width: ${this.options.lensSize}px;
            height: ${this.options.lensSize}px;
            border: ${this.options.borderWidth}px solid ${this.options.borderColor};
            border-radius: 50%;
            box-shadow: 0 0 ${this.options.shadowBlur}px ${this.options.shadowColor};
            background: white;
            overflow: hidden;
            pointer-events: none;
            z-index: 1000;
            display: none;
        `;

        this.zoomImage = document.createElement('img');
        this.zoomImage.src = this.image.src;
        this.zoomImage.style.cssText = `
            position: absolute;
            width: ${this.image.naturalWidth * this.options.zoomFactor}px;
            height: ${this.image.naturalHeight * this.options.zoomFactor}px;
            max-width: none;
            max-height: none;
        `;

        this.zoomContainer.appendChild(this.zoomImage);
        document.body.appendChild(this.zoomContainer);
    }

    bindEvents() {
        this.image.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.image.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.image.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleScroll.bind(this));

        this.image.addEventListener('load', this.updateZoomImage.bind(this));
    }

    handleMouseEnter(e) {
        this.isActive = true;
        this.zoomContainer.style.display = 'block';
        this.updateZoomImage();

        this.lastMousePos = { clientX: e.clientX, clientY: e.clientY };
        this.updateZoomPosition(e.clientX, e.clientY);
    }

    handleMouseMove(e) {
        if (!this.isActive) return;

        this.lastMousePos = { clientX: e.clientX, clientY: e.clientY };
        this.updateZoomPosition(e.clientX, e.clientY);
    }

    handleMouseLeave(e) {
        this.isActive = false;
        this.zoomContainer.style.display = 'none';
        this.lastMousePos = { clientX: 0, clientY: 0 };
    }

    handleScroll() {
        if (this.isActive) {
            this.updateZoomPosition(this.lastMousePos.clientX, this.lastMousePos.clientY);
        }
    }

    updateZoomPosition(clientX, clientY) {
        const rect = this.image.getBoundingClientRect();

        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            this.handleMouseLeave();
            return;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const relativeX = x / rect.width;
        const relativeY = y / rect.height;

        const lensX = clientX - this.options.lensSize / 2;
        const lensY = clientY - this.options.lensSize / 2;

        const halfBorder = this.options.borderWidth;
        const maxX = window.innerWidth - this.options.lensSize - halfBorder * 2;
        const maxY = window.innerHeight - this.options.lensSize - halfBorder * 2;

        this.zoomContainer.style.left = Math.max(0, Math.min(lensX, maxX)) + 'px';
        this.zoomContainer.style.top = Math.max(0, Math.min(lensY, maxY)) + 'px';

        const zoomImageWidth = this.image.naturalWidth * this.options.zoomFactor;
        const zoomImageHeight = this.image.naturalHeight * this.options.zoomFactor;

        const offsetX = -relativeX * zoomImageWidth + this.options.lensSize / 2;
        const offsetY = -relativeY * zoomImageHeight + this.options.lensSize / 2;

        this.zoomImage.style.left = offsetX + 'px';
        this.zoomImage.style.top = offsetY + 'px';
    }

    updateZoomImage() {
        if (this.zoomImage && this.image.naturalWidth && this.image.naturalHeight) {
            this.zoomImage.src = this.image.src;
            this.zoomImage.style.width = (this.image.naturalWidth * this.options.zoomFactor) + 'px';
            this.zoomImage.style.height = (this.image.naturalHeight * this.options.zoomFactor) + 'px';
        }
    }

    destroy() {
        if (this.zoomContainer && this.zoomContainer.parentNode) {
            this.zoomContainer.parentNode.removeChild(this.zoomContainer);
        }

        this.image.removeEventListener('mouseenter', this.handleMouseEnter);
        this.image.removeEventListener('mousemove', this.handleMouseMove);
        this.image.removeEventListener('mouseleave', this.handleMouseLeave);
        this.image.removeEventListener('load', this.updateZoomImage);

        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
    }
}