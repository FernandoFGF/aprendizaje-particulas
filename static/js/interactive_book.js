class InteractiveBook {
    constructor() {
        this.currentPageIndex = 0;
        this.bookData = null;
        this.pagesContainer = document.getElementById('bookPages');
        this.currentPageElement = document.getElementById('currentPage');
        this.totalPagesElement = document.getElementById('totalPages');
        this.progressBar = document.getElementById('progressBar');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');

        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);

        this.init();
    }

    async init() {
        await this.loadBookContent();
        this.renderPages();
        this.updateNavigation();
        this.updateProgressBar();
        this.setupEventListeners();
    }

    async loadBookContent() {
        try {
            if (window.bookContent) {
            this.bookData = window.bookContent;
        } else {
            throw new Error('Book content not available');
        }
        this.totalPagesElement.textContent = this.bookData.pages.length;
        } catch (error) {
            console.error('Error loading book content:', error);
        }
    }

    renderPages() {
        if (!this.bookData || !this.bookData.pages) return;

        this.pagesContainer.innerHTML = '';

        this.bookData.pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = `book-page ${index === this.currentPageIndex ? 'active' : ''}`;
            pageDiv.id = `page-${index}`;

            let imagesHtml = '';
            if (page.images && page.images.length > 0) {
                imagesHtml = page.images.map(img => {
                    const imagePath = this.getImagePath(img.image);
                    return `
                        <div class="text-center">
                            <img src="${imagePath}" alt="${page.title}" class="page-image">
                            ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
                        </div>
                    `;
                }).join('');
            }

            pageDiv.innerHTML = `
                <div class="book-header">
                    <h2>${this.bookData.title}</h2>
                </div>
                <h3 class="page-title">${page.title}</h3>
                <div class="page-content">${page.content}</div>
                ${imagesHtml}
            `;

            this.pagesContainer.appendChild(pageDiv);
        });
    }

    getImagePath(imageName) {
        if (window.appConfig && window.appConfig.serveImagesViaFlask) {
            return `${window.appConfig.baseUrl}/imagen_externa/${imageName}`;
        }
        return `${window.appConfig.baseUrl}/images/${imageName}`;
    }

    showPage(pageIndex) {
        document.querySelectorAll('.book-page').forEach(page => {
            page.classList.remove('active');
        });

        const currentPage = document.getElementById(`page-${pageIndex}`);
        if (currentPage) {
            currentPage.classList.add('active');
        }

        this.currentPageElement.textContent = pageIndex + 1;
        this.updateNavigation();
        this.updateProgressBar();
    }

    nextPage() {
        if (this.currentPageIndex < this.bookData.pages.length - 1) {
            this.currentPageIndex++;
            this.showPage(this.currentPageIndex);
        }
    }

    previousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.showPage(this.currentPageIndex);
        }
    }

    updateNavigation() {
        this.prevBtn.disabled = this.currentPageIndex === 0;
        this.nextBtn.disabled = this.currentPageIndex === this.bookData.pages.length - 1;
    }

    updateProgressBar() {
        const progress = ((this.currentPageIndex + 1) / this.bookData.pages.length) * 100;
        this.progressBar.style.width = progress + '%';
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                this.previousPage();
            } else if (event.key === 'ArrowRight') {
                this.nextPage();
            }
        });

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', this.previousPage);
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', this.nextPage);
        }
    }
}

let interactiveBookInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        interactiveBookInstance = new InteractiveBook();
    }, 100);
});