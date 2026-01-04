/**
 * AR Game Starter Kit - Navigation System
 * Sistema de navegação entre telas com animações
 */

// Estado da navegação
const NavState = {
    currentScreen: null,
    history: [],
    isTransitioning: false,
    transitionDuration: 250
};

// Configuração de animações
const NavAnimations = {
    none: {
        enter: '',
        exit: ''
    },
    fade: {
        enter: 'nav-fade-in',
        exit: 'nav-fade-out'
    },
    slideLeft: {
        enter: 'nav-slide-in-left',
        exit: 'nav-slide-out-left'
    },
    slideRight: {
        enter: 'nav-slide-in-right',
        exit: 'nav-slide-out-right'
    },
    slideUp: {
        enter: 'nav-slide-in-up',
        exit: 'nav-slide-out-up'
    },
    slideDown: {
        enter: 'nav-slide-in-down',
        exit: 'nav-slide-out-down'
    }
};

// Callbacks por tela
const screenCallbacks = {
    onEnter: {},
    onExit: {}
};

/**
 * Navega para uma tela específica
 * @param {string} screenId - ID da tela (sem o prefixo 'screen-')
 * @param {Object} options - Opções de navegação
 * @param {string} options.animation - Tipo de animação
 * @param {boolean} options.addToHistory - Se deve adicionar ao histórico
 * @returns {boolean} - Se a navegação foi bem-sucedida
 */
export function navigateTo(screenId, options = {}) {
    const {
        animation = 'fade',
        addToHistory = true
    } = options;

    // Verificar se está em transição
    if (NavState.isTransitioning) {
        console.warn('[Nav] Navegação já em andamento');
        return false;
    }

    // Encontrar tela de destino
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (!targetScreen) {
        console.error(`[Nav] Tela não encontrada: screen-${screenId}`);
        return false;
    }

    // Encontrar tela atual
    const currentScreen = NavState.currentScreen
        ? document.getElementById(`screen-${NavState.currentScreen}`)
        : document.querySelector('.screen.active');

    // Se é a mesma tela, não fazer nada
    if (currentScreen && currentScreen.id === targetScreen.id) {
        return false;
    }

    // Iniciar transição
    NavState.isTransitioning = true;

    // Executar callback de saída
    if (currentScreen && screenCallbacks.onExit[NavState.currentScreen]) {
        try {
            screenCallbacks.onExit[NavState.currentScreen]();
        } catch (e) {
            console.error('[Nav] Erro no callback onExit:', e);
        }
    }

    // Adicionar ao histórico
    if (addToHistory && NavState.currentScreen) {
        NavState.history.push(NavState.currentScreen);
    }

    // Aplicar animação de saída na tela atual
    if (currentScreen && animation !== 'none') {
        const exitAnim = NavAnimations[animation]?.exit || '';
        if (exitAnim) {
            currentScreen.classList.add(exitAnim);
        }
    }

    // Preparar tela de destino
    targetScreen.classList.remove('hidden');

    // Aplicar animação de entrada
    if (animation !== 'none') {
        const enterAnim = NavAnimations[animation]?.enter || '';
        if (enterAnim) {
            targetScreen.classList.add(enterAnim);
        }
    }

    // Após a transição
    setTimeout(() => {
        // Ocultar tela anterior
        if (currentScreen) {
            currentScreen.classList.remove('active');
            currentScreen.classList.add('hidden');

            // Limpar classes de animação
            Object.values(NavAnimations).forEach(anim => {
                currentScreen.classList.remove(anim.enter, anim.exit);
            });
        }

        // Ativar nova tela
        targetScreen.classList.add('active');

        // Limpar classes de animação
        Object.values(NavAnimations).forEach(anim => {
            targetScreen.classList.remove(anim.enter, anim.exit);
        });

        // Atualizar estado
        NavState.currentScreen = screenId;
        NavState.isTransitioning = false;

        // Executar callback de entrada
        if (screenCallbacks.onEnter[screenId]) {
            try {
                screenCallbacks.onEnter[screenId]();
            } catch (e) {
                console.error('[Nav] Erro no callback onEnter:', e);
            }
        }

    }, NavState.transitionDuration);

    return true;
}

/**
 * Volta para a tela anterior
 * @param {Object} options - Opções de navegação
 * @returns {boolean}
 */
export function goBack(options = {}) {
    if (NavState.history.length === 0) {
        console.warn('[Nav] Histórico vazio');
        return false;
    }

    const previousScreen = NavState.history.pop();

    // Usar animação inversa por padrão
    const defaultAnim = options.animation || 'slideRight';

    return navigateTo(previousScreen, {
        ...options,
        animation: defaultAnim,
        addToHistory: false
    });
}

/**
 * Registra um callback para quando entrar em uma tela
 * @param {string} screenId 
 * @param {Function} callback 
 */
export function onScreenEnter(screenId, callback) {
    if (typeof callback !== 'function') {
        console.error('[Nav] Callback deve ser uma função');
        return;
    }
    screenCallbacks.onEnter[screenId] = callback;
}

/**
 * Registra um callback para quando sair de uma tela
 * @param {string} screenId 
 * @param {Function} callback 
 */
export function onScreenExit(screenId, callback) {
    if (typeof callback !== 'function') {
        console.error('[Nav] Callback deve ser uma função');
        return;
    }
    screenCallbacks.onExit[screenId] = callback;
}

/**
 * Retorna a tela atual
 * @returns {string|null}
 */
export function getCurrentScreen() {
    return NavState.currentScreen;
}

/**
 * Retorna o histórico de navegação
 * @returns {string[]}
 */
export function getHistory() {
    return [...NavState.history];
}

/**
 * Limpa o histórico de navegação
 */
export function clearHistory() {
    NavState.history = [];
}

/**
 * Define a duração das transições
 * @param {number} ms - Duração em milissegundos
 */
export function setTransitionDuration(ms) {
    NavState.transitionDuration = ms;
}

// CSS para animações (adicionar ao seu CSS)
const navStyles = `
/* Animações de Navegação */
@keyframes nav-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes nav-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes nav-slide-in-left {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
}

@keyframes nav-slide-out-left {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
}

@keyframes nav-slide-in-right {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

@keyframes nav-slide-out-right {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
}

@keyframes nav-slide-in-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

@keyframes nav-slide-out-up {
    from { transform: translateY(0); }
    to { transform: translateY(-100%); }
}

@keyframes nav-slide-in-down {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
}

@keyframes nav-slide-out-down {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
}

.nav-fade-in { animation: nav-fade-in 0.25s ease-out; }
.nav-fade-out { animation: nav-fade-out 0.25s ease-out; }
.nav-slide-in-left { animation: nav-slide-in-left 0.25s ease-out; }
.nav-slide-out-left { animation: nav-slide-out-left 0.25s ease-out; }
.nav-slide-in-right { animation: nav-slide-in-right 0.25s ease-out; }
.nav-slide-out-right { animation: nav-slide-out-right 0.25s ease-out; }
.nav-slide-in-up { animation: nav-slide-in-up 0.25s ease-out; }
.nav-slide-out-up { animation: nav-slide-out-up 0.25s ease-out; }
.nav-slide-in-down { animation: nav-slide-in-down 0.25s ease-out; }
.nav-slide-out-down { animation: nav-slide-out-down 0.25s ease-out; }
`;

/**
 * Injeta os estilos de navegação no documento
 */
export function injectNavStyles() {
    const style = document.createElement('style');
    style.textContent = navStyles;
    document.head.appendChild(style);
}

// Exportar estado para debug
export const getNavState = () => ({ ...NavState });
