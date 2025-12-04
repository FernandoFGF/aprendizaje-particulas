class SessionDetails {
    constructor() {
        this.baseUrl = window.appConfig ? window.appConfig.baseUrl : '';
        this.init();
    }

    init() {
        this.setDefaultDate();
        this.loadSessionDetails();
        this.setupEventListeners();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sessionDate').value = today;
    }

    setupEventListeners() {
        const form = document.getElementById('dateFilterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.loadSessionDetails();
            });
        }
    }

    async loadSessionDetails() {
        try {
            this.showLoading('sessionsTableBody');

            const formData = new FormData(document.getElementById('dateFilterForm'));
            const params = new URLSearchParams(formData);

            const response = await fetch(`${this.baseUrl}/api/analytics/session-details?${params}`);
            if (!response.ok) throw new Error('Error loading session details');

            const data = await response.json();
            this.renderSessionDetails(data);
        } catch (error) {
            console.error('Error loading session details:', error);
            this.showError('sessionsTableBody', 'Error cargando detalles de sesión');
        }
    }

    renderSessionDetails(data) {
        const tbody = document.getElementById('sessionsTableBody');
        const summary = document.getElementById('sessionSummary');

        if (!tbody || !summary) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No hay datos de sesiones para la fecha seleccionada</td></tr>';
            summary.innerHTML = '';
            return;
        }

        const totalSessions = data.length;
        const totalQuizzes = data.reduce((sum, session) => sum + session.quizzes_completed, 0);
        const sessionsWithQuizzes = data.filter(session => session.quizzes_completed > 0);
        const overallAvgScore = sessionsWithQuizzes.length > 0
            ? sessionsWithQuizzes.reduce((sum, session) => sum + parseFloat(session.avg_score || 0), 0) / sessionsWithQuizzes.length
            : 0;
        const totalQuestions = data.reduce((sum, session) => sum + parseInt(session.total_questions || 0), 0);
        const totalCorrect = data.reduce((sum, session) => sum + parseInt(session.total_correct_answers || 0), 0);
        const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100) : 0;

        summary.innerHTML = `
            <div class="col-12">
                <h5 class="mb-3">Resumen - ${document.getElementById('sessionDate').value}</h5>
            </div>
            <div class="col-md-2 mb-3">
                <div class="card text-white bg-primary stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-people"></i>
                        <h5>${totalSessions}</h5>
                        <small>Sesiones</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="card text-white bg-info stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-check-circle"></i>
                        <h5>${totalQuizzes}</h5>
                        <small>Total Quizzes</small>
                    </div>
                </div>
            </div>
            <div class="col-md-2 mb-3">
                <div class="card text-white bg-warning stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-graph-up"></i>
                        <h5>${overallAvgScore.toFixed(1)}%</h5>
                        <small>Puntuación Avg</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-white bg-success stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-check2-all"></i>
                        <h5>${totalCorrect}/${totalQuestions}</h5>
                        <small>Respuestas Correctas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-white bg-dark stats-card">
                    <div class="card-body text-center">
                        <i class="bi bi-percent"></i>
                        <h5>${overallAccuracy.toFixed(1)}%</h5>
                        <small>Precisión General</small>
                    </div>
                </div>
            </div>
        `;

        tbody.innerHTML = data.map(session => {
            const avgScore = typeof session.avg_score === 'string' ?
                           parseFloat(session.avg_score) :
                           session.avg_score;

            const accuracy = session.total_questions > 0 ?
                           (session.total_correct_answers / session.total_questions * 100) : 0;

            const sessionIdShort = session.session_id ?
                          session.session_id.substring(0, 8) + '...' :
                          'No ID';

            const hasQuizzes = session.quizzes_completed > 0;

            return `
                <tr>
                    <td>
                        <span class="text-muted small" title="${session.session_id || ''}">
                            ${sessionIdShort}
                        </span>
                        ${!hasQuizzes ? '<br><small class="text-warning">Sin quizzes</small>' : ''}
                    </td>
                    <td>
                        <span class="badge ${hasQuizzes ? 'bg-primary' : 'bg-secondary'}">
                            ${session.quizzes_completed || 0}
                        </span>
                    </td>
                    <td>
                        ${hasQuizzes ?
                            `<span class="badge ${avgScore >= 70 ? 'bg-success' : avgScore >= 50 ? 'bg-warning' : 'bg-danger'}">
                                ${avgScore.toFixed(1)}%
                            </span>` :
                            '<span class="badge bg-secondary">N/A</span>'
                        }
                    </td>
                    <td>${session.total_questions || 0}</td>
                    <td>${session.total_correct_answers || 0}</td>
                    <td>
                        ${hasQuizzes ?
                            `<span class="badge ${accuracy >= 70 ? 'bg-success' : accuracy >= 50 ? 'bg-warning' : 'bg-danger'}">
                                ${accuracy.toFixed(1)}%
                            </span>` :
                            '<span class="badge bg-secondary">N/A</span>'
                        }
                    </td>
                    <td><small class="text-muted">${session.first_connection ? new Date(session.first_connection).toLocaleTimeString() : 'N/A'}</small></td>
                    <td><small class="text-muted">${session.last_activity ? new Date(session.last_activity).toLocaleTimeString() : 'N/A'}</small></td>
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
    new SessionDetails();
});