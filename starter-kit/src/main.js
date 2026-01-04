/**
 * AR Game Starter Kit - Main Application
 * Sistema modular para criar jogos de Realidade Aumentada
 * 
 * PERSONALIZE AS CONFIGURAÇÕES ABAIXO PARA SEU JOGO!
 */

// ============================================
// CONFIGURAÇÃO DO JOGO (PERSONALIZE AQUI!)
// ============================================
const GameConfig = {
    // Nome do seu jogo
    gameName: 'Meu Jogo AR',
    version: '1.0.0',

    // Configurações do jogador inicial
    player: {
        name: 'Jogador',
        startingHp: 100,
        startingLevel: 1
    },

    // Dificuldade: 'easy', 'normal', 'hard'
    difficulty: 'normal',

    // Multiplicadores por dificuldade
    difficultyModifiers: {
        easy: { playerDamage: 1.5, enemyDamage: 0.5, xpMultiplier: 0.75 },
        normal: { playerDamage: 1, enemyDamage: 1, xpMultiplier: 1 },
        hard: { playerDamage: 0.75, enemyDamage: 1.5, xpMultiplier: 1.5 }
    },

    // Habilitar/desabilitar funcionalidades
    features: {
        geolocation: true,
        quests: true,
        bestiary: true,
        diary: true,
        sound: true,
        vibration: true
    },

    // Configuração de spawn
    spawn: {
        maxEnemies: 5,
        maxItems: 10,
        spawnRadius: 100, // metros
        respawnTime: 30000 // ms
    }
};

// ============================================
// DADOS DO JOGO
// ============================================
const GameData = {
    // Estado do jogador
    player: {
        name: GameConfig.player.name,
        level: GameConfig.player.startingLevel,
        hp: GameConfig.player.startingHp,
        maxHp: GameConfig.player.startingHp,
        xp: 0,
        enemiesDefeated: 0,
        gamesPlayed: 0,
        itemsCollected: 0
    },

    // Inventário
    inventory: {
        // Armas disponíveis
        weapons: [
            {
                id: 'fist',
                name: 'Punho',
                icon: '👊',
                iconPath: '/images/icon-fist.png',
                quantity: 1,
                damage: 5,
                weakness: [],
                image: '/images/bg-fist.png',
                canCollect: false
            },
            {
                id: 'sword',
                name: 'Espada',
                icon: '⚔️',
                iconPath: '/images/icon-sword.png',
                quantity: 0,
                damage: 25,
                weakness: ['slime', 'goblin'],
                image: '/images/bg-sword.png',
                canCollect: true
            },
            {
                id: 'bow',
                name: 'Arco',
                icon: '🏹',
                iconPath: '/images/icon-bow.png',
                quantity: 0,
                damage: 20,
                weakness: ['bird', 'bat'],
                image: '/images/bg-bow.png',
                canCollect: true
            },
            {
                id: 'staff',
                name: 'Cajado',
                icon: '🪄',
                iconPath: '/images/icon-staff.png',
                quantity: 0,
                damage: 30,
                weakness: ['ghost', 'wizard'],
                image: '/images/bg-staff.png',
                special: 'magic',
                canCollect: true
            }
        ],

        // Acessórios
        accessories: [
            {
                id: 'torch',
                name: 'Tocha',
                icon: '🔦',
                iconPath: '/images/icon-torch.png',
                quantity: 1,
                effect: 'reveal_hidden'
            },
            {
                id: 'compass',
                name: 'Bússola',
                icon: '🧭',
                iconPath: '/images/icon-compass.png',
                quantity: 1,
                effect: 'show_enemies'
            },
            {
                id: 'shield',
                name: 'Escudo',
                icon: '🛡️',
                iconPath: '/images/icon-shield.png',
                quantity: 0,
                effect: 'reduce_damage'
            }
        ],

        // Itens de cura
        healing: [
            {
                id: 'potion_small',
                name: 'Poção Pequena',
                icon: '🧪',
                quantity: 3,
                healAmount: 25
            },
            {
                id: 'potion_large',
                name: 'Poção Grande',
                icon: '⚗️',
                quantity: 1,
                healAmount: 50
            },
            {
                id: 'elixir',
                name: 'Elixir',
                icon: '✨',
                quantity: 0,
                healAmount: 100
            }
        ]
    },

    // Equipamento atual
    equipped: {
        weapon: null,
        accessory: null,
        healing: null
    },

    // Enciclopédia/Bestiário de inimigos
    bestiary: [
        {
            id: 'slime',
            name: 'Slime',
            icon: '🟢',
            type: 'Criatura',
            status: 'unknown', // unknown, encountered, studied, defeated
            encounterCount: 0,
            hp: 50,
            damage: 5,
            model: 'slime-model',
            lore: 'Uma criatura gelatinosa que se move lentamente. Fácil de derrotar, mas em grupos pode ser perigosa.',
            weaknesses: ['Espada', 'Fogo'],
            immunities: ['Veneno'],
            tips: 'Use ataques físicos básicos. Evite ataques de veneno pois são imunes.',
            dangerLevel: 1
        },
        {
            id: 'goblin',
            name: 'Goblin',
            icon: '👺',
            type: 'Humanoide',
            status: 'unknown',
            encounterCount: 0,
            hp: 80,
            damage: 10,
            model: 'goblin-model',
            lore: 'Pequenas criaturas travessas que adoram roubar itens dos viajantes.',
            weaknesses: ['Espada', 'Arco'],
            immunities: [],
            tips: 'São rápidos mas fracos. Ataques à distância funcionam bem.',
            dangerLevel: 2
        },
        {
            id: 'ghost',
            name: 'Fantasma',
            icon: '👻',
            type: 'Espírito',
            status: 'unknown',
            encounterCount: 0,
            hp: 100,
            damage: 15,
            model: 'ghost-model',
            lore: 'Espíritos errantes presos entre os mundos. Atravessam objetos sólidos.',
            weaknesses: ['Cajado', 'Magia'],
            immunities: ['Espada', 'Arco', 'Físico'],
            tips: 'Use magia! Ataques físicos não funcionam contra fantasmas.',
            dangerLevel: 3
        },
        {
            id: 'dragon',
            name: 'Dragão',
            icon: '🐉',
            type: 'Mítico',
            status: 'unknown',
            encounterCount: 0,
            hp: 500,
            damage: 50,
            model: 'dragon-model',
            lore: 'A mais temida criatura do reino. Cospe fogo e tem escamas impenetráveis.',
            weaknesses: ['Gelo', 'Espada Mágica'],
            immunities: ['Fogo', 'Veneno'],
            tips: 'Encontre uma arma mágica de gelo. Cuidado com o sopro de fogo!',
            dangerLevel: 5
        }
    ],

    // Diário de eventos
    diary: [],

    // Sistema de missões
    quests: {
        active: [],
        available: [
            {
                id: 'tutorial_1',
                title: 'Primeiros Passos',
                description: 'Derrote seu primeiro inimigo.',
                type: 'kill',
                target: 'any',
                required: 1,
                progress: 0,
                reward: { xp: 50, item: 'potion_small' },
                completed: false
            },
            {
                id: 'hunter_1',
                title: 'Caçador Iniciante',
                description: 'Derrote 5 Slimes.',
                type: 'kill',
                target: 'slime',
                required: 5,
                progress: 0,
                reward: { xp: 100, item: 'sword' },
                completed: false
            },
            {
                id: 'collector_1',
                title: 'Colecionador',
                description: 'Colete 10 itens.',
                type: 'collect',
                target: 'any',
                required: 10,
                progress: 0,
                reward: { xp: 75, item: 'potion_large' },
                completed: false
            },
            {
                id: 'explorer_1',
                title: 'Explorador',
                description: 'Caminhe 1km explorando.',
                type: 'walk',
                target: null,
                required: 1000, // metros
                progress: 0,
                reward: { xp: 150, item: 'compass' },
                completed: false
            }
        ],
        completed: []
    },

    // Configurações do usuário
    settings: {
        sound: true,
        vibration: true,
        showTutorial: true
    },

    // Estado do jogo
    currentScreen: 'splash',
    currentTab: 'weapons',
    currentQuestTab: 'active',
    currentBestiaryFilter: 'all',

    // Estado AR
    arState: {
        isActive: false,
        currentEnemy: null,
        spawnedEntities: []
    }
};

// ============================================
// SISTEMA DE NAVEGAÇÃO
// ============================================
function navigateTo(screenId) {
    // Ocultar todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    // Mostrar a tela solicitada
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
        GameData.currentScreen = screenId;

        // Callbacks específicos por tela
        switch (screenId) {
            case 'home':
                updateHomeScreen();
                break;
            case 'map':
                initMap();
                break;
            case 'inventory':
                renderInventory();
                break;
            case 'bestiary':
                renderBestiary();
                break;
            case 'quests':
                renderQuests();
                break;
            case 'profile':
                updateProfileScreen();
                break;
            case 'game':
                startARMode();
                break;
        }
    }

    // Salvar estado
    saveGameData();
}

// ============================================
// ATUALIZAÇÃO DE TELAS
// ============================================
function updateHomeScreen() {
    // Atualizar nome e nível do jogador
    document.getElementById('player-name').textContent = GameData.player.name;
    document.getElementById('player-level').textContent = `Nível ${GameData.player.level}`;

    // Atualizar estatísticas
    document.getElementById('stat-enemies').textContent = GameData.player.enemiesDefeated;
    document.getElementById('stat-games').textContent = GameData.player.gamesPlayed;
    document.getElementById('stat-items').textContent = GameData.player.itemsCollected;
}

function updateProfileScreen() {
    document.getElementById('profile-name-input').value = GameData.player.name;
    document.getElementById('profile-enemies').textContent = GameData.player.enemiesDefeated;
    document.getElementById('profile-games').textContent = GameData.player.gamesPlayed;
    document.getElementById('profile-items').textContent = GameData.player.itemsCollected;
    document.getElementById('setting-sound').checked = GameData.settings.sound;
    document.getElementById('setting-vibration').checked = GameData.settings.vibration;
}

// ============================================
// SISTEMA DE INVENTÁRIO
// ============================================
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    const tab = GameData.currentTab;
    let items = [];

    switch (tab) {
        case 'weapons':
            items = GameData.inventory.weapons;
            break;
        case 'accessories':
            items = GameData.inventory.accessories;
            break;
        case 'healing':
            items = GameData.inventory.healing;
            break;
    }

    grid.innerHTML = items.map(item => `
        <div class="inventory-item ${item.quantity === 0 ? 'disabled' : ''} ${GameData.equipped[tab.slice(0, -1)] === item.id ? 'selected' : ''}"
             data-id="${item.id}" data-type="${tab}">
            <span class="item-icon">${item.icon}</span>
            <span class="item-name">${item.name}</span>
            ${item.quantity > 1 ? `<span class="item-quantity">${item.quantity}</span>` : ''}
        </div>
    `).join('');

    // Adicionar event listeners
    grid.querySelectorAll('.inventory-item:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => {
            const itemId = el.dataset.id;
            const itemType = el.dataset.type;
            equipItem(itemType, itemId);
        });
    });
}

function equipItem(type, itemId) {
    const singularType = type.slice(0, -1); // weapons -> weapon
    GameData.equipped[singularType] = itemId;
    renderInventory();
    saveGameData();

    console.log(`Equipado: ${itemId}`);
}

// ============================================
// SISTEMA DE BESTIÁRIO/ENCICLOPÉDIA
// ============================================
function renderBestiary() {
    const list = document.getElementById('bestiary-list');
    if (!list) return;

    const filter = GameData.currentBestiaryFilter;
    let entries = GameData.bestiary;

    // Aplicar filtro
    if (filter === 'defeated') {
        entries = entries.filter(e => e.status === 'defeated');
    } else if (filter === 'unknown') {
        entries = entries.filter(e => e.status === 'unknown');
    }

    list.innerHTML = entries.map(enemy => `
        <div class="bestiary-card ${enemy.status === 'unknown' ? 'unknown' : ''}"
             data-id="${enemy.id}">
            <div class="bestiary-icon">${enemy.status === 'unknown' ? '❓' : enemy.icon}</div>
            <div class="bestiary-info">
                <div class="bestiary-name">${enemy.status === 'unknown' ? '???' : enemy.name}</div>
                <div class="bestiary-type">${enemy.status === 'unknown' ? '???' : enemy.type}</div>
            </div>
            <div class="bestiary-danger">${'⭐'.repeat(enemy.dangerLevel)}</div>
        </div>
    `).join('');

    // Adicionar event listeners
    list.querySelectorAll('.bestiary-card').forEach(el => {
        el.addEventListener('click', () => {
            const enemyId = el.dataset.id;
            showEnemyDetails(enemyId);
        });
    });
}

function showEnemyDetails(enemyId) {
    const enemy = GameData.bestiary.find(e => e.id === enemyId);
    if (!enemy) return;

    const overlay = document.getElementById('enemy-detail-overlay');

    // Preencher dados
    document.getElementById('detail-icon').textContent = enemy.status === 'unknown' ? '❓' : enemy.icon;
    document.getElementById('detail-name').textContent = enemy.status === 'unknown' ? '???' : enemy.name;
    document.getElementById('detail-type').textContent = enemy.status === 'unknown' ? '???' : enemy.type;
    document.getElementById('detail-stars').textContent = '⭐'.repeat(enemy.dangerLevel);
    document.getElementById('detail-lore').textContent = enemy.status === 'unknown' ? 'Você ainda não encontrou esta criatura.' : enemy.lore;
    document.getElementById('detail-tips').textContent = enemy.status === 'unknown' ? '???' : enemy.tips;
    document.getElementById('detail-encounters').textContent = enemy.encounterCount;

    // Fraquezas
    const weaknessesEl = document.getElementById('detail-weaknesses');
    weaknessesEl.innerHTML = enemy.status === 'unknown' ? '<span class="weakness-tag">???</span>' :
        enemy.weaknesses.map(w => `<span class="weakness-tag">${w}</span>`).join('');

    // Imunidades
    const immunitiesEl = document.getElementById('detail-immunities');
    immunitiesEl.innerHTML = enemy.status === 'unknown' ? '<span class="immunity-tag">???</span>' :
        enemy.immunities.map(i => `<span class="immunity-tag">${i}</span>`).join('');

    // Mostrar modal
    overlay.classList.add('active');
}

// ============================================
// SISTEMA DE MISSÕES
// ============================================
function renderQuests() {
    const list = document.getElementById('quest-list');
    if (!list) return;

    const tab = GameData.currentQuestTab;
    let quests = [];

    switch (tab) {
        case 'active':
            quests = GameData.quests.active;
            break;
        case 'available':
            quests = GameData.quests.available.filter(q => !q.completed);
            break;
        case 'completed':
            quests = GameData.quests.completed;
            break;
    }

    if (quests.length === 0) {
        list.innerHTML = '<div class="text-center text-secondary" style="padding: 2rem;">Nenhuma missão nesta categoria.</div>';
        return;
    }

    list.innerHTML = quests.map(quest => `
        <div class="quest-card ${quest.completed ? 'completed' : ''}" data-id="${quest.id}">
            <div class="quest-header">
                <span class="quest-title">${quest.title}</span>
                <span class="quest-reward">+${quest.reward.xp} XP</span>
            </div>
            <p class="quest-description">${quest.description}</p>
            ${!quest.completed ? `
                <div class="quest-progress">
                    <div class="quest-progress-fill" style="width: ${(quest.progress / quest.required) * 100}%"></div>
                </div>
                <div class="text-secondary" style="font-size: 0.75rem; margin-top: 0.5rem;">
                    ${quest.progress}/${quest.required}
                </div>
            ` : '<div class="text-success" style="font-size: 0.75rem;">✓ Completa</div>'}
        </div>
    `).join('');

    // Adicionar event listeners para aceitar missões
    list.querySelectorAll('.quest-card').forEach(el => {
        el.addEventListener('click', () => {
            const questId = el.dataset.id;
            const quest = GameData.quests.available.find(q => q.id === questId);
            if (quest && !quest.completed && GameData.currentQuestTab === 'available') {
                acceptQuest(questId);
            }
        });
    });
}

function acceptQuest(questId) {
    const questIndex = GameData.quests.available.findIndex(q => q.id === questId);
    if (questIndex === -1) return;

    const quest = GameData.quests.available.splice(questIndex, 1)[0];
    GameData.quests.active.push(quest);

    // Feedback visual
    addDiaryEntry(`📜 Missão aceita: ${quest.title}`);

    renderQuests();
    saveGameData();
}

function updateQuestProgress(type, targetId) {
    GameData.quests.active.forEach(quest => {
        if (quest.type === type) {
            if (quest.target === 'any' || quest.target === targetId) {
                quest.progress++;

                if (quest.progress >= quest.required) {
                    completeQuest(quest.id);
                }
            }
        }
    });

    saveGameData();
}

function completeQuest(questId) {
    const questIndex = GameData.quests.active.findIndex(q => q.id === questId);
    if (questIndex === -1) return;

    const quest = GameData.quests.active.splice(questIndex, 1)[0];
    quest.completed = true;
    GameData.quests.completed.push(quest);

    // Dar recompensas
    GameData.player.xp += quest.reward.xp;
    if (quest.reward.item) {
        giveItem(quest.reward.item);
    }

    // Checar level up
    checkLevelUp();

    // Feedback
    addDiaryEntry(`🏆 Missão completa: ${quest.title} (+${quest.reward.xp} XP)`);

    saveGameData();
}

// ============================================
// SISTEMA DE ITENS
// ============================================
function giveItem(itemId) {
    // Procurar em todas as categorias
    const categories = ['weapons', 'accessories', 'healing'];

    for (const category of categories) {
        const item = GameData.inventory[category].find(i => i.id === itemId);
        if (item) {
            item.quantity++;
            GameData.player.itemsCollected++;
            addDiaryEntry(`📦 Item obtido: ${item.name}`);
            return true;
        }
    }

    return false;
}

function useHealingItem(itemId) {
    const item = GameData.inventory.healing.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return false;

    const healAmount = item.healAmount;
    GameData.player.hp = Math.min(GameData.player.maxHp, GameData.player.hp + healAmount);
    item.quantity--;

    addDiaryEntry(`💊 Usado: ${item.name} (+${healAmount} HP)`);
    updateARHud();
    saveGameData();

    return true;
}

// ============================================
// SISTEMA DE EXPERIÊNCIA E NÍVEIS
// ============================================
function checkLevelUp() {
    const xpRequired = GameData.player.level * 100;

    while (GameData.player.xp >= xpRequired) {
        GameData.player.xp -= xpRequired;
        GameData.player.level++;
        GameData.player.maxHp += 10;
        GameData.player.hp = GameData.player.maxHp;

        addDiaryEntry(`⬆️ Level Up! Agora você é nível ${GameData.player.level}`);
    }
}

// ============================================
// SISTEMA DE DIÁRIO
// ============================================
function addDiaryEntry(text) {
    const entry = {
        timestamp: new Date().toISOString(),
        text: text
    };

    GameData.diary.unshift(entry);

    // Limitar tamanho do diário
    if (GameData.diary.length > 100) {
        GameData.diary = GameData.diary.slice(0, 100);
    }

    console.log(`[Diário] ${text}`);
}

// ============================================
// SISTEMA DE MAPA
// ============================================
let map = null;

function initMap() {
    if (!GameConfig.features.geolocation) return;

    const mapContainer = document.getElementById('full-map');
    if (!mapContainer || map) return;

    // Inicializar mapa Leaflet
    map = L.map('full-map').setView([-23.5505, -46.6333], 15); // São Paulo como padrão

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Tentar obter localização real
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 16);

                // Adicionar marcador do jogador
                L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'player-marker',
                        html: '<div style="font-size: 24px;">📍</div>',
                        iconSize: [30, 30]
                    })
                }).addTo(map).bindPopup('Você está aqui');
            },
            (error) => {
                console.warn('Erro ao obter localização:', error);
            }
        );
    }
}

// ============================================
// MODO AR
// ============================================
function startARMode() {
    GameData.arState.isActive = true;
    GameData.player.gamesPlayed++;

    updateARHud();

    // Spawn de inimigos simulados (em um jogo real, use geolocalização)
    spawnRandomEnemy();

    addDiaryEntry('🎮 Modo AR iniciado');
    saveGameData();
}

function exitARMode() {
    GameData.arState.isActive = false;
    GameData.arState.currentEnemy = null;

    navigateTo('home');
}

function updateARHud() {
    // Atualizar HP do jogador
    const hpPercent = (GameData.player.hp / GameData.player.maxHp) * 100;
    const hpFill = document.getElementById('ar-player-hp-fill');
    const hpText = document.getElementById('ar-player-hp-text');

    if (hpFill) hpFill.style.width = `${hpPercent}%`;
    if (hpText) hpText.textContent = `${GameData.player.hp}/${GameData.player.maxHp}`;

    // Atualizar HP do inimigo
    if (GameData.arState.currentEnemy) {
        const enemy = GameData.arState.currentEnemy;
        const enemyHpPercent = (enemy.currentHp / enemy.maxHp) * 100;

        document.getElementById('ar-enemy-hp').classList.add('active');
        document.getElementById('ar-enemy-hp-fill').style.width = `${enemyHpPercent}%`;
        document.getElementById('ar-enemy-name').textContent = enemy.name;
        document.getElementById('ar-enemy-icon').textContent = enemy.icon;
    } else {
        document.getElementById('ar-enemy-hp').classList.remove('active');
    }
}

function spawnRandomEnemy() {
    // Selecionar inimigo aleatório
    const availableEnemies = GameData.bestiary;
    const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];

    GameData.arState.currentEnemy = {
        ...randomEnemy,
        currentHp: randomEnemy.hp,
        maxHp: randomEnemy.hp
    };

    // Atualizar status de encontro
    const bestiaryEntry = GameData.bestiary.find(e => e.id === randomEnemy.id);
    if (bestiaryEntry) {
        bestiaryEntry.encounterCount++;
        if (bestiaryEntry.status === 'unknown') {
            bestiaryEntry.status = 'encountered';
            addDiaryEntry(`👁️ Nova criatura descoberta: ${randomEnemy.name}!`);
        }
    }

    updateARHud();
    saveGameData();
}

function attack() {
    if (!GameData.arState.currentEnemy) return;

    // Pegar arma equipada
    const weaponId = GameData.equipped.weapon || 'fist';
    const weapon = GameData.inventory.weapons.find(w => w.id === weaponId);

    if (!weapon) return;

    // Calcular dano
    let damage = weapon.damage;
    const diffMod = GameConfig.difficultyModifiers[GameConfig.difficulty];
    damage *= diffMod.playerDamage;

    // Checar fraqueza
    const enemy = GameData.arState.currentEnemy;
    const isWeak = weapon.weakness.includes(enemy.id);
    const isImmune = enemy.immunities.includes(weapon.name);

    if (isImmune) {
        showHitFeedback('IMUNE!', 'danger');
        enemyAttack();
        return;
    }

    if (isWeak) {
        damage *= 2;
        showHitFeedback(`CRÍTICO! -${damage}`, 'success');
    } else {
        showHitFeedback(`-${damage}`, 'primary');
    }

    // Aplicar dano
    enemy.currentHp -= damage;

    // Vibrar (se habilitado)
    if (GameData.settings.vibration && navigator.vibrate) {
        navigator.vibrate(isWeak ? [50, 50, 50] : 50);
    }

    updateARHud();

    // Checar se morreu
    if (enemy.currentHp <= 0) {
        defeatEnemy();
    } else {
        // Contra-ataque
        enemyAttack();
    }
}

function enemyAttack() {
    if (!GameData.arState.currentEnemy) return;

    const enemy = GameData.arState.currentEnemy;
    const diffMod = GameConfig.difficultyModifiers[GameConfig.difficulty];

    let damage = enemy.damage * diffMod.enemyDamage;

    // Reduzir dano se tiver escudo equipado
    if (GameData.equipped.accessory === 'shield') {
        damage *= 0.5;
    }

    GameData.player.hp -= damage;

    // Vibrar
    if (GameData.settings.vibration && navigator.vibrate) {
        navigator.vibrate(100);
    }

    updateARHud();

    // Checar game over
    if (GameData.player.hp <= 0) {
        gameOver();
    }
}

function defeatEnemy() {
    const enemy = GameData.arState.currentEnemy;

    // Atualizar estatísticas
    GameData.player.enemiesDefeated++;

    // Atualizar bestiário
    const bestiaryEntry = GameData.bestiary.find(e => e.id === enemy.id);
    if (bestiaryEntry && bestiaryEntry.status !== 'defeated') {
        bestiaryEntry.status = 'defeated';
    }

    // Dar XP
    const xpGain = enemy.dangerLevel * 20 * GameConfig.difficultyModifiers[GameConfig.difficulty].xpMultiplier;
    GameData.player.xp += xpGain;

    // Atualizar progresso de missões
    updateQuestProgress('kill', enemy.id);

    // Chance de drop de item
    if (Math.random() < 0.3) {
        const randomItem = ['potion_small', 'potion_large'][Math.floor(Math.random() * 2)];
        giveItem(randomItem);
    }

    checkLevelUp();

    addDiaryEntry(`⚔️ ${enemy.name} derrotado! +${xpGain} XP`);
    showHitFeedback('VITÓRIA!', 'success');

    // Limpar inimigo atual
    GameData.arState.currentEnemy = null;
    updateARHud();

    // Spawnar novo inimigo após delay
    setTimeout(() => {
        if (GameData.arState.isActive) {
            spawnRandomEnemy();
        }
    }, 3000);

    saveGameData();
}

function gameOver() {
    GameData.player.hp = 0;

    addDiaryEntry('💀 Você foi derrotado...');
    showHitFeedback('GAME OVER', 'danger');

    // Restaurar HP após delay
    setTimeout(() => {
        GameData.player.hp = GameData.player.maxHp;
        exitARMode();
    }, 2000);

    saveGameData();
}

function showHitFeedback(text, type = 'primary') {
    const feedback = document.getElementById('ar-hit-feedback');
    if (!feedback) return;

    // Definir cor baseada no tipo
    const colors = {
        primary: 'var(--primary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)'
    };

    feedback.textContent = text;
    feedback.style.color = colors[type] || colors.primary;
    feedback.classList.add('show');

    setTimeout(() => {
        feedback.classList.remove('show');
    }, 500);
}

// ============================================
// PERSISTÊNCIA DE DADOS
// ============================================
function saveGameData() {
    try {
        localStorage.setItem('ar_game_data', JSON.stringify(GameData));
    } catch (e) {
        console.warn('Erro ao salvar dados:', e);
    }
}

function loadGameData() {
    try {
        const saved = localStorage.getItem('ar_game_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Mesclar dados salvos com dados padrão
            Object.assign(GameData, parsed);
        }
    } catch (e) {
        console.warn('Erro ao carregar dados:', e);
    }
}

function resetGameData() {
    if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
        localStorage.removeItem('ar_game_data');
        location.reload();
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    console.log(`🎮 ${GameConfig.gameName} v${GameConfig.version}`);

    // Carregar dados salvos
    loadGameData();

    // Configurar event listeners
    setupEventListeners();

    // Simular loading
    simulateSplashLoading();
}

function setupEventListeners() {
    // Navegação Home
    document.getElementById('btn-start-game')?.addEventListener('click', () => navigateTo('game'));
    document.getElementById('btn-map')?.addEventListener('click', () => navigateTo('map'));
    document.getElementById('btn-inventory')?.addEventListener('click', () => navigateTo('inventory'));
    document.getElementById('btn-bestiary')?.addEventListener('click', () => navigateTo('bestiary'));
    document.getElementById('btn-quests')?.addEventListener('click', () => navigateTo('quests'));
    document.getElementById('btn-profile')?.addEventListener('click', () => navigateTo('profile'));

    // Botões de voltar
    document.getElementById('btn-back-map')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-back-inventory')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-back-bestiary')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-back-quests')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('btn-back-profile')?.addEventListener('click', () => navigateTo('home'));

    // Tabs do inventário
    document.querySelectorAll('.inv-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            GameData.currentTab = tab.dataset.tab;
            renderInventory();
        });
    });

    // Filtros do bestiário
    document.querySelectorAll('.bestiary-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('.bestiary-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            GameData.currentBestiaryFilter = filter.dataset.filter;
            renderBestiary();
        });
    });

    // Fechar modal de detalhes do inimigo
    document.getElementById('enemy-detail-close')?.addEventListener('click', () => {
        document.getElementById('enemy-detail-overlay').classList.remove('active');
    });

    // Fechar modal ao clicar fora
    document.getElementById('enemy-detail-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'enemy-detail-overlay') {
            e.target.classList.remove('active');
        }
    });

    // Tabs de quests
    document.querySelectorAll('.quest-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            GameData.currentQuestTab = tab.dataset.tab;
            renderQuests();
        });
    });

    // Configurações do perfil
    document.getElementById('profile-name-input')?.addEventListener('change', (e) => {
        GameData.player.name = e.target.value;
        saveGameData();
    });

    document.getElementById('setting-sound')?.addEventListener('change', (e) => {
        GameData.settings.sound = e.target.checked;
        saveGameData();
    });

    document.getElementById('setting-vibration')?.addEventListener('change', (e) => {
        GameData.settings.vibration = e.target.checked;
        saveGameData();
    });

    document.getElementById('btn-reset-game')?.addEventListener('click', resetGameData);

    // Modo AR
    document.getElementById('ar-exit')?.addEventListener('click', exitARMode);
    document.getElementById('ar-fire')?.addEventListener('click', attack);

    // Slots de equipamento no AR
    document.querySelectorAll('.ar-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const type = slot.dataset.type;
            openARInventoryModal(type);
        });
    });

    // Modal de inventário no AR
    document.getElementById('ar-inv-close')?.addEventListener('click', () => {
        document.getElementById('ar-inventory-modal').classList.remove('active');
    });
}

function openARInventoryModal(type) {
    const modal = document.getElementById('ar-inventory-modal');
    const grid = document.getElementById('ar-inv-grid');

    if (!modal || !grid) return;

    let items = [];
    switch (type) {
        case 'weapon':
            items = GameData.inventory.weapons.filter(i => i.quantity > 0);
            break;
        case 'accessory':
            items = GameData.inventory.accessories.filter(i => i.quantity > 0);
            break;
        case 'healing':
            items = GameData.inventory.healing.filter(i => i.quantity > 0);
            break;
    }

    grid.innerHTML = items.map(item => `
        <div class="ar-inv-item ${GameData.equipped[type] === item.id ? 'selected' : ''}"
             data-id="${item.id}" data-type="${type}">
            <span class="icon">${item.icon}</span>
            <span class="name">${item.name}</span>
        </div>
    `).join('');

    grid.querySelectorAll('.ar-inv-item').forEach(el => {
        el.addEventListener('click', () => {
            const itemId = el.dataset.id;
            const itemType = el.dataset.type;

            if (itemType === 'healing') {
                useHealingItem(itemId);
            } else {
                GameData.equipped[itemType] = itemId;
                saveGameData();
            }

            modal.classList.remove('active');
        });
    });

    modal.classList.add('active');
}

function simulateSplashLoading() {
    const progressBar = document.getElementById('splash-progress');
    const statusText = document.getElementById('splash-status');

    const steps = [
        { progress: 20, text: 'Carregando recursos...' },
        { progress: 40, text: 'Inicializando cena AR...' },
        { progress: 60, text: 'Carregando modelos 3D...' },
        { progress: 80, text: 'Preparando inventário...' },
        { progress: 100, text: 'Pronto!' }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep >= steps.length) {
            clearInterval(interval);
            setTimeout(() => navigateTo('home'), 500);
            return;
        }

        const step = steps[currentStep];
        if (progressBar) progressBar.style.width = `${step.progress}%`;
        if (statusText) statusText.textContent = step.text;

        currentStep++;
    }, 500);
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// Exportar funções úteis para uso externo
window.GameData = GameData;
window.GameConfig = GameConfig;
window.navigateTo = navigateTo;
window.saveGameData = saveGameData;
