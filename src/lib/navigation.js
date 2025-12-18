/**
 * Supernatural AR - Sistema de Navegação
 * Gerencia transições entre telas do jogo
 */

class NavigationManager {
    constructor() {
        this.currentScreen = 'splash';
        this.screens = ['splash', 'home', 'hunt', 'map', 'inventory', 'bestiary', 'diary', 'profile'];
        this.history = [];
    }

    /**
     * Navegar para uma tela
     */
    goto(screenName) {
        if (!this.screens.includes(screenName)) {
            console.error(`❌ Tela desconhecida: ${screenName}`);
            return false;
        }

        // Salvar histórico
        this.history.push(this.currentScreen);

        // Esconder tela atual
        this.hideScreen(this.currentScreen);

        // Mostrar nova tela
        this.showScreen(screenName);

        this.currentScreen = screenName;
        console.log(`📱 Navegou para: ${screenName}`);

        return true;
    }

    /**
     * Voltar para tela anterior
     */
    back() {
        if (this.history.length === 0) {
            console.log('⚠️ Sem histórico para voltar');
            return false;
        }

        const previousScreen = this.history.pop();
        this.hideScreen(this.currentScreen);
        this.showScreen(previousScreen);
        this.currentScreen = previousScreen;

        console.log(`📱 Voltou para: ${previousScreen}`);
        return true;
    }

    hideScreen(screenName) {
        const screen = document.getElementById(`screen-${screenName}`);
        if (screen) {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        }
    }

    showScreen(screenName) {
        const screen = document.getElementById(`screen-${screenName}`);
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
        }
    }

    /**
     * Ir para Home limpando histórico
     */
    goHome() {
        this.history = [];
        this.hideScreen(this.currentScreen);
        this.showScreen('home');
        this.currentScreen = 'home';
    }
}

// Instância global
const nav = new NavigationManager();

export default nav;
