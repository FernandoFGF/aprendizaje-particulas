class AnalyticsDashboard {
    constructor() {
        this.baseUrl = window.appConfig ? window.appConfig.baseUrl : '';
        this.init();
    }

    init() {
        this.setDefaultDates();
        this.loadDailyStats();
        this.loadDetailedStats();
        this.setupEventListeners();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('endDate').value = today;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        document.getElementById('startDate').value = oneWeekAgo.toISOString().split('T')[0];
    }

    setupEventListeners() {
        const form = document.getElementById('dateFilterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.loadDetailedStats();
            });
        }
    }

    async loadDailyStats() {
        try {
            this.showLoading('dailyStats');

            const response = await fetch(`${this.baseUrl}/api/analytics/daily-stats`);
            if (!response.ok) throw new Error('Error loading daily stats');

            const data = await response.json();
            this.renderDailyStats(data);
        } catch (error) {
            console.error('Error loading daily stats:', error);
            this.showError('dailyStats', 'Error cargando estadísticas del día');
        }
    }

    renderDailyStats(data) {
        const container = document.getElementById('dailyStats');
        if (!container) return;

        container.innerHTML = `
            <div class="col-12">
                <h5 class="mb-3">Resumen del ${data.date || 'Día Actual'}</h5>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-white bg-sessions stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-people"></i>
                        <h3>${data.daily_unique_sessions || 0}</h3>
                        <p class="mb-0">Sesiones Únicas</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-white bg-visits stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-eye"></i>
                        <h3>${data.exercise_page_visits || 0}</h3>
                        <p class="mb-0">Visitas a Exercise</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-white bg-completions stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-check-circle"></i>
                        <h3>${data.quiz_completions || 0}</h3>
                        <p class="mb-0">Quizzes Completados</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-white bg-score stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-graph-up"></i>
                        <h3>${data.average_score ? data.average_score.toFixed(1) : 0}%</h3>
                        <p class="mb-0">Puntuación Promedio</p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadDetailedStats() {
        try {
            this.showLoading('statsTableBody');

            const formData = new FormData(document.getElementById('dateFilterForm'));
            const params = new URLSearchParams(formData);

            const response = await fetch(`${this.baseUrl}/api/analytics/detailed-stats?${params}`);
            if (!response.ok) throw new Error('Error loading detailed stats');

            const data = await response.json();
            this.renderDetailedStats(data);
        } catch (error) {
            console.error('Error loading detailed stats:', error);
            this.showError('statsTableBody', 'Error cargando estadísticas detalladas');
        }
    }

    renderDetailedStats(data) {
        const tbody = document.getElementById('statsTableBody');
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No hay datos para el período seleccionado</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(item => {
            const avgScore = typeof item.avg_score === 'string' ?
                        parseFloat(item.avg_score) :
                        item.avg_score;
            let scoreDisplay;

            if (avgScore && typeof avgScore === 'number' && avgScore > 0) {
                scoreDisplay = `<span class="badge bg-warning text-dark">${avgScore.toFixed(1)}%</span>`;
            } else if (avgScore === 0) {
                scoreDisplay = '<span class="badge bg-secondary">0%</span>';
            } else {
                scoreDisplay = '<span class="text-muted">Sin quizzes</span>';
            }

            return `
                <tr>
                    <td><strong>${item.date}</strong></td>
                    <td><span class="badge bg-primary">${item.unique_sessions}</span></td>
                    <td><span class="badge bg-info">${item.exercise_visits || 0}</span></td>
                    <td><span class="badge bg-success">${item.quiz_completions || 0}</span></td>
                    <td>${scoreDisplay}</td>
                </tr>
            `;
        }).join('');
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('loading');
        }
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('loading');
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle me-2"></i>${message}
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new AnalyticsDashboard();
});