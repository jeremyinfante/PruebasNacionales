// ==================== APP STATE ====================
const appState = {
    currentFile: 'markdown/matematicas/c2-matematicas-2024.md',
    currentLabel: 'Cuadernillo 2',
    questions: [],
    userAnswers: {},
    evaluated: false,
    theme: 'dark'
};

// ==================== DOM ELEMENTS ====================
const quizContainer = document.getElementById('quizContainer');
const contentHeader = document.getElementById('contentHeader');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Modal Elements
const zoomModal = document.getElementById('zoomModal');
const zoomImage = document.getElementById('zoomImage');
const zoomClose = document.getElementById('zoomClose');

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    loadQuiz();
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

    // Sidebar items selection
    sidebarItems.forEach(item => {
        item.addEventListener('click', async () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            appState.currentFile = item.dataset.file;
            appState.currentLabel = item.dataset.label;
            
            // Close sidebar in mobile
            sidebar.classList.remove('open');

            await loadQuiz();
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
            <div class="content-header-title">${appState.currentLabel}</div>
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

    // Calculate directory base path of current file to resolve relative image references
    const lastSlashIndex = appState.currentFile.lastIndexOf('/');
    const basePath = lastSlashIndex !== -1 ? appState.currentFile.substring(0, lastSlashIndex + 1) : '';

    appState.questions.forEach(q => {
        const card = document.createElement('div');
        const hasAnswers = appState.userAnswers[q.number] !== undefined;
        
        let cardClass = 'question-card';
        if (hasAnswers) cardClass += ' answered';
        
        if (appState.evaluated) {
            cardClass += ' evaluated';
            const isCorrect = appState.userAnswers[q.number] === q.correct;
            cardClass += isCorrect ? ' correct-card' : ' incorrect-card';
        }
        
        card.className = cardClass;
        card.dataset.number = q.number;

        // Render body elements (text and images in exact order)
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

        // Render options buttons
        let optionsHTML = '';
        q.options.forEach(opt => {
            const isSelected = appState.userAnswers[q.number] === opt.letter;
            const isCorrectAnswer = opt.letter === q.correct;
            
            let optionClass = 'option';
            if (isSelected) optionClass += ' selected';
            
            if (appState.evaluated) {
                if (isCorrectAnswer) {
                    optionClass += ' correct';
                } else if (isSelected && !isCorrectAnswer) {
                    optionClass += ' incorrect';
                } else if (!isSelected && isCorrectAnswer) {
                    // Visual guide if user missed it
                    optionClass += ' unselected-correct';
                }
            }

            optionsHTML += `
                <button class="${optionClass}" data-letter="${opt.letter}" data-question="${q.number}" ${appState.evaluated ? 'disabled' : ''}>
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
    
    // Render score banner if evaluated
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

    // Render navigation/action buttons at bottom
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    if (!appState.evaluated) {
        const evaluateBtn = document.createElement('button');
        evaluateBtn.className = 'btn btn-primary';
        evaluateBtn.innerHTML = '✓ Finalizar y Evaluar Examen';
        evaluateBtn.onclick = evaluateQuiz;
        actionButtons.appendChild(evaluateBtn);
    } else {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-primary';
        resetBtn.innerHTML = '↻ Reintentar Cuestionario';
        resetBtn.onclick = resetQuiz;
        actionButtons.appendChild(resetBtn);

        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn btn-secondary';
        selectBtn.innerHTML = '📂 Cambiar Cuadernillo';
        selectBtn.onclick = () => {
            sidebar.classList.toggle('open');
        };
        actionButtons.appendChild(selectBtn);
    }

    quizContainer.appendChild(actionButtons);

    // Attach click event to option buttons
    if (!appState.evaluated) {
        document.querySelectorAll('.option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget;
                const questionNum = parseInt(button.dataset.question, 10);
                const letter = button.dataset.letter;
                
                // Set state
                appState.userAnswers[questionNum] = letter;
                localStorage.setItem(`quiz_answers_${appState.currentFile}`, JSON.stringify(appState.userAnswers));
                
                // Visual response: toggle .selected in cards options
                const card = button.closest('.question-card');
                card.classList.add('answered');
                card.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                button.classList.add('selected');
                
                updateProgressBar();
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

function evaluateQuiz() {
    const total = appState.questions.length;
    const answered = Object.keys(appState.userAnswers).length;
    
    if (answered < total) {
        const remaining = total - answered;
        const confirmEval = confirm(`Falta responder ${remaining} de ${total} preguntas.\n¿Deseas evaluar el examen de todas formas?`);
        if (!confirmEval) return;
    }
    
    appState.evaluated = true;
    localStorage.setItem(`quiz_evaluated_${appState.currentFile}`, 'true');
    
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
        
        renderHeader();
        renderQuestions();
        updateProgressBar();
    }
}

function copyScore(event) {
    const { correct, total, percentage } = calculateScore();
    const text = `🎯 ¡Completé el simulador de Pruebas Nacionales!\n📘 Cuadernillo: ${appState.currentLabel}\n✅ Puntuación: ${correct}/${total} (${percentage}% de éxito)\n🚀 Entrénate tú también gratis en el Simulador Interactivo de Elite Dev.`;
    
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
