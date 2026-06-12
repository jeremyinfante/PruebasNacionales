// ==================== APP STATE & CONSTANTS ====================
const BOOKLETS = [
    {
        file: 'markdown/matematicas/c1-matematicas-2024.md',
        label: 'Matemáticas - Cuadernillo 1',
        subject: 'maths',
        totalQuestions: 20
    },
    {
        file: 'markdown/matematicas/c2-matematicas-2024.md',
        label: 'Matemáticas - Cuadernillo 2',
        subject: 'maths',
        totalQuestions: 20
    },
    {
        file: 'markdown/ciencias-sociales/c1-ciencias-sociales-2024.md',
        label: 'Ciencias Sociales - Cuadernillo 1',
        subject: 'socials',
        totalQuestions: 42
    },
    {
        file: 'markdown/ciencias-sociales/c2-ciencias-sociales-2024.md',
        label: 'Ciencias Sociales - Cuadernillo 2',
        subject: 'socials',
        totalQuestions: 42
    }
];

const STUDY_TIPS = [
    "Matemáticas: Al calcular la mediana de una lista, asegúrate de ordenar los datos de menor a mayor primero.",
    "Ciencias Sociales: El socialismo histórico centraliza los medios de producción bajo control estatal rígido.",
    "Matemáticas: Para hallar el área lateral de un prisma, multiplica el perímetro de la base por su altura.",
    "Ciencias Sociales: La Revolución Francesa trajo consigo la caída de la monarquía absoluta y la declaración de los Derechos del Hombre.",
    "Matemáticas: El rango de una función es el conjunto de todos los valores de salida (valores de Y) que la función puede producir.",
    "Ciencias Sociales: Un plebiscito consulta sobre decisiones políticas, mientras que un referendo ratifica o rechaza textos legales.",
    "Matemáticas: Si un producto de factores es igual a cero, entonces al menos uno de los factores debe ser cero.",
    "Ciencias Sociales: El Tribunal Constitucional de la República Dominicana garantiza la supremacía de la Constitución sobre las leyes.",
    "Matemáticas: Al devaluar un porcentaje anual acumulativo, réstalo del valor restante del año anterior, no del valor inicial.",
    "Ciencias Sociales: El choque de intereses surge cuando los objetivos económicos de las empresas chocan con los derechos ambientales comunitarios."
];

const appState = {
    currentView: 'home', // 'home' or 'quiz'
    currentFile: '',
    currentLabel: '',
    questions: [],
    userAnswers: {},
    evaluated: false,
    theme: 'dark',
    
    // Study settings
    studyMode: 'exam', // 'exam' or 'practice'
    timerLimit: 0, // 0 = no limit (count up)
    timerSeconds: 0,
    timerInterval: null,
    timerIsPaused: false
};

// ==================== DOM ELEMENTS ====================
const quizContainer = document.getElementById('quizContainer');
const contentHeader = document.getElementById('contentHeader');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Modal Elements
const zoomModal = document.getElementById('zoomModal');
const zoomImage = document.getElementById('zoomImage');
const zoomClose = document.getElementById('zoomClose');

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    
    // Load saved settings
    appState.studyMode = localStorage.getItem('study_mode') || 'exam';
    appState.timerLimit = parseInt(localStorage.getItem('timer_limit') || '0', 10);
    
    // Boot to Home Dashboard
    goHome();
});

// ==================== THEME MANAGEMENT ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    appState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update button icon
    if (theme === 'light') {
        themeToggleBtn.innerHTML = '🌙';
        themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
    } else {
        themeToggleBtn.innerHTML = '☀️';
        themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
    }
}

function toggleTheme() {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Sidebar mobile toggle
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Brand click (Return to home)
    const brandHome = document.getElementById('brandHome');
    if (brandHome) {
        brandHome.addEventListener('click', () => {
            goHome();
        });
    }

    // Go Home button in sidebar
    const btnGoHome = document.getElementById('btnGoHome');
    if (btnGoHome) {
        btnGoHome.addEventListener('click', () => {
            goHome();
            sidebar.classList.remove('open');
        });
    }

    // Sidebar booklet selector click
    const sidebarBookletItems = document.querySelectorAll('.sidebar-item[data-file]');
    sidebarBookletItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarBookletItems.forEach(i => i.classList.remove('active'));
            const homeBtn = document.getElementById('btnGoHome');
            if (homeBtn) homeBtn.classList.remove('active');
            
            item.classList.add('active');
            
            const file = item.dataset.file;
            const label = item.dataset.label;
            
            sidebar.classList.remove('open');
            startBooklet(file, label);
        });
    });

    // Close Modal on clicking close button or outside image
    zoomClose.addEventListener('click', closeZoomModal);
    zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal) {
            closeZoomModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && zoomModal.classList.contains('show')) {
            closeZoomModal();
        }
    });

    // Timer control buttons
    const timerPauseBtn = document.getElementById('timerPauseBtn');
    if (timerPauseBtn) {
        timerPauseBtn.addEventListener('click', toggleTimerPause);
    }
}

// ==================== IMAGE ZOOM ====================
function openZoomModal(src) {
    zoomImage.src = src;
    zoomModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Lock scroll
}

function closeZoomModal() {
    zoomModal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scroll
    setTimeout(() => {
        zoomImage.src = '';
    }, 300);
}

// ==================== NAVIGATION LOGIC ====================
function goHome() {
    stopTimer();
    
    appState.currentView = 'home';
    appState.currentFile = '';
    appState.currentLabel = '';
    appState.questions = [];
    appState.userAnswers = {};
    appState.evaluated = false;
    
    // Toggle containers visibility
    document.getElementById('homeContainer').classList.remove('hidden');
    document.getElementById('contentHeader').classList.add('hidden');
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('timerBar').classList.add('hidden');
    
    // Update active sidebar item
    const sidebarBookletItems = document.querySelectorAll('.sidebar-item[data-file]');
    sidebarBookletItems.forEach(i => i.classList.remove('active'));
    
    const btnGoHome = document.getElementById('btnGoHome');
    if (btnGoHome) btnGoHome.classList.add('active');
    
    renderDashboard();
    
    // Scroll content to top
    document.querySelector('.main-content').scrollTop = 0;
}

function startBooklet(file, label) {
    stopTimer();
    
    appState.currentView = 'quiz';
    appState.currentFile = file;
    appState.currentLabel = label;
    
    // Toggle containers visibility
    document.getElementById('homeContainer').classList.add('hidden');
    document.getElementById('contentHeader').classList.remove('hidden');
    document.getElementById('quizContainer').classList.remove('hidden');
    
    // Highlight sidebar
    const btnGoHome = document.getElementById('btnGoHome');
    if (btnGoHome) btnGoHome.classList.remove('active');
    
    const sidebarBookletItems = document.querySelectorAll('.sidebar-item[data-file]');
    sidebarBookletItems.forEach(item => {
        if (item.dataset.file === file) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    loadQuiz();
}

// ==================== DASHBOARD RENDERER ====================
function renderDashboard() {
    const homeContainer = document.getElementById('homeContainer');
    if (!homeContainer) return;
    
    // Compute stats
    let completedCount = 0;
    let totalScoreCorrect = 0;
    let totalScoreQuestions = 0;
    
    const bookletStats = BOOKLETS.map(b => {
        const isEvaluated = localStorage.getItem(`quiz_evaluated_${b.file}`) === 'true';
        const answersStr = localStorage.getItem(`quiz_answers_${b.file}`);
        const answers = answersStr ? JSON.parse(answersStr) : {};
        const answeredCount = Object.keys(answers).length;
        
        let scoreCorrect = 0;
        let scoreTotal = b.totalQuestions;
        
        if (isEvaluated) {
            completedCount++;
            scoreCorrect = parseInt(localStorage.getItem(`quiz_score_correct_${b.file}`) || '0', 10);
            scoreTotal = parseInt(localStorage.getItem(`quiz_score_total_${b.file}`) || b.totalQuestions.toString(), 10);
            totalScoreCorrect += scoreCorrect;
            totalScoreQuestions += scoreTotal;
        }
        
        const progressPercent = isEvaluated ? 100 : Math.round((answeredCount / b.totalQuestions) * 100);
        
        return {
            ...b,
            isEvaluated,
            answeredCount,
            progressPercent,
            scoreCorrect,
            scoreTotal
        };
    });
    
    const avgScore = totalScoreQuestions > 0 ? Math.round((totalScoreCorrect / totalScoreQuestions) * 100) : 0;
    const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
    
    const mathsHTML = renderBookletsGroup(bookletStats.filter(b => b.subject === 'maths'));
    const socialsHTML = renderBookletsGroup(bookletStats.filter(b => b.subject === 'socials'));
    
    homeContainer.innerHTML = `
        <div class="dashboard-grid">
            <!-- Welcome Bento -->
            <div class="bento-card bento-welcome">
                <div>
                    <h1 class="welcome-title-gradient">¡Prepárate para el Éxito!</h1>
                    <p style="margin-top: 0.75rem; font-size: 1.05rem; font-weight: 500; color: var(--text-primary);">
                        Bienvenido al Simulador Interactivo de Pruebas Nacionales. Practica con exámenes oficiales y mejora tus calificaciones.
                    </p>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); max-width: 550px;">
                        Elige una materia de las tarjetas Bento para comenzar, o personaliza las opciones en el panel de Configuración de la derecha. Tu progreso se guardará automáticamente.
                    </p>
                </div>
            </div>
            
            <!-- Settings Bento -->
            <div class="bento-card bento-settings">
                <div>
                    <div class="card-title">⚙️ Configuración</div>
                    <div class="card-subtitle">Personaliza tu método de estudio</div>
                    
                    <div class="setting-group">
                        <span class="setting-label">Modo de Estudio</span>
                        <div class="setting-toggle-container">
                            <button class="setting-toggle-btn ${appState.studyMode === 'practice' ? 'active' : ''}" id="modePracticeBtn">Práctica</button>
                            <button class="setting-toggle-btn ${appState.studyMode === 'exam' ? 'active' : ''}" id="modeExamBtn">Examen</button>
                        </div>
                    </div>
                    
                    <div class="setting-group">
                        <span class="setting-label">Límite de Tiempo</span>
                        <select class="setting-select" id="timerLimitSelect">
                            <option value="0" ${appState.timerLimit === 0 ? 'selected' : ''}>Sin Límite (Cronómetro)</option>
                            <option value="15" ${appState.timerLimit === 15 ? 'selected' : ''}>15 Minutos</option>
                            <option value="30" ${appState.timerLimit === 30 ? 'selected' : ''}>30 Minutos</option>
                            <option value="45" ${appState.timerLimit === 45 ? 'selected' : ''}>45 Minutos</option>
                            <option value="60" ${appState.timerLimit === 60 ? 'selected' : ''}>60 Minutos</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Maths Subject Bento -->
            <div class="bento-card bento-subject-maths">
                <div>
                    <div class="card-title">📊 Matemáticas</div>
                    <div class="card-subtitle">Razonamiento lógico y numérico</div>
                    <div class="booklet-list">
                        ${mathsHTML}
                    </div>
                </div>
            </div>
            
            <!-- Social Sciences Subject Bento -->
            <div class="bento-card bento-subject-socials">
                <div>
                    <div class="card-title">🌍 Ciencias Sociales</div>
                    <div class="card-subtitle">Historia, Geografía y Cívica</div>
                    <div class="booklet-list">
                        ${socialsHTML}
                    </div>
                </div>
            </div>
            
            <!-- General Stats Bento -->
            <div class="bento-card bento-stats">
                <div class="stats-container">
                    <div>
                        <div class="card-title">📈 Tu Progreso</div>
                        <div class="card-subtitle">Resumen acumulado del simulador</div>
                        
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-info">
                                    <span class="stat-label">Completados</span>
                                    <span class="stat-value">${completedCount} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);">/ 4</span></span>
                                </div>
                                <span style="font-size: 1.5rem;">🏆</span>
                            </div>
                            
                            <div class="stat-item">
                                <div class="stat-info">
                                    <span class="stat-label">Promedio de Aciertos</span>
                                    <span class="stat-value" style="color: ${completedCount > 0 ? (avgScore >= 70 ? 'var(--success)' : avgScore >= 50 ? 'var(--warning)' : 'var(--error)') : 'var(--text-primary)'};">${completedCount > 0 ? avgScore + '%' : 'N/A'}</span>
                                </div>
                                <span style="font-size: 1.5rem;">🎯</span>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn-danger" id="btnResetAllStats">🗑️ Restablecer Historial</button>
                </div>
            </div>
            
            <!-- Tips Bento -->
            <div class="bento-card bento-tips">
                <div class="tips-container">
                    <div class="tip-content-wrapper">
                        <div class="setting-label" style="margin-bottom: 0.5rem; color: var(--accent); font-weight: 800;">💡 Consejo de Estudio del Día</div>
                        <div class="tip-text" id="tipTextContainer">"${randomTip}"</div>
                    </div>
                    <button class="btn-tip-rotate" id="btnRotateTip" aria-label="Siguiente Consejo">↻</button>
                </div>
            </div>
        </div>
    `;
    
    attachDashboardListeners();
}

function renderBookletsGroup(list) {
    return list.map(b => {
        let badgeClass = 'badge-unstarted';
        let badgeText = 'Sin empezar';
        
        if (b.isEvaluated) {
            badgeClass = 'badge-completed';
            badgeText = 'Completado';
        } else if (b.answeredCount > 0) {
            badgeClass = 'badge-progress';
            badgeText = 'En curso';
        }
        
        const isSuccess = b.isEvaluated && (b.scoreCorrect / b.scoreTotal >= 0.7);
        const progressBarClass = isSuccess ? 'success-bar' : '';
        
        return `
            <div class="booklet-item">
                <div class="booklet-info">
                    <span class="booklet-name">${b.label.replace('Matemáticas - ', '').replace('Ciencias Sociales - ', '')}</span>
                    <span class="booklet-badge ${badgeClass}">${badgeText}</span>
                </div>
                
                <div class="booklet-progress-bar-container">
                    <div class="booklet-progress-bar ${progressBarClass}" style="width: ${b.progressPercent}%"></div>
                </div>
                
                <div class="booklet-action">
                    <span class="booklet-score-info">
                        ${b.isEvaluated 
                            ? `Nota: <strong style="color: ${isSuccess ? 'var(--success)' : 'inherit'};">${b.scoreCorrect}/${b.scoreTotal}</strong> (${Math.round((b.scoreCorrect / b.scoreTotal) * 100)}%)` 
                            : `Resueltas: <strong>${b.answeredCount}</strong> / ${b.totalQuestions}`
                        }
                    </span>
                    <button class="btn-booklet-start" onclick="startBooklet('${b.file}', '${b.label}')">
                        ${b.isEvaluated ? '↻ Reintentar' : b.answeredCount > 0 ? '▶️ Continuar' : '⚡ Iniciar'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function attachDashboardListeners() {
    const modePracticeBtn = document.getElementById('modePracticeBtn');
    const modeExamBtn = document.getElementById('modeExamBtn');
    const timerLimitSelect = document.getElementById('timerLimitSelect');
    const btnRotateTip = document.getElementById('btnRotateTip');
    const btnResetAllStats = document.getElementById('btnResetAllStats');
    
    if (modePracticeBtn && modeExamBtn) {
        modePracticeBtn.addEventListener('click', () => {
            appState.studyMode = 'practice';
            localStorage.setItem('study_mode', 'practice');
            modePracticeBtn.classList.add('active');
            modeExamBtn.classList.remove('active');
        });
        
        modeExamBtn.addEventListener('click', () => {
            appState.studyMode = 'exam';
            localStorage.setItem('study_mode', 'exam');
            modeExamBtn.classList.add('active');
            modePracticeBtn.classList.remove('active');
        });
    }
    
    if (timerLimitSelect) {
        timerLimitSelect.addEventListener('change', (e) => {
            const limit = parseInt(e.target.value, 10);
            appState.timerLimit = limit;
            localStorage.setItem('timer_limit', limit.toString());
        });
    }
    
    if (btnRotateTip) {
        btnRotateTip.addEventListener('click', () => {
            const tipTextContainer = document.getElementById('tipTextContainer');
            if (tipTextContainer) {
                const currentTip = tipTextContainer.textContent.replace(/"/g, '');
                const alternativeTips = STUDY_TIPS.filter(t => t !== currentTip);
                const newTip = alternativeTips[Math.floor(Math.random() * alternativeTips.length)];
                tipTextContainer.textContent = `"${newTip}"`;
            }
        });
    }
    
    if (btnResetAllStats) {
        btnResetAllStats.addEventListener('click', () => {
            if (confirm('⚠️ ¿Estás completamente seguro de restablecer TODO tu progreso y calificaciones? Esta acción eliminará tus respuestas guardadas.')) {
                BOOKLETS.forEach(b => {
                    localStorage.removeItem(`quiz_answers_${b.file}`);
                    localStorage.removeItem(`quiz_evaluated_${b.file}`);
                    localStorage.removeItem(`quiz_score_correct_${b.file}`);
                    localStorage.removeItem(`quiz_score_total_${b.file}`);
                    localStorage.removeItem(`quiz_timer_sec_${b.file}`);
                });
                
                alert('Historial restablecido.');
                renderDashboard();
            }
        });
    }
}

// ==================== TIMER INTERNALS ====================
function startTimer() {
    stopTimer();
    
    const timerBar = document.getElementById('timerBar');
    const timerClock = document.getElementById('timerClock');
    const timerPauseBtn = document.getElementById('timerPauseBtn');
    
    if (!timerBar || !timerClock) return;
    
    const savedTime = localStorage.getItem(`quiz_timer_sec_${appState.currentFile}`);
    if (savedTime !== null) {
        appState.timerSeconds = parseInt(savedTime, 10);
    } else {
        if (appState.timerLimit > 0) {
            appState.timerSeconds = appState.timerLimit * 60;
        } else {
            appState.timerSeconds = 0;
        }
    }
    
    appState.timerIsPaused = false;
    if (timerPauseBtn) timerPauseBtn.innerHTML = '⏸️';
    if (timerClock) timerClock.style.opacity = '1';
    
    timerBar.classList.remove('hidden');
    updateTimerDisplay();
    
    appState.timerInterval = setInterval(() => {
        if (appState.timerIsPaused) return;
        
        if (appState.timerLimit > 0) {
            // Countdown
            appState.timerSeconds--;
            localStorage.setItem(`quiz_timer_sec_${appState.currentFile}`, appState.timerSeconds.toString());
            updateTimerDisplay();
            
            if (appState.timerSeconds <= 0) {
                stopTimer();
                alert('⏱️ ¡El tiempo del examen ha terminado! Tu examen se evaluará automáticamente.');
                evaluateQuiz(true);
            }
        } else {
            // Count up
            appState.timerSeconds++;
            localStorage.setItem(`quiz_timer_sec_${appState.currentFile}`, appState.timerSeconds.toString());
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
        appState.timerInterval = null;
    }
    const timerBar = document.getElementById('timerBar');
    if (timerBar) {
        timerBar.classList.add('hidden');
    }
}

function toggleTimerPause() {
    appState.timerIsPaused = !appState.timerIsPaused;
    const timerPauseBtn = document.getElementById('timerPauseBtn');
    const timerClock = document.getElementById('timerClock');
    
    if (timerPauseBtn) {
        timerPauseBtn.innerHTML = appState.timerIsPaused ? '▶️' : '⏸️';
    }
    
    if (timerClock) {
        if (appState.timerIsPaused) {
            timerClock.style.opacity = '0.6';
        } else {
            timerClock.style.opacity = '1';
        }
    }
}

function updateTimerDisplay() {
    const timerClock = document.getElementById('timerClock');
    if (!timerClock) return;
    
    const minutes = Math.floor(Math.abs(appState.timerSeconds) / 60);
    const seconds = Math.abs(appState.timerSeconds) % 60;
    
    const minStr = minutes.toString().padStart(2, '0');
    const secStr = seconds.toString().padStart(2, '0');
    
    timerClock.innerHTML = `${minStr}:${secStr}`;
    
    if (appState.timerLimit > 0) {
        if (appState.timerSeconds <= 10) {
            timerClock.className = 'timer-clock danger';
        } else if (appState.timerSeconds <= 60) {
            timerClock.className = 'timer-clock warning';
        } else {
            timerClock.className = 'timer-clock';
        }
    } else {
        timerClock.className = 'timer-clock';
    }
}

// ==================== LOAD & PARSE ====================
async function loadQuiz() {
    quizContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Cargando cuadernillo de preguntas...</p>
        </div>
    `;

    try {
        const response = await fetch(appState.currentFile);
        if (!response.ok) throw new Error(`Error al leer archivo de cuestionario (HTTP ${response.status})`);
        
        const markdown = await response.text();
        const parser = new MarkdownParser();
        appState.questions = parser.parse(markdown);
        
        // Persist total questions
        localStorage.setItem(`quiz_score_total_${appState.currentFile}`, appState.questions.length.toString());

        // Load saved progress from LocalStorage
        const savedAnswers = localStorage.getItem(`quiz_answers_${appState.currentFile}`);
        const savedEvaluated = localStorage.getItem(`quiz_evaluated_${appState.currentFile}`);
        
        if (savedAnswers) {
            appState.userAnswers = JSON.parse(savedAnswers);
        } else {
            appState.userAnswers = {};
        }

        appState.evaluated = savedEvaluated === 'true';

        renderHeader();
        renderQuestions();
        updateProgressBar();
        
        // Start Timer if not evaluated
        if (!appState.evaluated) {
            startTimer();
        } else {
            stopTimer();
        }
        
        // Scroll content to top
        document.querySelector('.main-content').scrollTop = 0;

    } catch (error) {
        console.error('Quiz loading failed:', error);
        quizContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>No se pudo cargar el cuestionario.</p>
                <small style="color: var(--text-secondary); margin-top: -0.5rem;">${error.message}</small>
                <button class="btn btn-secondary" style="margin-top: 1rem; width: auto;" onclick="loadQuiz()">Reintentar Carga</button>
            </div>
        `;
    }
}

// ==================== RENDERERS ====================
function renderHeader() {
    const totalQuestions = appState.questions.length;
    
    contentHeader.innerHTML = `
        <div class="content-header-top">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button class="btn-tip-rotate" style="font-size: 0.95rem; width: 36px; height: 36px;" onclick="goHome()" aria-label="Volver al Inicio">🏠</button>
                <div class="content-header-title">${appState.currentLabel}</div>
            </div>
            <div class="content-header-subtitle">
                ${totalQuestions} preguntas
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-info">
                <span>Progreso del Cuestionario</span>
                <span id="progressText">0% completado</span>
            </div>
            <div class="progress-track">
                <div class="progress-bar" id="progressBar"></div>
            </div>
        </div>
    `;
}

function updateProgressBar() {
    const total = appState.questions.length;
    if (total === 0) return;

    const answered = Object.keys(appState.userAnswers).length;
    const percentage = Math.round((answered / total) * 100);

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.innerHTML = `<span><strong>${answered}</strong> de ${total} (${percentage}%)</span>`;
    }
}

function renderQuestions() {
    const grid = document.createElement('div');
    grid.className = 'quiz-grid';

    const lastSlashIndex = appState.currentFile.lastIndexOf('/');
    const basePath = lastSlashIndex !== -1 ? appState.currentFile.substring(0, lastSlashIndex + 1) : '';

    appState.questions.forEach(q => {
        const card = document.createElement('div');
        const hasAnswers = appState.userAnswers[q.number] !== undefined;
        
        let cardClass = 'question-card';
        if (hasAnswers) cardClass += ' answered';
        
        const isPracticeEvaluated = appState.studyMode === 'practice' && hasAnswers;
        
        if (appState.evaluated || isPracticeEvaluated) {
            cardClass += ' evaluated';
            const isCorrect = appState.userAnswers[q.number] === q.correct;
            cardClass += isCorrect ? ' correct-card' : ' incorrect-card';
        }
        
        card.className = cardClass;
        card.dataset.number = q.number;

        let bodyHTML = '';
        if (q.body && q.body.length > 0) {
            q.body.forEach(elem => {
                if (elem.type === 'text') {
                    bodyHTML += `<div class="question-text">${elem.content}</div>`;
                } else if (elem.type === 'image') {
                    const fullSrc = (elem.src.startsWith('http://') || elem.src.startsWith('https://') || elem.src.startsWith('/')) 
                        ? elem.src 
                        : basePath + elem.src;

                    bodyHTML += `
                        <div class="question-images-container">
                            <div class="question-image-wrapper" onclick="openZoomModal('${fullSrc}')">
                                <img src="${fullSrc}" alt="Pregunta ${q.number} Diagrama" class="question-image" onerror="this.parentNode.style.display='none'">
                                <div class="image-zoom-hint">🔍 Ampliar imagen</div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        let optionsHTML = '';
        q.options.forEach(opt => {
            const isSelected = appState.userAnswers[q.number] === opt.letter;
            const isCorrectAnswer = opt.letter === q.correct;
            
            let optionClass = 'option';
            let isDisabled = false;
            
            if (isSelected) optionClass += ' selected';
            
            if (appState.evaluated) {
                isDisabled = true;
                if (isCorrectAnswer) {
                    optionClass += ' correct';
                } else if (isSelected && !isCorrectAnswer) {
                    optionClass += ' incorrect';
                } else if (!isSelected && isCorrectAnswer) {
                    optionClass += ' unselected-correct';
                }
            } else if (appState.studyMode === 'practice' && hasAnswers) {
                isDisabled = true;
                if (isSelected) {
                    if (isCorrectAnswer) {
                        optionClass += ' correct';
                    } else {
                        optionClass += ' incorrect';
                    }
                } else if (isCorrectAnswer) {
                    optionClass += ' unselected-correct';
                }
            }

            optionsHTML += `
                <button class="${optionClass}" data-letter="${opt.letter}" data-question="${q.number}" ${isDisabled ? 'disabled' : ''}>
                    <span class="option-letter">${opt.letter.toUpperCase()}</span>
                    <span class="option-text">${opt.text}</span>
                </button>
            `;
        });

        card.innerHTML = `
            <div class="question-number">Pregunta ${q.number}</div>
            ${bodyHTML}
            <div class="options-container">${optionsHTML}</div>
        `;

        grid.appendChild(card);
    });

    quizContainer.innerHTML = '';
    
    // Show score banner if booklet is evaluated
    if (appState.evaluated) {
        const { correct, total, percentage } = calculateScore();
        const scoreBanner = document.createElement('div');
        scoreBanner.className = 'score-banner';
        scoreBanner.id = 'scoreBanner';
        scoreBanner.classList.add('show');
        
        scoreBanner.innerHTML = `
            <div class="score-banner-title">🎉 ¡Examen Evaluado!</div>
            <div class="score-banner-content">
                <div class="score-stats">
                    <div class="score-item">
                        <div class="score-label">Respuestas Correctas</div>
                        <div class="score-value">${correct} <span style="font-size: 1.25rem; font-weight: 500; color: var(--text-secondary)">/ ${total}</span></div>
                    </div>
                    <div class="score-item">
                        <div class="score-label">Porcentaje de Éxito</div>
                        <div class="score-value score-percentage">${percentage}%</div>
                    </div>
                </div>
                <button class="copy-btn" onclick="copyScore(event)">📋 Copiar Resultado</button>
            </div>
        `;
        quizContainer.appendChild(scoreBanner);
    }

    quizContainer.appendChild(grid);

    // Render action/navigation buttons at bottom
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    if (!appState.evaluated) {
        const evaluateBtn = document.createElement('button');
        evaluateBtn.className = 'btn btn-primary';
        evaluateBtn.innerHTML = appState.studyMode === 'practice'
            ? '✓ Guardar y Registrar Práctica'
            : '✓ Finalizar y Evaluar Examen';
        evaluateBtn.onclick = () => evaluateQuiz();
        actionButtons.appendChild(evaluateBtn);
        
        const returnBtn = document.createElement('button');
        returnBtn.className = 'btn btn-secondary';
        returnBtn.innerHTML = '🏠 Guardar y Volver a Inicio';
        returnBtn.onclick = goHome;
        actionButtons.appendChild(returnBtn);
    } else {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-primary';
        resetBtn.innerHTML = '↻ Reintentar Cuestionario';
        resetBtn.onclick = resetQuiz;
        actionButtons.appendChild(resetBtn);

        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn btn-secondary';
        selectBtn.innerHTML = '🏠 Volver al Inicio / Dashboard';
        selectBtn.onclick = goHome;
        actionButtons.appendChild(selectBtn);
    }

    quizContainer.appendChild(actionButtons);

    // Attach click events on option buttons
    if (!appState.evaluated) {
        document.querySelectorAll('.option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const questionNum = parseInt(button.dataset.question, 10);
                const letter = button.dataset.letter;
                
                const q = appState.questions.find(quest => quest.number === questionNum);
                if (!q) return;
                
                if (appState.studyMode === 'practice') {
                    if (appState.userAnswers[questionNum] !== undefined) return; // Freeze
                    
                    appState.userAnswers[questionNum] = letter;
                    localStorage.setItem(`quiz_answers_${appState.currentFile}`, JSON.stringify(appState.userAnswers));
                    
                    const card = button.closest('.question-card');
                    card.classList.add('answered');
                    card.classList.add('evaluated');
                    
                    const isCorrect = letter === q.correct;
                    card.classList.add(isCorrect ? 'correct-card' : 'incorrect-card');
                    
                    card.querySelectorAll('.option').forEach(opt => {
                        opt.disabled = true;
                        const optLetter = opt.dataset.letter;
                        
                        if (optLetter === letter) {
                            if (isCorrect) {
                                opt.classList.add('correct');
                            } else {
                                opt.classList.add('incorrect');
                            }
                        } else if (optLetter === q.correct) {
                            opt.classList.add('unselected-correct');
                        }
                    });
                    
                    updateProgressBar();
                } else {
                    appState.userAnswers[questionNum] = letter;
                    localStorage.setItem(`quiz_answers_${appState.currentFile}`, JSON.stringify(appState.userAnswers));
                    
                    const card = button.closest('.question-card');
                    card.classList.add('answered');
                    card.querySelectorAll('.option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    button.classList.add('selected');
                    
                    updateProgressBar();
                }
            });
        });
    }
}

// ==================== ACTION LOGIC ====================
function calculateScore() {
    let correct = 0;
    appState.questions.forEach(q => {
        if (appState.userAnswers[q.number] === q.correct) {
            correct++;
        }
    });
    const total = appState.questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { correct, total, percentage };
}

function evaluateQuiz(force = false) {
    const total = appState.questions.length;
    const answered = Object.keys(appState.userAnswers).length;
    
    if (!force && answered < total) {
        const remaining = total - answered;
        const confirmEval = confirm(`Falta responder ${remaining} de ${total} preguntas.\n¿Deseas evaluar el cuestionario de todas formas?`);
        if (!confirmEval) return;
    }
    
    // Stop and clear booklet timer details
    stopTimer();
    localStorage.removeItem(`quiz_timer_sec_${appState.currentFile}`);
    
    appState.evaluated = true;
    localStorage.setItem(`quiz_evaluated_${appState.currentFile}`, 'true');
    
    // Cache evaluations for landing page dashboard statistics
    const { correct, total: totalQuestions } = calculateScore();
    localStorage.setItem(`quiz_score_correct_${appState.currentFile}`, correct.toString());
    localStorage.setItem(`quiz_score_total_${appState.currentFile}`, totalQuestions.toString());
    
    renderHeader();
    renderQuestions();
    updateProgressBar();
    
    // Smooth scroll to top of main content where the score is displayed
    const mainContent = document.querySelector('.main-content');
    mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function resetQuiz() {
    if (confirm('¿Estás seguro de que quieres borrar tus respuestas y reiniciar este cuadernillo?')) {
        appState.userAnswers = {};
        appState.evaluated = false;
        
        localStorage.removeItem(`quiz_answers_${appState.currentFile}`);
        localStorage.removeItem(`quiz_evaluated_${appState.currentFile}`);
        localStorage.removeItem(`quiz_score_correct_${appState.currentFile}`);
        localStorage.removeItem(`quiz_score_total_${appState.currentFile}`);
        localStorage.removeItem(`quiz_timer_sec_${appState.currentFile}`);
        
        renderHeader();
        renderQuestions();
        updateProgressBar();
        
        // Re-init timer
        startTimer();
    }
}

function copyScore(event) {
    const { correct, total, percentage } = calculateScore();
    const text = `🎯 ¡Completé el simulador de Pruebas Nacionales!\n📘 Cuadernillo: ${appState.currentLabel}\n✅ Puntuación: ${correct}/${total} (${percentage}% de éxito)\n🚀 Entrénate tú también gratis en el Simulador Interactivo de Jeremy Infante.`;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ ¡Copiado!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy score:', err);
        alert('No se pudo copiar el texto. Copia manualmente:\n\n' + text);
    });
}
