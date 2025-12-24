/**
 * Supernatural AR - Main Application
 * Sistema completo com navegação, inventário, combate e geolocalização
 */

// ============================================
// DADOS DO JOGO
// ============================================

const GameData = {
    player: {
        name: 'Caçador',
        level: 1,
        hp: 100,
        maxHp: 100,
        xp: 0,
        monstersDefeated: 0,
        huntsCompleted: 0,
        itemsCollected: 0
    },

    inventory: {
        weapons: [
            { id: 'hand', name: 'Mão', icon: '', iconPath: '/images/icon-mao.png', quantity: 1, damage: 5, weakness: [], image: '/images/bg-mao.png', canCollect: true },
            { id: 'shotgun', name: 'Espingarda', icon: '', iconPath: '/images/icon-espingarda.png', quantity: 0, damage: 20, weakness: ['ghost'], image: '/images/bg-espingarda.png', ammo: 'salt' },
            { id: 'holy_water', name: 'Água Benta', icon: '', iconPath: '/images/icon-agua-benta.png', quantity: 0, damage: 10, weakness: ['demon'], image: '/images/bg-agua-benta.png' },
            { id: 'knife', name: 'Faca', icon: '', iconPath: '/images/icon-faca.png', quantity: 0, damage: 15, weakness: ['werewolf'], image: '/images/bg-faca.png' },
            { id: 'salt', name: 'Sal', icon: '', iconPath: '/images/icon-sal.png', quantity: 0, damage: 25, weakness: ['ghost', 'demon'], image: null },
            { id: 'crowbar', name: 'Barra de Ferro', icon: '', iconPath: '/images/icon-ferro.png', quantity: 0, damage: 30, weakness: ['ghost'], image: '/images/bg-ferro.png' },
            { id: 'colt', name: 'Colt', icon: '', iconPath: '/images/icon-colt.png', quantity: 0, damage: 50, weakness: ['demon', 'vampire', 'werewolf'], image: '/images/bg-colt.png', ammo: 'silver' },
            { id: 'devil_trap', name: 'Selo da Armadilha', icon: '', iconPath: '/images/icon-selo.png', quantity: 0, damage: 0, weakness: ['demon'], image: '/images/bg-pentagrama.png', special: 'trap' },
            { id: 'bible', name: 'Bíblia', icon: '', iconPath: '/images/icon-blibia.png', quantity: 0, damage: 100, weakness: ['demon'], image: '/images/bg-biblia.png', special: 'exorcism' },
            { id: 'angel_blade', name: 'Lâmina de Anjo', icon: '', iconPath: '/images/icon-lamina-anjo.png', quantity: 0, damage: 80, weakness: ['demon', 'hellhound'], image: '/images/bg-faca-anjo.png' },
            { id: 'blood_knife', name: 'Faca com Sangue', icon: '', iconPath: '/images/icon-faca-morto.png', quantity: 0, damage: 40, weakness: ['vampire'], image: '/images/bg-faca-morto.png' },
            { id: 'wooden_stake', name: 'Estaca de Madeira', icon: '', iconPath: '/images/icon-estaca.png', quantity: 0, damage: 100, weakness: ['vampire'], image: '/images/bg-estaca.png', special: 'finisher' },
            { id: 'molotov', name: 'Coquetel Molotov', icon: '', iconPath: '/images/icon-inflamavel.png', quantity: 0, damage: 60, weakness: ['wendigo'], image: '/images/bg-molotov.png' },
            { id: 'lighter', name: 'Isqueiro', icon: '', iconPath: '/images/icon-isqueiro.png', quantity: 0, damage: 0, weakness: ['wendigo'], image: '/images/bg-isqueiro.png', special: 'ignite' }
        ],
        accessories: [
            { id: 'camera', name: 'Filmadora', icon: '📹', iconPath: '/images/icon-camera.png', quantity: 1, effect: 'reveal_ghost' },
            { id: 'uv_light', name: 'Lanterna UV', icon: '🔦', iconPath: '/images/icon-lanterna.png', quantity: 1, effect: 'reveal_messages' },
            { id: 'emf', name: 'Detector EMF', icon: '📡', iconPath: '/images/icon-emf.png', quantity: 1, effect: 'detect_nearby' }
        ],
        healing: [
            { id: 'bandage', name: 'Bandagem', icon: '🩹', quantity: 5, healAmount: 20 },
            { id: 'medkit', name: 'Kit Médico', icon: '💊', quantity: 2, healAmount: 50 },
            { id: 'adrenaline', name: 'Adrenalina', icon: '💉', quantity: 1, healAmount: 100 }
        ]
    },

    equipped: {
        weapon: null,
        accessory: null,
        healing: null
    },

    bestiary: [
        {
            id: 'werewolf',
            name: 'Lobisomem',
            icon: '🐺',
            type: 'Licantropo',
            status: 'unknown', // unknown, encountered, studied, defeated
            encounterCount: 0,
            lore: 'Humanos amaldiçoados que se transformam em bestas ferozes sob a luz da lua cheia. A licantropia é transmitida através de uma mordida e não tem cura conhecida. Extremamente fortes e rápidos, mantêm alguma consciência humana.',
            weaknesses: [
                { item: 'Bala de Prata', description: 'Um tiro certeiro com bala de prata no coração é fatal.' },
                { item: 'Lâmina de Prata', description: 'Facas ou espadas banhadas em prata causam dano severo.' }
            ],
            immunities: ['Fogo', 'Armas comuns', 'Água benta'],
            tips: 'Use o Colt com munição de prata. Ataque durante a transformação quando estão mais vulneráveis. Evite combate corpo-a-corpo.',
            dangerLevel: 4
        },
        {
            id: 'vampire',
            name: 'Vampiro',
            icon: '🧛',
            type: 'Morto-Vivo',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Criaturas da noite que se alimentam de sangue humano. Possuem força e velocidade sobre-humanas, além de capacidade de hipnose. A maioria foi humana antes de ser transformada por outro vampiro.',
            weaknesses: [
                { item: 'Sangue de Morto', description: 'A Lâmina com Sangue de Morto enfraquece vampiros.' },
                { item: 'Decapitação', description: 'Cortar a cabeça é uma forma definitiva de matar.' },
                { item: 'Estaca de Madeira', description: 'Uma estaca no coração imobiliza, permitindo o golpe final.' }
            ],
            immunities: ['Balas comuns', 'Água benta'],
            tips: 'Primeiro ataque com a Faca com Sangue do Morto para enfraquecer. Quando o HP chegar a zero, finalize com a Estaca de Madeira.',
            dangerLevel: 5
        },
        {
            id: 'ghost',
            name: 'Fantasma',
            icon: '👻',
            type: 'Espírito',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Espíritos de pessoas mortas presas ao plano terreno por assuntos inacabados ou mortes violentas. Podem ser benignos ou extremamente perigosos. Geralmente assombram o local de sua morte ou estão ligados a um objeto pessoal.',
            weaknesses: [
                { item: 'Sal', description: 'Círculos de sal os mantém afastados temporariamente.' },
                { item: 'Ferro', description: 'Armas de ferro puro dispersam fantasmas temporariamente.' },
                { item: 'Queimar Ossos', description: 'Salgar e queimar os restos mortais destrói o fantasma para sempre.' }
            ],
            immunities: ['Armas físicas normais', 'Maioria das armas sobrenaturais'],
            tips: 'Use a Filmadora Antiga para torná-los visíveis. Ataque com a Barra de Ferro para dispersá-los. Para destruição permanente, encontre e queime os ossos.',
            dangerLevel: 3
        },
        {
            id: 'demon',
            name: 'Demônio',
            icon: '😈',
            type: 'Sobrenatural',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Almas humanas corrompidas que foram ao Inferno e retornaram como entidades malignas. Possuem corpos humanos e têm poderes telecinéticos. Hierarquia complexa com demônios de olhos pretos sendo os mais comuns.',
            weaknesses: [
                { item: 'Armadilha do Diabo', description: 'O Selo da Armadilha imobiliza demônios completamente.' },
                { item: 'Água Benta', description: 'Causa dor intensa mas não mata.' },
                { item: 'Exorcismo', description: 'A leitura da Bíblia expulsa o demônio do corpo hospedeiro.' },
                { item: 'Lâmina de Anjo', description: 'Mata o demônio permanentemente.' }
            ],
            immunities: ['Armas físicas', 'Fogo'],
            tips: 'Use primeiro o Selo da Armadilha do Diabo para imobilizar. Depois use a Bíblia para exorcizar. Para matar definitivamente, use a Lâmina de Anjo.',
            dangerLevel: 5
        },
        {
            id: 'wendigo',
            name: 'Wendigo',
            icon: '🦴',
            type: 'Criatura',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Humanos que recorreram ao canibalismo em condições extremas e foram transformados em criaturas imortais e famintas. Incrivelmente rápidos, fortes e territoriais. Hibernam por longos períodos e caçam em florestas remotas.',
            weaknesses: [
                { item: 'Fogo', description: 'A única forma de matar um Wendigo é queimá-lo.' }
            ],
            immunities: ['Balas', 'Facas', 'Sal', 'Água benta', 'Ferro'],
            tips: 'Jogue o Coquetel Molotov para banhar em líquido inflamável. Em seguida, use o Isqueiro para acender as chamas e destruí-lo.',
            dangerLevel: 4
        },
        {
            id: 'hellhound',
            name: 'Cão do Inferno',
            icon: '🐕‍🦺',
            type: 'Sobrenatural',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Bestas demoníacas invisíveis a olho nu que servem como cobradores de almas para demônios da encruzilhada. Quando um contrato vence, os cães do inferno caçam e arrastam a alma para o Inferno.',
            weaknesses: [
                { item: 'Sal', description: 'Círculos de sal os impedem de atacar.' },
                { item: 'Lâmina de Anjo', description: 'A única arma que pode matar um Cão do Inferno.' }
            ],
            immunities: ['Armas comuns', 'Água benta', 'Ferro'],
            tips: 'Desenhe um círculo de sal no chão para se proteger. Use a Lâmina de Anjo para atacar. Óculos especiais ou estar à beira da morte permite vê-los.',
            dangerLevel: 5
        },
        {
            id: 'witch',
            name: 'Bruxa',
            icon: '🧙‍♀️',
            type: 'Humano',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Humanos que fizeram pactos com demônios em troca de poderes mágicos. Praticam magia negra usando sacos de maldição contendo ingredientes macabros. Enquanto os sacos existirem, a bruxa é praticamente invencível.',
            weaknesses: [
                { item: 'Destruir Sacos de Maldição', description: 'Destrua todos os sacos de maldição para torná-la vulnerável.' },
                { item: 'Armas Letais', description: 'Uma vez vulnerável, qualquer arma que mate humanos funciona.' }
            ],
            immunities: ['Magia (enquanto os sacos existirem)', 'Ataques diretos'],
            tips: 'Procure e destrua todos os Sacos de Maldição espalhados pela área. Só então a bruxa se tornará vulnerável. Finalize com Faca ou Revólver.',
            dangerLevel: 4
        },
        {
            id: 'crossroads_demon',
            name: 'Demônio da Encruzilhada',
            icon: '🔴',
            type: 'Sobrenatural',
            status: 'unknown',
            encounterCount: 0,
            lore: 'Demônios especiais que fazem pactos com humanos em encruzilhadas. Oferecem desejos em troca da alma após um período (geralmente 10 anos). São invocados enterrando uma caixa com foto e ossos de gato preto.',
            weaknesses: [
                { item: 'Armadilha do Diabo', description: 'Imobiliza completamente o demônio.' },
                { item: 'Exorcismo', description: 'Expulsa o demônio do corpo hospedeiro.' },
                { item: 'Lâmina de Anjo', description: 'Mata permanentemente.' }
            ],
            immunities: ['Armas físicas', 'Fogo'],
            tips: 'Vá até uma encruzilhada. Enterre a Caixa com Foto para invocá-lo. Use o Selo da Armadilha para prendê-lo e a Bíblia para exorcizar.',
            dangerLevel: 4
        }
    ],

    diary: [],

    currentTab: 'weapons',
    currentScreen: 'splash'
};

// Inicializar com mão equipada
GameData.equipped.weapon = GameData.inventory.weapons[0];

// ============================================
// PERSISTÊNCIA DE DADOS (LocalStorage)
// ============================================

const STORAGE_KEY = 'supernaturalAR_save';

/**
 * Salvar estado do jogo no LocalStorage
 */
function saveGame() {
    try {
        const saveData = {
            player: GameData.player,
            inventory: GameData.inventory,
            equipped: {
                weapon: GameData.equipped.weapon?.id || null,
                accessory: GameData.equipped.accessory?.id || null,
                healing: GameData.equipped.healing?.id || null
            },
            bestiary: GameData.bestiary.map(m => ({
                id: m.id,
                status: m.status,
                encounterCount: m.encounterCount
            })),
            diary: GameData.diary,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log('💾 Jogo salvo com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar jogo:', error);
        return false;
    }
}

/**
 * Carregar estado do jogo do LocalStorage
 */
function loadGame() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            console.log('📂 Nenhum save encontrado, iniciando novo jogo');
            return false;
        }

        const saveData = JSON.parse(saved);

        // Restaurar dados do jogador
        Object.assign(GameData.player, saveData.player);

        // Restaurar inventário
        if (saveData.inventory) {
            // Atualizar quantidades das armas
            saveData.inventory.weapons?.forEach(savedWeapon => {
                const weapon = GameData.inventory.weapons.find(w => w.id === savedWeapon.id);
                if (weapon) weapon.quantity = savedWeapon.quantity;
            });
            // Atualizar acessórios
            saveData.inventory.accessories?.forEach(savedAcc => {
                const acc = GameData.inventory.accessories.find(a => a.id === savedAcc.id);
                if (acc) acc.quantity = savedAcc.quantity;
            });
            // Atualizar cura
            saveData.inventory.healing?.forEach(savedHeal => {
                const heal = GameData.inventory.healing.find(h => h.id === savedHeal.id);
                if (heal) heal.quantity = savedHeal.quantity;
            });
        }

        // Restaurar equipamentos
        if (saveData.equipped) {
            GameData.equipped.weapon = GameData.inventory.weapons.find(w => w.id === saveData.equipped.weapon) || GameData.inventory.weapons[0];
            GameData.equipped.accessory = GameData.inventory.accessories.find(a => a.id === saveData.equipped.accessory) || null;
            GameData.equipped.healing = GameData.inventory.healing.find(h => h.id === saveData.equipped.healing) || null;
        }

        // Restaurar bestiário
        if (saveData.bestiary) {
            saveData.bestiary.forEach(savedMonster => {
                const monster = GameData.bestiary.find(m => m.id === savedMonster.id);
                if (monster) {
                    monster.status = savedMonster.status;
                    monster.encounterCount = savedMonster.encounterCount;
                }
            });
        }

        // Restaurar diário
        if (saveData.diary) {
            GameData.diary = saveData.diary;
        }

        console.log(`📂 Jogo carregado! Salvo em: ${new Date(saveData.savedAt).toLocaleString('pt-BR')}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar jogo:', error);
        return false;
    }
}

/**
 * Limpar save do jogo
 */
function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Save removido');
}

/**
 * Auto-save a cada 30 segundos durante gameplay
 */
let autoSaveInterval = null;

function startAutoSave() {
    if (autoSaveInterval) return;
    autoSaveInterval = setInterval(() => {
        saveGame();
    }, 30000); // 30 segundos
    console.log('💾 Auto-save ativado (30s)');
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// ============================================
// NAVEGAÇÃO
// ============================================

function goto(screenId) {
    // Esconder tela atual
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.remove('active');
        currentScreen.classList.add('hidden');
    }

    // Mostrar nova tela
    const newScreen = document.getElementById(`screen-${screenId}`);
    if (newScreen) {
        newScreen.classList.remove('hidden');
        newScreen.classList.add('active');
        GameData.currentScreen = screenId;

        // Ações específicas por tela
        if (screenId === 'home') {
            updateHomeStats();
        } else if (screenId === 'inventory') {
            renderInventoryFull();
        } else if (screenId === 'bestiary') {
            renderBestiary();
        } else if (screenId === 'profile') {
            updateProfileStats();
        } else if (screenId === 'hunt') {
            startARMode();
        } else if (screenId === 'map') {
            initFullMap();
        } else if (screenId === 'diary') {
            renderDiary();
        }
    }

    // Salvar jogo ao mudar de tela
    saveGame();

    console.log(`📱 Navegou para: ${screenId}`);
}

function goBack() {
    goto('home');
}

// ============================================
// SPLASH SCREEN - PRÉ-CARREGAMENTO DE RECURSOS
// ============================================

// Lista de todos os recursos para pré-carregar
const PRELOAD_RESOURCES = {
    images: [
        '/images/bg-espingarda.png',
        '/images/bg-faca.png',
        '/images/bg-ferro.png',
        '/images/bg-mao.png',
        '/images/bg-colt.png',
        '/images/bg-pentagrama.png',
        '/images/bg-biblia.png',
        '/images/bg-faca-anjo.png',
        '/images/bg-estaca.png',
        '/images/bg-molotov.png',
        '/images/bg-isqueiro.png',
        '/images/bg-agua-benta.png',
        '/images/bg-faca-morto.png',
        '/images/icon-agua-benta.png',
        '/images/icon-espingarda.png',
        '/images/icon-faca.png',
        '/images/icon-ferro.png',
        '/images/icon-mao.png',
        '/images/icon-sal.png',
        '/images/icon-colt.png',
        '/images/icon-selo.png',
        '/images/icon-blibia.png',
        '/images/icon-lamina-anjo.png',
        '/images/icon-faca-morto.png',
        '/images/icon-estaca.png',
        '/images/icon-inflamavel.png',
        '/images/icon-isqueiro.png',
        '/images/inventario-armas.png',
        '/images/inventario-assessorios.png',
        '/images/inventario-cura.png'
    ],
    models: [
        '/werewolf.glb',
        '/vampire.glb',
        '/ghost.glb',
        '/demon.glb',
        '/holy-water.glb',
        '/salt.glb',
        '/knife.glb',
        '/shotgun.glb',
        '/crowbar.glb',
        '/colt.glb',
        '/selo.glb',
        '/bible.glb',
        '/knife-angel.glb',
        '/knife-blood.glb',
        '/estaca.glb',
        '/molotov.glb',
        '/isqueiro.glb'
    ]
};

// Cache para armazenar recursos carregados
const resourceCache = {
    images: {},
    models: {}
};

// Função para pré-carregar uma imagem
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resourceCache.images[src] = img;
            resolve(src);
        };
        img.onerror = () => {
            console.warn(`⚠️ Falha ao carregar imagem: ${src}`);
            resolve(src); // Resolve mesmo com erro para não travar
        };
        img.src = src;
    });
}

// Função para pré-carregar um modelo 3D (fetch para cache do browser)
function preloadModel(src) {
    return fetch(src)
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            throw new Error(`HTTP ${response.status}`);
        })
        .then(blob => {
            resourceCache.models[src] = URL.createObjectURL(blob);
            return src;
        })
        .catch(err => {
            console.warn(`⚠️ Falha ao carregar modelo: ${src}`, err);
            return src; // Resolve mesmo com erro para não travar
        });
}

// Extrair nome do arquivo do caminho
function getFileName(path) {
    return path.split('/').pop();
}

// Rastreador de erros de carregamento de modelos 3D
const loadErrors = {
    images: [],
    models: []
};

async function initSplash() {
    const progress = document.getElementById('splash-progress');
    const status = document.getElementById('splash-status');

    // Limpar erros anteriores
    loadErrors.images = [];
    loadErrors.models = [];

    // Carregar save antes de iniciar
    status.textContent = 'Verificando save...';
    const hasSave = loadGame();
    await new Promise(r => setTimeout(r, 200));

    const allResources = [
        ...PRELOAD_RESOURCES.images.map(src => ({ type: 'image', src })),
        ...PRELOAD_RESOURCES.models.map(src => ({ type: 'model', src }))
    ];

    const totalResources = allResources.length;
    let loadedCount = 0;
    let errorCount = 0;

    status.textContent = 'Iniciando carregamento...';
    progress.style.width = '0%';

    // Carregar recursos em paralelo, mas atualizar UI sequencialmente
    const loadPromises = allResources.map(async (resource, index) => {
        const fileName = getFileName(resource.src);
        let success = true;

        try {
            if (resource.type === 'image') {
                await preloadImage(resource.src);
            } else {
                await preloadModel(resource.src);
            }
        } catch (error) {
            success = false;
            errorCount++;
            if (resource.type === 'image') {
                loadErrors.images.push({ src: resource.src, error: error.message });
            } else {
                loadErrors.models.push({ src: resource.src, error: error.message });
            }
        }

        loadedCount++;
        const progressPercent = Math.round((loadedCount / totalResources) * 90); // Até 90%

        progress.style.width = `${progressPercent}%`;
        status.textContent = `Carregando: ${fileName}${!success ? ' ⚠️' : ''}`;

        return { src: resource.src, success };
    });

    try {
        const results = await Promise.all(loadPromises);
        const successCount = results.filter(r => r.success).length;

        // Etapa final
        progress.style.width = '95%';
        status.textContent = 'Preparando AR...';
        await new Promise(r => setTimeout(r, 300));

        progress.style.width = '100%';

        if (errorCount > 0) {
            status.textContent = `Pronto! (${errorCount} recursos com erro)`;
            console.warn(`⚠️ ${errorCount} recursos falharam ao carregar:`, loadErrors);
            showModelLoadErrors();
        } else {
            status.textContent = hasSave ? 'Progresso restaurado!' : 'Pronto!';
        }

        await new Promise(r => setTimeout(r, 500));

        console.log(`✅ ${successCount}/${totalResources} recursos pré-carregados com sucesso!`);

        // Iniciar auto-save
        startAutoSave();

        goto('home');

    } catch (error) {
        console.error('❌ Erro no carregamento:', error);
        status.textContent = 'Erro ao carregar recursos';
        // Mesmo com erro, vai para home após delay
        setTimeout(() => goto('home'), 2000);
    }
}

/**
 * Mostrar feedback visual sobre erros de carregamento de modelos
 */
function showModelLoadErrors() {
    if (loadErrors.models.length === 0) return;

    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = 'load-error-notification';
    notification.innerHTML = `
        <div class="load-error-content">
            <span class="load-error-icon">⚠️</span>
            <div class="load-error-text">
                <strong>${loadErrors.models.length} modelo(s) 3D não carregaram</strong>
                <small>Alguns monstros/itens podem não aparecer corretamente</small>
            </div>
            <button class="load-error-close" onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    document.body.appendChild(notification);

    // Auto-remover após 5 segundos
    setTimeout(() => notification.remove(), 5000);
}

// ============================================
// HOME SCREEN
// ============================================

function updateHomeStats() {
    document.getElementById('stat-monsters').textContent = GameData.player.monstersDefeated;
    document.getElementById('stat-hunts').textContent = GameData.player.huntsCompleted;
    document.getElementById('stat-items').textContent = GameData.player.itemsCollected;
}

// ============================================
// INVENTORY SCREEN (Full)
// ============================================

function renderInventoryFull() {
    const grid = document.getElementById('inventory-full-grid');
    if (!grid) return;

    grid.innerHTML = '';

    let items = [];
    let equippedItem = null;

    switch (GameData.currentTab) {
        case 'weapons':
            // Filtrar apenas armas com quantity > 0 (coletadas)
            items = GameData.inventory.weapons.filter(w => w.quantity > 0);
            equippedItem = GameData.equipped.weapon;
            break;
        case 'accessories':
            items = GameData.inventory.accessories;
            equippedItem = GameData.equipped.accessory;
            break;
        case 'healing':
            items = GameData.inventory.healing;
            equippedItem = GameData.equipped.healing;
            break;
    }

    items.forEach(item => {
        const isEquipped = equippedItem && equippedItem.id === item.id;

        const el = document.createElement('div');
        el.className = `inv-item ${isEquipped ? 'equipped' : ''}`;

        // Usar iconPath (imagem PNG) se disponível, senão usar emoji
        const iconHtml = item.iconPath
            ? `<img class="inv-item-icon-img" src="${item.iconPath}" alt="${item.name}">`
            : `<span class="inv-item-icon">${item.icon}</span>`;

        el.innerHTML = `
      ${iconHtml}
      <span class="inv-item-name">${item.name}</span>
    `;
        el.addEventListener('click', () => equipItemFull(item.id, GameData.currentTab));

        grid.appendChild(el);
    });
}

function equipItemFull(itemId, category) {
    let items, slotKey;

    switch (category) {
        case 'weapons':
            items = GameData.inventory.weapons;
            slotKey = 'weapon';
            break;
        case 'accessories':
            items = GameData.inventory.accessories;
            slotKey = 'accessory';
            break;
        case 'healing':
            items = GameData.inventory.healing;
            slotKey = 'healing';
            break;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (GameData.equipped[slotKey] && GameData.equipped[slotKey].id === itemId) {
        if (slotKey === 'weapon') {
            GameData.equipped[slotKey] = GameData.inventory.weapons[0];
        } else {
            GameData.equipped[slotKey] = null;
        }
    } else {
        GameData.equipped[slotKey] = item;
    }

    renderInventoryFull();
    console.log(`✅ Equipado: ${item.name}`);
}

// ============================================
// BESTIARY SCREEN
// ============================================

let currentBestiaryFilter = 'all';

function renderBestiary(filter = currentBestiaryFilter) {
    const list = document.getElementById('bestiary-list');
    if (!list) return;

    currentBestiaryFilter = filter;
    list.innerHTML = '';

    // Filtrar os monstros baseado no filtro selecionado
    let filteredMonsters = GameData.bestiary;

    if (filter === 'defeated') {
        filteredMonsters = GameData.bestiary.filter(m => m.status === 'defeated');
    } else if (filter === 'unknown') {
        filteredMonsters = GameData.bestiary.filter(m => m.status === 'unknown');
    }

    if (filteredMonsters.length === 0) {
        list.innerHTML = `
            <div class="bestiary-empty">
                <p>📭 Nenhum monstro encontrado</p>
                <p class="small">Comece uma caçada para encontrar monstros!</p>
            </div>
        `;
        return;
    }

    filteredMonsters.forEach(monster => {
        const card = document.createElement('div');
        card.className = `monster-card ${monster.status}`;
        card.dataset.monsterId = monster.id;

        // Gerar os skulls para o nível de perigo
        const dangerSkulls = generateDangerSkulls(monster.dangerLevel || 3);

        // Determinar ícone e texto de status
        const statusInfo = getStatusInfo(monster.status);

        card.innerHTML = `
            <div class="monster-icon">${monster.icon}</div>
            <div class="monster-info">
                <div class="monster-name">${monster.name}</div>
                <div class="monster-type">${monster.type}</div>
                <div class="monster-danger">${dangerSkulls}</div>
            </div>
            <div class="monster-status ${monster.status}">
                <span class="status-icon">${statusInfo.icon}</span>
                <span class="status-text">${statusInfo.text}</span>
            </div>
        `;

        // Adicionar evento de clique para abrir detalhes
        card.addEventListener('click', () => showMonsterDetails(monster.id));

        list.appendChild(card);
    });
}

// Gerar skulls para indicar nível de perigo
function generateDangerSkulls(level) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="skull ${i <= level ? 'active' : ''}">💀</span>`;
    }
    return html;
}

// Obter informações de status
function getStatusInfo(status) {
    switch (status) {
        case 'defeated':
            return { icon: '✓', text: 'Derrotado' };
        case 'encountered':
            return { icon: '👁️', text: 'Encontrado' };
        case 'studied':
            return { icon: '📚', text: 'Estudado' };
        default:
            return { icon: '❓', text: 'Desconhecido' };
    }
}

// Mostrar detalhes do monstro
function showMonsterDetails(monsterId) {
    const monster = GameData.bestiary.find(m => m.id === monsterId);
    if (!monster) return;

    const overlay = document.getElementById('monster-detail-overlay');
    if (!overlay) return;

    // Atualizar ícone e nome
    document.getElementById('detail-icon').textContent = monster.icon;
    document.getElementById('detail-name').textContent = monster.name;
    document.getElementById('detail-type').textContent = monster.type;

    // Atualizar nível de perigo (skulls)
    const dangerLevel = monster.dangerLevel || 3;
    let skullsHtml = '';
    for (let i = 1; i <= 5; i++) {
        skullsHtml += i <= dangerLevel ? '💀' : '🖤';
    }
    document.getElementById('detail-skulls').textContent = skullsHtml;

    // Atualizar status badge
    const statusDiv = document.getElementById('detail-status');
    const statusInfo = getStatusInfo(monster.status);
    const statusBadgeClass = monster.status || 'unknown';
    statusDiv.innerHTML = `
        <span class="status-badge ${statusBadgeClass}">${statusInfo.icon} ${statusInfo.text}</span>
    `;

    // Atualizar lore
    document.getElementById('detail-lore').textContent = monster.lore || 'Informações não disponíveis.';

    // Atualizar fraquezas
    const weaknessesDiv = document.getElementById('detail-weaknesses');
    if (monster.weaknesses && monster.weaknesses.length > 0) {
        weaknessesDiv.innerHTML = monster.weaknesses.map(w => `
            <div class="weakness-item">
                <div class="weakness-icon">⚔️</div>
                <div class="weakness-content">
                    <div class="weakness-name">${w.item}</div>
                    <div class="weakness-desc">${w.description}</div>
                </div>
            </div>
        `).join('');
    } else {
        weaknessesDiv.innerHTML = '<p style="color: #666;">Informações não disponíveis</p>';
    }

    // Atualizar imunidades
    const immunitiesDiv = document.getElementById('detail-immunities');
    if (monster.immunities && monster.immunities.length > 0) {
        immunitiesDiv.innerHTML = monster.immunities.map(i => `
            <span class="immunity-tag">🛡️ ${i}</span>
        `).join('');
    } else {
        immunitiesDiv.innerHTML = '<span class="immunity-tag">Nenhuma conhecida</span>';
    }

    // Atualizar dicas
    document.getElementById('detail-tips').textContent = monster.tips || 'Nenhuma dica disponível.';

    // Atualizar estatísticas
    document.getElementById('detail-encounters').textContent = monster.encounterCount || 0;

    // Marcar como estudado se estava desconhecido
    if (monster.status === 'unknown') {
        monster.status = 'studied';
    }

    // Mostrar o overlay
    overlay.classList.add('visible');

    console.log(`📖 Abrindo detalhes: ${monster.name}`);
}

// Fechar detalhes do monstro
function hideMonsterDetails() {
    const overlay = document.getElementById('monster-detail-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
    // Atualizar a lista para refletir mudanças de status
    renderBestiary();
    // Salvar progresso ao estudar monstro
    saveGame();
}

// ============================================
// DIARY SCREEN - RENDERIZAÇÃO
// ============================================

/**
 * Renderizar entradas do diário
 */
function renderDiary() {
    const container = document.getElementById('diary-entries');
    if (!container) return;

    if (GameData.diary.length === 0) {
        container.innerHTML = `
            <div class="diary-empty">
                <p>📝 Seu diário está vazio</p>
                <p class="small">Eventos de caçada aparecerão aqui</p>
            </div>
        `;
        return;
    }

    // Ordenar por data mais recente
    const entries = [...GameData.diary].slice(0, 50); // Limitar a 50 entradas

    container.innerHTML = entries.map((entry, index) => {
        const icon = getDiaryEntryIcon(entry.text);
        return `
            <div class="diary-entry" style="animation-delay: ${index * 0.05}s">
                <div class="diary-entry-header">
                    <span class="diary-icon">${icon}</span>
                    <span class="diary-date">${entry.date}</span>
                </div>
                <div class="diary-text">${entry.text}</div>
                <div class="diary-location">📍 ${entry.location}</div>
            </div>
        `;
    }).join('');
}

/**
 * Obter ícone baseado no tipo de entrada
 */
function getDiaryEntryIcon(text) {
    if (text.includes('Derrotou')) return '⚔️';
    if (text.includes('Coletou')) return '📦';
    if (text.includes('Encontrou')) return '👁️';
    if (text.includes('Curou')) return '💊';
    if (text.includes('Equipou')) return '🔧';
    return '📝';
}

// ============================================
// PROFILE SCREEN
// ============================================

function updateProfileStats() {
    document.getElementById('profile-monsters').textContent = GameData.player.monstersDefeated;
    document.getElementById('profile-hunts').textContent = GameData.player.huntsCompleted;
    document.getElementById('profile-items').textContent = GameData.player.itemsCollected;
    document.getElementById('profile-name').value = GameData.player.name;
}

// ============================================
// AR MODE
// ============================================

let arSession = null;
let arErrorShown = false;

/**
 * Mostrar modal de erro AR com opções
 */
function showARErrorModal(title, message, showDemoOption = true) {
    // Criar overlay de erro
    let modal = document.getElementById('ar-error-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ar-error-modal';
        modal.className = 'ar-error-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="ar-error-content">
            <div class="ar-error-icon">📵</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="ar-error-info">
                <strong>Requisitos para AR:</strong>
                <ul>
                    <li>✓ Navegador Chrome ou Edge (versão recente)</li>
                    <li>✓ Dispositivo com câmera</li>
                    <li>✓ Conexão HTTPS</li>
                    <li>✓ Suporte a WebXR/ARCore</li>
                </ul>
            </div>
            <div class="ar-error-buttons">
                ${showDemoOption ? '<button class="ar-error-btn demo" onclick="startDemoMode()">🎮 Modo Demo</button>' : ''}
                <button class="ar-error-btn back" onclick="closeARErrorModal()">← Voltar</button>
            </div>
        </div>
    `;
    modal.classList.add('visible');
}

function closeARErrorModal() {
    const modal = document.getElementById('ar-error-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
    goto('home');
}

/**
 * Modo Demo - Simulação sem AR real
 */
function startDemoMode() {
    closeARErrorModal();
    console.log('🎮 Iniciando modo demo...');

    // Iniciar sem WebXR
    updateARHUD();
    initARGeolocation();

    // Spawnar monstro de exemplo
    setTimeout(() => {
        const scene = document.getElementById('ar-scene');
        const spawner = scene?.systems['monster-spawner'];
        if (spawner) {
            spawner.spawnMonster();
            spawner.spawnLoot();
        }
    }, 1000);

    // Mostrar dica
    showHitFeedback(false, 0, false, false, '');
    const feedback = document.getElementById('ar-hit-feedback');
    if (feedback) {
        feedback.textContent = 'Modo Demo Ativo';
        feedback.className = 'ar-hit-feedback demo-mode';
        setTimeout(() => {
            feedback.className = 'ar-hit-feedback';
        }, 2000);
    }
}

async function startARMode() {
    const scene = document.getElementById('ar-scene');
    if (!scene) {
        showARErrorModal('Erro de Inicialização', 'Cena AR não encontrada. Tente recarregar a página.');
        return;
    }

    // Verificar se está em HTTPS (necessário para WebXR)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        showARErrorModal(
            'Conexão Insegura',
            'WebXR requer conexão HTTPS. Acesse o jogo via HTTPS para usar AR.',
            true
        );
        return;
    }

    // Verificar suporte WebXR
    if (!navigator.xr) {
        showARErrorModal(
            'WebXR Não Suportado',
            'Seu navegador não suporta WebXR. Use Chrome, Edge ou Samsung Internet em um dispositivo compatível.',
            true
        );
        return;
    }

    try {
        // Verificar suporte a AR imersivo
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!supported) {
            // Tentar inlineAR como fallback
            const inlineSupported = await navigator.xr.isSessionSupported('inline').catch(() => false);

            showARErrorModal(
                'AR Não Disponível',
                'Seu dispositivo não suporta AR imersivo. Instale o Google Play Services for AR (ARCore) ou use um dispositivo compatível.',
                true
            );
            return;
        }

        // Tudo OK, entrar em AR
        if (scene.enterAR) {
            await scene.enterAR();
        }

        updateARHUD();
        initARGeolocation();
        arErrorShown = false;

        console.log('✅ Modo AR iniciado com sucesso!');

    } catch (e) {
        console.error('❌ Erro ao iniciar AR:', e);

        let errorMessage = 'Ocorreu um erro ao iniciar o AR.';

        if (e.name === 'NotAllowedError') {
            errorMessage = 'Permissão de câmera negada. Permita o acesso à câmera para usar AR.';
        } else if (e.name === 'NotSupportedError') {
            errorMessage = 'Seu dispositivo não suporta os recursos AR necessários.';
        } else if (e.message) {
            errorMessage = e.message;
        }

        showARErrorModal('Erro ao Iniciar AR', errorMessage, true);
    }
}

function exitAR() {
    const scene = document.getElementById('ar-scene');
    if (scene && scene.xrSession) {
        scene.xrSession.end();
    }
    goto('home');
}

function updateARHUD() {
    // Atualizar HP do jogador
    const hpFill = document.getElementById('ar-player-hp-fill');
    if (hpFill) {
        hpFill.style.width = `${(GameData.player.hp / GameData.player.maxHp) * 100}%`;
    }

    // Os slots agora usam imagens PNG fixas (inventario-armas.png, etc.)
    // Não precisamos atualizar os ícones dos slots

    // Atualizar imagem da arma equipada (estilo FPS)
    updateWeaponImage();
}

// Atualizar imagem da arma no HUD
function updateWeaponImage() {
    const weaponImageContainer = document.getElementById('ar-weapon-image');
    const weaponImg = document.getElementById('ar-weapon-img');

    if (!weaponImageContainer || !weaponImg) return;

    const equippedWeapon = GameData.equipped.weapon;

    if (equippedWeapon && equippedWeapon.image) {
        // Mostrar imagem da arma
        weaponImg.src = equippedWeapon.image;
        weaponImg.alt = equippedWeapon.name;
        weaponImageContainer.style.display = 'flex';
        console.log(`🔫 Exibindo arma: ${equippedWeapon.name}`);
    } else {
        // Esconder imagem da arma
        weaponImageContainer.style.display = 'none';
        weaponImg.src = '';
        weaponImg.alt = '';
    }
}

// ============================================
// A-FRAME COMPONENTS
// ============================================

AFRAME.registerComponent('ar-monster', {
    schema: {
        type: { type: 'string', default: 'werewolf' },
        hp: { type: 'number', default: 100 },
        maxHp: { type: 'number', default: 100 }
    },

    // Estados possíveis: normal, trapped, burning, vulnerable, dying, dead
    monsterState: 'normal',
    comboTimer: null,
    burnTimer: null,

    init: function () {
        const modelMap = {
            werewolf: '#werewolf-model',
            vampire: '#vampire-model',
            ghost: '#ghost-model',
            demon: '#demon-model'
        };

        // Mapa de escalas para cada monstro
        const scaleMap = {
            werewolf: '2 2 2',
            vampire: '1 1 1',
            ghost: '2 2 2',
            demon: '2 2 2'
        };

        this.el.setAttribute('gltf-model', modelMap[this.data.type] || '#werewolf-model');
        this.el.setAttribute('scale', scaleMap[this.data.type] || '1 1 1');

        // Inicializar estado
        this.monsterState = 'normal';
        this.comboTimer = null;
        this.burnTimer = null;

        // Fantasmas começam invisíveis - precisam da Filmadora para serem vistos
        if (this.data.type === 'ghost') {
            const hasCamera = GameData.equipped.accessory?.id === 'camera';
            this.el.setAttribute('visible', hasCamera);
            if (!hasCamera) {
                this.el.classList.add('ghost-hidden');
            }

            // Configurar movimento circular e levitação para o fantasma
            this.ghostOrbitAngle = Math.random() * Math.PI * 2;
            this.ghostOrbitSpeed = 0.3 + Math.random() * 0.2;
            this.ghostHoverOffset = 0;
            this.ghostOrbitRadius = 2 + Math.random();

            const pos = this.el.getAttribute('position');
            this.ghostBaseY = pos.y + 0.5;
            this.el.setAttribute('position', { x: pos.x, y: this.ghostBaseY, z: pos.z });

            console.log(`👻 Fantasma spawnado - Visível: ${hasCamera}`);
        }

        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.registerMonster(this.el);
        }
    },

    tick: function (time, deltaTime) {
        // Movimento circular e levitação apenas para fantasmas
        if (this.data.type === 'ghost') {
            if (!deltaTime) return;

            const dt = deltaTime / 1000;
            const camera = document.getElementById('camera');
            if (!camera) return;

            // Se está preso, não se move
            if (this.monsterState === 'trapped') return;

            const cameraPos = camera.getAttribute('position');

            this.ghostOrbitAngle += this.ghostOrbitSpeed * dt;
            const newX = cameraPos.x + Math.cos(this.ghostOrbitAngle) * this.ghostOrbitRadius;
            const newZ = cameraPos.z + Math.sin(this.ghostOrbitAngle) * this.ghostOrbitRadius;

            this.ghostHoverOffset += dt * 2;
            const hoverY = this.ghostBaseY + Math.sin(this.ghostHoverOffset) * 0.3;

            this.el.setAttribute('position', { x: newX, y: hoverY, z: newZ });

            const angleToPlayer = Math.atan2(cameraPos.x - newX, cameraPos.z - newZ) * (180 / Math.PI);
            this.el.setAttribute('rotation', { x: 0, y: angleToPlayer, z: 0 });
        }

        // Animação de tremida para monstros presos
        if (this.monsterState === 'trapped') {
            const shake = Math.sin(time * 0.02) * 0.05;
            const currentPos = this.el.getAttribute('position');
            this.el.setAttribute('position', { x: currentPos.x + shake, y: currentPos.y, z: currentPos.z });
        }

        // Animação de queimando
        if (this.monsterState === 'burning') {
            const flicker = 0.8 + Math.random() * 0.4;
            this.el.setAttribute('material', 'emissive', `#ff${Math.floor(flicker * 50).toString(16)}00`);
        }
    },

    // Processar ataque e combos
    takeDamage: function (amount, weaponId) {
        const weapon = GameData.inventory.weapons.find(w => w.id === weaponId);
        let actualDamage = amount;
        let isWeakness = false;
        let isImmune = false;
        let immuneReason = '';
        let comboTriggered = false;
        let comboMessage = '';
        let stateChanged = false;
        let newState = '';

        // Verificar mecânicas especiais baseadas no tipo de monstro e arma
        const comboResult = this.checkComboMechanics(weapon);

        if (comboResult.requiresCombo) {
            // Este monstro requer mecânica de combo
            if (comboResult.comboStep === 1) {
                // Primeiro passo do combo
                this.setState(comboResult.nextState);
                stateChanged = true;
                newState = comboResult.nextState;
                comboMessage = comboResult.message;
                actualDamage = 0;

                // Timer para resetar o estado se não completar o combo
                if (comboResult.comboTimeout) {
                    this.comboTimer = setTimeout(() => {
                        if (this.monsterState === comboResult.nextState) {
                            this.setState('normal');
                            showComboFeedback('⏱️ Combo expirou!', 'expired');
                        }
                    }, comboResult.comboTimeout);
                }
            } else if (comboResult.comboStep === 2) {
                // Segundo passo do combo - verificar se está no estado correto
                if (this.monsterState === comboResult.requiredState) {
                    // Combo completo!
                    comboTriggered = true;
                    comboMessage = comboResult.message;
                    actualDamage = comboResult.comboDamage || amount * 3;
                    isWeakness = true;

                    // Limpar timer
                    if (this.comboTimer) {
                        clearTimeout(this.comboTimer);
                        this.comboTimer = null;
                    }

                    // Efeito especial para Wendigo (queimando)
                    if (this.data.type === 'wendigo') {
                        this.setState('burning');
                        stateChanged = true;
                        newState = 'burning';
                        this.startBurning();
                    }
                } else {
                    // Não está no estado certo para o combo
                    isImmune = true;
                    immuneReason = comboResult.wrongStateMessage || 'Complete o primeiro passo do combo!';
                    actualDamage = 0;
                }
            } else if (comboResult.blocked) {
                // Ataque bloqueado (bruxa com sacos, etc)
                isImmune = true;
                immuneReason = comboResult.message;
                actualDamage = 0;
            }
        } else {
            // Sistema de fraquezas normal
            if (weapon && weapon.weakness && weapon.weakness.length > 0) {
                if (weapon.weakness.includes(this.data.type)) {
                    actualDamage = amount * 2;
                    isWeakness = true;
                } else {
                    actualDamage = 0;
                    isImmune = true;
                    immuneReason = this.getImmunityMessage(this.data.type, weapon);
                }
            } else if (weapon && (!weapon.weakness || weapon.weakness.length === 0)) {
                actualDamage = Math.floor(amount * 0.5);
            }
        }

        // Aplicar dano apenas se não for imune
        if (!isImmune && actualDamage > 0) {
            this.data.hp -= actualDamage;
            updateMonsterHP(this.data.hp, this.data.maxHp, this.data.type);

            // Efeito de hit no monstro
            this.playHitEffect(isWeakness);

            if (this.data.hp <= 0) {
                this.die();
            }
        }

        // Nome do monstro para feedback
        const monsterNames = {
            werewolf: 'Lobisomem',
            vampire: 'Vampiro',
            ghost: 'Fantasma',
            demon: 'Demônio',
            wendigo: 'Wendigo',
            hellhound: 'Cão do Inferno',
            witch: 'Bruxa',
            crossroads_demon: 'Demônio da Encruzilhada'
        };

        return {
            damage: actualDamage,
            isWeakness,
            isImmune,
            immuneReason,
            comboTriggered,
            comboMessage,
            stateChanged,
            newState,
            monsterName: monsterNames[this.data.type] || this.data.type,
            remainingHp: this.data.hp
        };
    },

    // Verificar mecânicas de combo específicas
    checkComboMechanics: function (weapon) {
        if (!weapon) return { requiresCombo: false };

        const type = this.data.type;
        const weaponId = weapon.id;

        // DEMÔNIO: Armadilha → Bíblia
        if (type === 'demon' || type === 'crossroads_demon') {
            if (weaponId === 'devil_trap') {
                return {
                    requiresCombo: true,
                    comboStep: 1,
                    nextState: 'trapped',
                    message: '⛧ Demônio preso na armadilha!',
                    comboTimeout: 15000 // 15 segundos para completar
                };
            }
            if (weaponId === 'bible') {
                return {
                    requiresCombo: true,
                    comboStep: 2,
                    requiredState: 'trapped',
                    message: '📖 EXORCISMO COMPLETO!',
                    comboDamage: 500, // Mata instantaneamente
                    wrongStateMessage: 'Prenda o demônio primeiro com a Armadilha!'
                };
            }
        }

        // WENDIGO: Molotov → Isqueiro
        if (type === 'wendigo') {
            if (weaponId === 'molotov') {
                return {
                    requiresCombo: true,
                    comboStep: 1,
                    nextState: 'vulnerable',
                    message: '🧴 Wendigo coberto de líquido inflamável!',
                    comboTimeout: 10000 // 10 segundos
                };
            }
            if (weaponId === 'lighter') {
                return {
                    requiresCombo: true,
                    comboStep: 2,
                    requiredState: 'vulnerable',
                    message: '🔥 WENDIGO EM CHAMAS!',
                    comboDamage: 300,
                    wrongStateMessage: 'Jogue o Molotov primeiro!'
                };
            }
        }

        // VAMPIRO: Faca com sangue → Estaca
        if (type === 'vampire') {
            if (weaponId === 'blood_knife' && this.data.hp <= 30) {
                return {
                    requiresCombo: true,
                    comboStep: 1,
                    nextState: 'vulnerable',
                    message: '🩸 Vampiro enfraquecido! Use a estaca!',
                    comboTimeout: 8000
                };
            }
            if (weaponId === 'wooden_stake') {
                if (this.monsterState === 'vulnerable') {
                    return {
                        requiresCombo: true,
                        comboStep: 2,
                        requiredState: 'vulnerable',
                        message: '🪵 ESTACA NO CORAÇÃO!',
                        comboDamage: 500,
                        wrongStateMessage: 'Enfraqueça o vampiro primeiro!'
                    };
                }
            }
        }

        return { requiresCombo: false };
    },

    // Mudar estado do monstro
    setState: function (newState) {
        const oldState = this.monsterState;
        this.monsterState = newState;

        console.log(`🔄 ${this.data.type}: ${oldState} → ${newState}`);

        // Aplicar efeitos visuais do estado
        this.applyStateVisuals(newState);
    },

    // Aplicar efeitos visuais baseados no estado
    applyStateVisuals: function (state) {
        // Remover efeitos anteriores
        this.el.removeAttribute('animation__trapped');
        this.el.removeAttribute('animation__burning');

        switch (state) {
            case 'trapped':
                // Efeito de tremida e brilho vermelho
                this.el.setAttribute('animation__trapped', {
                    property: 'rotation',
                    from: '0 0 -5',
                    to: '0 0 5',
                    dur: 100,
                    loop: true,
                    dir: 'alternate',
                    easing: 'easeInOutSine'
                });
                // Mostrar indicador visual
                showStateIndicator('⛧ PRESO', 'trapped');
                break;

            case 'vulnerable':
                // Efeito de piscando
                this.el.setAttribute('animation__vulnerable', {
                    property: 'visible',
                    from: true,
                    to: false,
                    dur: 200,
                    loop: true,
                    dir: 'alternate'
                });
                showStateIndicator('💀 VULNERÁVEL', 'vulnerable');
                break;

            case 'burning':
                // Efeito de escala pulsando (como se estivesse queimando)
                this.el.setAttribute('animation__burning', {
                    property: 'scale',
                    from: '2 2 2',
                    to: '2.2 2.2 2.2',
                    dur: 150,
                    loop: true,
                    dir: 'alternate',
                    easing: 'easeInOutSine'
                });
                showStateIndicator('🔥 QUEIMANDO', 'burning');
                break;

            case 'normal':
                hideStateIndicator();
                break;
        }
    },

    // Efeito de queimando contínuo (para Wendigo)
    startBurning: function () {
        let burnTicks = 0;
        const burnDamage = 20;

        this.burnTimer = setInterval(() => {
            burnTicks++;
            this.data.hp -= burnDamage;
            updateMonsterHP(this.data.hp, this.data.maxHp, this.data.type);

            // Feedback de dano de fogo
            showHitFeedback(true, burnDamage, false, false, '', true);

            if (this.data.hp <= 0 || burnTicks >= 5) {
                clearInterval(this.burnTimer);
                this.burnTimer = null;
                if (this.data.hp <= 0) {
                    this.die();
                }
            }
        }, 500);
    },

    // Efeito visual de hit no monstro
    playHitEffect: function (isWeakness) {
        // Flash branco/vermelho no monstro
        const originalColor = this.el.getAttribute('material')?.color || '#ffffff';
        this.el.setAttribute('material', 'emissive', isWeakness ? '#ffff00' : '#ff0000');

        // Pequeno knockback
        const pos = this.el.getAttribute('position');
        this.el.setAttribute('animation__hit', {
            property: 'position',
            from: `${pos.x} ${pos.y} ${pos.z}`,
            to: `${pos.x} ${pos.y + 0.2} ${pos.z}`,
            dur: 100,
            dir: 'alternate',
            easing: 'easeOutQuad'
        });

        setTimeout(() => {
            this.el.setAttribute('material', 'emissive', '#000000');
            this.el.removeAttribute('animation__hit');
        }, 200);
    },

    getImmunityMessage: function (monsterType, weapon) {
        const messages = {
            werewolf: `Lobisomens só recebem dano de prata!`,
            vampire: `Vampiros precisam de sangue de morto ou estaca!`,
            ghost: `Fantasmas são imunes! Use ferro ou sal!`,
            demon: `Demônios resistem a isso! Use a Armadilha + Bíblia!`,
            wendigo: `Wendigos só morrem com fogo! Use Molotov + Isqueiro!`,
            hellhound: `Cães do Inferno só temem a Lâmina de Anjo!`,
            witch: `Destrua os sacos de maldição primeiro!`,
            crossroads_demon: `Use a Armadilha do Diabo!`
        };
        return messages[monsterType] || `Este monstro é imune a ${weapon.name}!`;
    },

    die: function () {
        this.monsterState = 'dead';

        // Limpar timers
        if (this.comboTimer) clearTimeout(this.comboTimer);
        if (this.burnTimer) clearInterval(this.burnTimer);

        this.el.setAttribute('animation__death', {
            property: 'scale',
            to: '0 0 0',
            dur: 500,
            easing: 'easeInQuad'
        });

        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.unregisterMonster(this.el);
        }

        // Atualizar estatísticas
        GameData.player.monstersDefeated++;

        // Marcar como derrotado no bestiário
        const monster = GameData.bestiary.find(m => m.id === this.data.type);
        const monsterName = monster?.name || this.data.type;
        if (monster) {
            monster.status = 'defeated';
            monster.encounterCount++;
        }

        // Adicionar ao diário com nome correto
        addDiaryEntry(`Derrotou um ${monsterName}`);

        // Salvar progresso
        saveGame();

        // Esconder indicador de estado
        hideStateIndicator();

        setTimeout(() => {
            this.el.parentNode.removeChild(this.el);
            hideMonsterHP();
        }, 600);
    }
});

AFRAME.registerSystem('combat', {
    init: function () {
        this.raycaster = new THREE.Raycaster();
        this.monsters = [];
        this.loot = [];
    },

    registerMonster: function (el) {
        if (!this.monsters.includes(el)) {
            this.monsters.push(el);
        }
    },

    unregisterMonster: function (el) {
        const idx = this.monsters.indexOf(el);
        if (idx !== -1) {
            this.monsters.splice(idx, 1);
        }
    },

    registerLoot: function (el) {
        if (!this.loot.includes(el)) {
            this.loot.push(el);
        }
    },

    unregisterLoot: function (el) {
        const idx = this.loot.indexOf(el);
        if (idx !== -1) {
            this.loot.splice(idx, 1);
        }
    },

    fire: function () {
        const camera = this.el.sceneEl.camera;
        const weapon = GameData.equipped.weapon;

        const cameraPosition = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();

        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);

        this.raycaster.set(cameraPosition, cameraDirection);

        // Se não tem arma equipada, só tenta coletar loot
        if (!weapon) {
            return this.tryCollectLoot();
        }

        // Verificar se a arma pode coletar (mão)
        const canCollect = weapon.canCollect === true;

        // Com arma, tenta atacar monstros primeiro
        const meshes = [];
        this.monsters.forEach(monster => {
            // Ignorar fantasmas invisíveis (precisam da filmadora)
            if (monster.classList.contains('ghost-hidden')) {
                return;
            }
            const mesh = monster.getObject3D('mesh');
            if (mesh) meshes.push(mesh);
        });

        // Se tem monstros, tenta atacar
        if (meshes.length > 0) {
            const intersects = this.raycaster.intersectObjects(meshes, true);

            if (intersects.length > 0) {
                const hitObject = intersects[0];
                const monsterEl = this.findMonsterFromMesh(hitObject.object);

                if (monsterEl) {
                    const monsterComponent = monsterEl.components['ar-monster'];
                    const result = monsterComponent.takeDamage(weapon.damage, weapon.id);

                    if (navigator.vibrate) {
                        navigator.vibrate(result.isWeakness ? [100, 50, 100] : [50, 30, 50]);
                    }

                    return {
                        hit: true,
                        monster: monsterComponent.data.type,
                        damage: result.damage,
                        isWeakness: result.isWeakness,
                        remainingHp: result.remainingHp
                    };
                }
            }
        }

        // Se a arma pode coletar (mão), tenta coletar loot
        if (canCollect) {
            return this.tryCollectLoot();
        }

        return { hit: false, reason: 'missed' };
    },

    tryCollectLoot: function () {
        if (this.loot.length === 0) {
            return { hit: false, reason: 'no_loot' };
        }

        const camera = this.el.sceneEl.camera;
        const cameraPosition = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();

        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);

        this.raycaster.set(cameraPosition, cameraDirection);

        const meshes = [];
        this.loot.forEach(lootEl => {
            const mesh = lootEl.getObject3D('mesh');
            if (mesh) meshes.push(mesh);
        });

        if (meshes.length === 0) {
            return { hit: false, reason: 'no_loot' };
        }

        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const hitObject = intersects[0];
            const lootEl = this.findLootFromMesh(hitObject.object);

            if (lootEl) {
                const lootComponent = lootEl.components['ar-loot'];
                lootComponent.collect();

                return {
                    hit: true,
                    collected: true,
                    item: lootComponent.data.name
                };
            }
        }

        return { hit: false, reason: 'missed' };
    },

    findMonsterFromMesh: function (mesh) {
        let current = mesh;
        while (current) {
            if (current.el && current.el.hasAttribute('ar-monster')) {
                return current.el;
            }
            current = current.parent;
        }
        return null;
    },

    findLootFromMesh: function (mesh) {
        let current = mesh;
        while (current) {
            if (current.el && current.el.hasAttribute('ar-loot')) {
                return current.el;
            }
            current = current.parent;
        }
        return null;
    }
});

AFRAME.registerSystem('monster-spawner', {
    init: function () {
        this.reticle = null;
        this.lastHitPose = null;
        this.autoSpawnEnabled = true;
        this.spawnInterval = null;
        this.lootSpawnInterval = null;
        this.maxMonsters = 3;
        this.maxLoot = 5;

        this.el.sceneEl.addEventListener('loaded', () => {
            this.reticle = document.getElementById('reticle');
        });

        this.el.sceneEl.addEventListener('ar-hit-test-achieved', () => {
            if (this.reticle) {
                this.reticle.setAttribute('visible', true);
                this.lastHitPose = {
                    position: this.reticle.getAttribute('position')
                };
            }
        });

        // Iniciar auto-spawn quando entra em AR
        this.el.sceneEl.addEventListener('enter-vr', () => {
            if (this.el.sceneEl.is('ar-mode')) {
                this.startAutoSpawn();
            }
        });

        this.el.sceneEl.addEventListener('exit-vr', () => {
            this.stopAutoSpawn();
        });
    },

    startAutoSpawn: function () {
        if (this.spawnInterval) return;

        // Spawn inicial
        setTimeout(() => {
            this.spawnMonster();
            this.spawnLoot();
            // Atualizar marcadores do minimapa após spawn inicial
            if (typeof updateMinimapMarkers === 'function') updateMinimapMarkers();
        }, 2000);

        // Atualizar minimapa periodicamente (a cada 2 segundos)
        this.minimapInterval = setInterval(() => {
            if (typeof updateMinimapMarkers === 'function') updateMinimapMarkers();
        }, 2000);

        // Spawn de monstros a cada 30 segundos
        this.spawnInterval = setInterval(() => {
            const monsters = document.querySelectorAll('[ar-monster]');
            if (monsters.length < this.maxMonsters) {
                this.spawnMonster();
            }
        }, 30000);

        // Spawn de loot a cada 20 segundos
        this.lootSpawnInterval = setInterval(() => {
            const loot = document.querySelectorAll('[ar-loot]');
            if (loot.length < this.maxLoot) {
                this.spawnLoot();
            }
        }, 20000);

        console.log('🎮 Auto-spawn ativado');
    },

    stopAutoSpawn: function () {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        if (this.lootSpawnInterval) {
            clearInterval(this.lootSpawnInterval);
            this.lootSpawnInterval = null;
        }
        if (this.minimapInterval) {
            clearInterval(this.minimapInterval);
            this.minimapInterval = null;
        }
    },

    spawnMonster: function (type = null) {
        const position = this.getSpawnPosition();

        const types = ['werewolf', 'vampire', 'ghost', 'demon'];
        const monsterType = type || types[Math.floor(Math.random() * types.length)];

        const hpMap = { werewolf: 100, vampire: 80, ghost: 60, demon: 120 };

        const monster = document.createElement('a-entity');
        monster.setAttribute('ar-monster', {
            type: monsterType,
            hp: hpMap[monsterType],
            maxHp: hpMap[monsterType]
        });
        monster.setAttribute('position', position);

        document.getElementById('monsters-container').appendChild(monster);
        showMonsterHP(monsterType, hpMap[monsterType], hpMap[monsterType]);

        console.log(`🐺 Monstro ${monsterType} spawnou automaticamente!`);

        return monster;
    },

    spawnLoot: function () {
        const position = this.getSpawnPosition();

        // Tipos de loot possíveis - apenas itens com modelos 3D
        const allLootTypes = [
            { id: 'holy_water', icon: '', name: 'Água Benta', category: 'weapons', damage: 10, model: 'holy-water-model', scale: '0.6 0.6 0.6' },
            { id: 'salt', icon: '', name: 'Sal', category: 'weapons', damage: 25, model: 'salt-model', scale: '1.2 1.2 1.2' },
            { id: 'knife', icon: '', name: 'Faca', category: 'weapons', damage: 15, model: 'knife-model', scale: '0.6 0.6 0.6' },
            { id: 'shotgun', icon: '', name: 'Espingarda', category: 'weapons', damage: 20, model: 'shotgun-model', scale: '0.5 0.5 0.5' },
            { id: 'crowbar', icon: '', name: 'Barra de Ferro', category: 'weapons', damage: 30, model: 'crowbar-model', scale: '0.5 0.5 0.5' },
            { id: 'colt', icon: '', name: 'Colt', category: 'weapons', damage: 50, model: 'colt-model', scale: '0.3 0.3 0.3' },
            { id: 'devil_trap', icon: '', name: 'Selo da Armadilha', category: 'weapons', damage: 0, model: 'selo-model', scale: '0.5 0.5 0.5' },
            { id: 'bible', icon: '', name: 'Bíblia', category: 'weapons', damage: 100, model: 'bible-model', scale: '0.1 0.1 0.1' },
            { id: 'angel_blade', icon: '', name: 'Lâmina de Anjo', category: 'weapons', damage: 80, model: 'knife-angel-model', scale: '0.4 0.4 0.4' },
            { id: 'blood_knife', icon: '', name: 'Faca com Sangue', category: 'weapons', damage: 40, model: 'knife-blood-model', scale: '0.5 0.5 0.5' },
            { id: 'wooden_stake', icon: '', name: 'Estaca de Madeira', category: 'weapons', damage: 100, model: 'estaca-model', scale: '0.6 0.6 0.6' },
            { id: 'molotov', icon: '', name: 'Coquetel Molotov', category: 'weapons', damage: 60, model: 'molotov-model', scale: '0.4 0.4 0.4' },
            { id: 'lighter', icon: '', name: 'Isqueiro', category: 'weapons', damage: 0, model: 'isqueiro-model', scale: '0.5 0.5 0.5' }
        ];

        // Filtrar itens que o jogador já coletou (quantity > 0)
        const availableLoot = allLootTypes.filter(loot => {
            const inventoryItem = GameData.inventory.weapons.find(w => w.id === loot.id);
            return !inventoryItem || inventoryItem.quantity === 0;
        });

        // Classificar raridade dos itens
        const rarityMap = {
            'holy_water': 'common',
            'salt': 'common',
            'knife': 'common',
            'shotgun': 'uncommon',
            'crowbar': 'uncommon',
            'colt': 'rare',
            'devil_trap': 'rare',
            'bible': 'epic',
            'angel_blade': 'epic',
            'blood_knife': 'rare',
            'wooden_stake': 'uncommon',
            'molotov': 'uncommon',
            'lighter': 'common'
        };

        // Se não há loot disponível, não spawna nada
        if (availableLoot.length === 0) {
            console.log('📦 Todos os itens já foram coletados!');
            return null;
        }

        // Sistema de peso por raridade (itens mais raros têm menor chance)
        const weightedLoot = availableLoot.map(loot => {
            const rarity = rarityMap[loot.id] || 'common';
            let weight = 1;
            switch (rarity) {
                case 'common': weight = 4; break;
                case 'uncommon': weight = 3; break;
                case 'rare': weight = 2; break;
                case 'epic': weight = 1; break;
            }
            return { ...loot, rarity, weight };
        });

        // Selecionar baseado no peso
        const totalWeight = weightedLoot.reduce((sum, l) => sum + l.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedLoot = weightedLoot[0];

        for (const loot of weightedLoot) {
            random -= loot.weight;
            if (random <= 0) {
                selectedLoot = loot;
                break;
            }
        }

        const entity = document.createElement('a-entity');
        entity.setAttribute('ar-loot', { ...selectedLoot, rarity: selectedLoot.rarity });
        entity.setAttribute('position', position);

        document.getElementById('monsters-container').appendChild(entity);

        // Log com indicação de raridade
        const rarityIcons = { common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣' };
        console.log(`✨ Loot ${rarityIcons[selectedLoot.rarity]} ${selectedLoot.name} (${selectedLoot.rarity}) spawnou!`);

        return entity;
    },

    getSpawnPosition: function () {
        if (this.lastHitPose && this.reticle && this.reticle.getAttribute('visible')) {
            const reticlePos = this.reticle.getAttribute('position');
            return { x: reticlePos.x, y: reticlePos.y, z: reticlePos.z };
        } else {
            const camera = document.getElementById('camera');
            const cameraPos = camera.getAttribute('position');
            const cameraRot = camera.getAttribute('rotation');

            // Spawn em posição aleatória ao redor do jogador
            const angle = THREE.MathUtils.degToRad(cameraRot.y + (Math.random() - 0.5) * 120);
            const distance = 1.5 + Math.random() * 1.5;

            return {
                x: cameraPos.x - Math.sin(angle) * distance,
                y: 0,
                z: cameraPos.z - Math.cos(angle) * distance
            };
        }
    }
});

// ============================================
// COMPONENTE DE LOOT COLETÁVEL
// ============================================

AFRAME.registerComponent('ar-loot', {
    schema: {
        id: { type: 'string', default: 'holy_water' },
        icon: { type: 'string', default: '💧' },
        name: { type: 'string', default: 'Item' },
        category: { type: 'string', default: 'weapons' },
        healAmount: { type: 'number', default: 0 },
        damage: { type: 'number', default: 0 },
        model: { type: 'string', default: 'holy-water-model' },
        scale: { type: 'string', default: '0.6 0.6 0.6' },
        rarity: { type: 'string', default: 'common' }
    },

    init: function () {
        // Carregar modelo 3D do loot
        this.el.setAttribute('gltf-model', `#${this.data.model}`);

        // Escala personalizada para cada item
        this.el.setAttribute('scale', this.data.scale);

        // Animação de flutuação
        const pos = this.el.getAttribute('position');
        this.el.setAttribute('animation', {
            property: 'position',
            dir: 'alternate',
            loop: true,
            dur: 1500,
            easing: 'easeInOutSine',
            from: `${pos.x} ${pos.y} ${pos.z}`,
            to: `${pos.x} ${pos.y + 0.15} ${pos.z}`
        });

        // Animação de rotação
        this.el.setAttribute('animation__rotate', {
            property: 'rotation',
            to: '0 360 0',
            loop: true,
            dur: 4000,
            easing: 'linear'
        });

        // Cores por raridade
        const rarityColors = {
            'common': '#ffffff',
            'uncommon': '#44ff44',
            'rare': '#4488ff',
            'epic': '#aa44ff'
        };

        const lightColor = this.data.category === 'healing'
            ? '#44ff44'
            : (rarityColors[this.data.rarity] || '#4ecdc4');

        // Adicionar efeito de brilho (luz pontual) baseado na raridade
        const light = document.createElement('a-light');
        light.setAttribute('type', 'point');
        light.setAttribute('color', lightColor);
        light.setAttribute('intensity', this.data.rarity === 'epic' ? '1.5' : (this.data.rarity === 'rare' ? '1.2' : '0.8'));
        light.setAttribute('distance', this.data.rarity === 'epic' ? '2' : '1');
        this.el.appendChild(light);

        // Registrar no sistema de combate para detecção
        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.registerLoot(this.el);
        }
    },

    collect: function () {
        // Adicionar ao inventário
        const category = this.data.category;
        let added = false;

        if (category === 'healing') {
            const item = GameData.inventory.healing.find(i => i.id === this.data.id);
            if (item) {
                item.quantity++;
                added = true;
                console.log(`✅ Adicionado ao inventário healing: ${item.name} (qty: ${item.quantity})`);
            }
        } else if (category === 'weapons') {
            const item = GameData.inventory.weapons.find(i => i.id === this.data.id);
            if (item) {
                item.quantity++;
                added = true;
                console.log(`✅ Adicionado ao inventário weapons: ${item.name} (qty: ${item.quantity})`);
            } else {
                console.log(`❌ Item não encontrado no inventário weapons: ${this.data.id}`);
            }
        } else if (category === 'accessories') {
            const item = GameData.inventory.accessories.find(i => i.id === this.data.id);
            if (item) {
                item.quantity++;
                added = true;
                console.log(`✅ Adicionado ao inventário accessories: ${item.name} (qty: ${item.quantity})`);
            } else {
                console.log(`❌ Item não encontrado no inventário accessories: ${this.data.id}`);
            }
        }

        if (added) {
            GameData.player.itemsCollected++;

            // Cores por raridade
            const rarityColors = {
                'common': '#cccccc',
                'uncommon': '#44ff44',
                'rare': '#4488ff',
                'epic': '#aa44ff'
            };
            const rarityLabels = {
                'common': '',
                'uncommon': '🟢 ',
                'rare': '🔵 RARO! ',
                'epic': '🟣 ÉPICO! '
            };

            // Feedback visual - mostrar nome do item com raridade
            const feedback = document.getElementById('ar-hit-feedback');
            if (feedback) {
                const rarityLabel = rarityLabels[this.data.rarity] || '';
                feedback.textContent = `${rarityLabel}+1 ${this.data.name}`;
                feedback.style.color = rarityColors[this.data.rarity] || '#ffcc00';

                // Classe especial para itens raros/épicos
                if (this.data.rarity === 'epic') {
                    feedback.className = 'ar-hit-feedback loot-epic';
                } else if (this.data.rarity === 'rare') {
                    feedback.className = 'ar-hit-feedback loot-rare';
                } else {
                    feedback.className = 'ar-hit-feedback hit';
                }

                const duration = this.data.rarity === 'epic' ? 1500 : (this.data.rarity === 'rare' ? 1000 : 500);
                setTimeout(() => {
                    feedback.className = 'ar-hit-feedback';
                    feedback.style.color = '';
                }, duration);
            }

            // Vibração mais intensa para itens raros
            if (navigator.vibrate) {
                if (this.data.rarity === 'epic') {
                    navigator.vibrate([50, 30, 50, 30, 100, 50, 100]);
                } else if (this.data.rarity === 'rare') {
                    navigator.vibrate([50, 30, 80, 30, 50]);
                } else {
                    navigator.vibrate([30, 20, 30]);
                }
            }

            // Adicionar ao diário
            addDiaryEntry(`Coletou ${this.data.name} (${this.data.rarity || 'comum'})`);

            console.log(`✨ Coletou: ${this.data.name} [${this.data.rarity}]`);

            // Salvar progresso
            saveGame();
        }

        // Remover do mundo
        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.unregisterLoot(this.el);
        }

        this.el.parentNode.removeChild(this.el);
    },

    remove: function () {
        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.unregisterLoot(this.el);
        }
    }
});

// ============================================
// UI HELPERS
// ============================================

function showMonsterHP(name, hp, maxHp) {
    const container = document.getElementById('ar-monster-hp');
    const nameEl = document.getElementById('ar-monster-name');
    const fillEl = document.getElementById('ar-monster-hp-fill');

    const names = {
        werewolf: '🐺 Lobisomem',
        vampire: '🧛 Vampiro',
        ghost: '👻 Fantasma',
        demon: '😈 Demônio',
        wendigo: '🦴 Wendigo',
        hellhound: '🐕‍🦺 Cão do Inferno',
        witch: '🧙‍♀️ Bruxa',
        crossroads_demon: '🔴 Demônio da Encruzilhada'
    };

    nameEl.textContent = names[name] || name;
    fillEl.style.width = `${(hp / maxHp) * 100}%`;
    container.classList.add('visible');
}

function updateMonsterHP(hp, maxHp) {
    const fillEl = document.getElementById('ar-monster-hp-fill');
    fillEl.style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
}

function hideMonsterHP() {
    document.getElementById('ar-monster-hp')?.classList.remove('visible');
}

function showHitFeedback(hit, damage = 0, isWeakness = false, isImmune = false, immuneReason = '') {
    const feedback = document.getElementById('ar-hit-feedback');
    if (!feedback) return;

    // Limpar classes anteriores
    feedback.className = 'ar-hit-feedback';

    if (isImmune) {
        // Monstro é imune - mostrar mensagem de aviso
        feedback.textContent = immuneReason || 'IMUNE!';
        feedback.className = 'ar-hit-feedback immune';

        // Vibrar para indicar erro
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }

        // Manter a mensagem visível por mais tempo para leitura
        setTimeout(() => {
            feedback.className = 'ar-hit-feedback';
        }, 2000);
    } else if (hit) {
        if (isWeakness) {
            // Dano crítico - fraqueza!
            feedback.textContent = `⚡ CRÍTICO! -${damage}`;
            feedback.className = 'ar-hit-feedback critical';

            // Vibrar forte para indicar sucesso
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        } else if (damage > 0) {
            // Dano normal
            feedback.textContent = `-${damage}`;
            feedback.className = 'ar-hit-feedback hit';
        } else {
            // Hit mas sem dano (dano 0)
            feedback.textContent = '0';
            feedback.className = 'ar-hit-feedback miss';
        }

        setTimeout(() => {
            feedback.className = 'ar-hit-feedback';
        }, 500);
    } else {
        // Miss - não acertou nada
        feedback.textContent = 'MISS';
        feedback.className = 'ar-hit-feedback miss';

        setTimeout(() => {
            feedback.className = 'ar-hit-feedback';
        }, 300);
    }
}

// Feedback de combo
function showComboFeedback(message, type = 'success') {
    const feedback = document.getElementById('ar-hit-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = `ar-hit-feedback combo-${type}`;

    // Vibrar para combos
    if (navigator.vibrate) {
        if (type === 'success') {
            navigator.vibrate([100, 50, 100, 50, 100]);
        } else {
            navigator.vibrate([200, 100, 200]);
        }
    }

    setTimeout(() => {
        feedback.className = 'ar-hit-feedback';
    }, 2500);
}

// Indicador de estado do monstro
function showStateIndicator(text, stateType) {
    let indicator = document.getElementById('monster-state-indicator');

    if (!indicator) {
        // Criar indicador se não existir
        indicator = document.createElement('div');
        indicator.id = 'monster-state-indicator';
        indicator.className = 'monster-state-indicator';
        document.getElementById('ar-hud')?.appendChild(indicator);
    }

    indicator.textContent = text;
    indicator.className = `monster-state-indicator ${stateType} visible`;
}

function hideStateIndicator() {
    const indicator = document.getElementById('monster-state-indicator');
    if (indicator) {
        indicator.classList.remove('visible');
    }
}

// Efeito de tela vermelha quando o jogador recebe dano
function showPlayerDamageEffect() {
    let damageOverlay = document.getElementById('player-damage-overlay');

    if (!damageOverlay) {
        damageOverlay = document.createElement('div');
        damageOverlay.id = 'player-damage-overlay';
        damageOverlay.className = 'player-damage-overlay';
        document.getElementById('ar-hud')?.appendChild(damageOverlay);
    }

    damageOverlay.classList.add('active');

    // Vibrar
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    setTimeout(() => {
        damageOverlay.classList.remove('active');
    }, 300);
}

/**
 * Reproduzir animação de disparo da arma
 * @param {string} weaponId - ID da arma equipada
 */
function playWeaponAnimation(weaponId) {
    const weaponContainer = document.getElementById('ar-weapon-image');
    const arHud = document.getElementById('ar-hud');

    if (!weaponContainer) return;

    // Remove classes de animação anteriores
    weaponContainer.classList.remove('firing', 'reloading', 'fire-and-reload');

    // Para espingarda: animação completa com recuo + recarga pump
    // Para outras armas: apenas recuo simples
    const isShotgun = weaponId === 'shotgun';
    const animationClass = isShotgun ? 'fire-and-reload' : 'firing';
    const animationDuration = isShotgun ? 1200 : 600; // ms

    // Força reflow para reiniciar a animação
    void weaponContainer.offsetWidth;

    // Adiciona a classe de animação
    weaponContainer.classList.add(animationClass);

    // Efeito de screen shake (tela tremendo)
    if (arHud) {
        arHud.classList.add('screen-shake');
        setTimeout(() => {
            arHud.classList.remove('screen-shake');
        }, 200);
    }

    // Remove a classe após a animação terminar
    setTimeout(() => {
        weaponContainer.classList.remove(animationClass);
    }, animationDuration);

    console.log(`🔫 Animação de ${isShotgun ? 'espingarda (disparo + pump)' : 'arma (recuo)'} reproduzida`);
}

function addDiaryEntry(text) {
    const entry = {
        date: new Date().toLocaleString('pt-BR'),
        text: text,
        location: GeoState?.currentPosition ? 'GPS Ativo' : 'Desconhecido'
    };
    GameData.diary.unshift(entry);
}

// ============================================
// ACCESSORY EFFECTS (Filtros de Câmera)
// ============================================

/**
 * Aplicar efeito visual do acessório equipado
 */
function applyAccessoryEffect(item) {
    const filterOverlay = document.getElementById('camera-filter-overlay');
    if (!filterOverlay) {
        console.error('❌ Overlay de filtro não encontrado');
        return;
    }

    // Remover filtros anteriores
    removeAccessoryEffect();

    // Aplicar filtro baseado no acessório
    switch (item.id) {
        case 'camera':
            filterOverlay.classList.add('filter-camera');
            showFilterIndicator('📹 Filmadora Ativa', 'camera');
            // Revelar fantasmas
            updateGhostVisibility(true);
            console.log('📹 Filtro de câmera aplicado - Fantasmas visíveis');
            break;
        case 'uv_light':
            filterOverlay.classList.add('filter-uv');
            showFilterIndicator('🔦 Lanterna UV Ativa', 'uv');
            // TODO: Revelar mensagens ocultas
            console.log('🔦 Filtro UV aplicado');
            break;
        case 'emf':
            showFilterIndicator('📡 EMF Ativo', 'emf');
            // TODO: Detectar monstros próximos
            console.log('📡 Detector EMF ativo');
            break;
    }
}

/**
 * Remover todos os efeitos visuais de acessórios
 */
function removeAccessoryEffect() {
    const filterOverlay = document.getElementById('camera-filter-overlay');
    if (filterOverlay) {
        // Remover todas as classes de filtro
        filterOverlay.classList.remove('filter-camera', 'filter-uv');
    }

    // Remover indicador
    hideFilterIndicator();

    // Esconder fantasmas novamente
    updateGhostVisibility(false);

    console.log('🚫 Efeitos de acessório removidos');
}

/**
 * Atualizar visibilidade de todos os fantasmas na cena
 */
function updateGhostVisibility(visible) {
    const monsters = document.querySelectorAll('[ar-monster]');

    monsters.forEach(monster => {
        const component = monster.components['ar-monster'];
        if (component && component.data.type === 'ghost') {
            monster.setAttribute('visible', visible);

            // Também atualizar a detecção no raycaster
            if (visible) {
                monster.classList.remove('ghost-hidden');
            } else {
                monster.classList.add('ghost-hidden');
            }
        }
    });

    console.log(`👻 Fantasmas ${visible ? 'VISÍVEIS' : 'INVISÍVEIS'}`);
}

/**
 * Mostrar indicador de filtro ativo na tela
 */
function showFilterIndicator(text, type) {
    let indicator = document.getElementById('filter-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'filter-indicator';
        indicator.className = 'filter-indicator';
        document.getElementById('ar-hud')?.appendChild(indicator);
    }

    indicator.textContent = text;
    indicator.className = `filter-indicator ${type}`;
    indicator.style.display = 'flex';
}

/**
 * Esconder indicador de filtro
 */
function hideFilterIndicator() {
    const indicator = document.getElementById('filter-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// ============================================
// GEOLOCATION & MINI-MAP (Leaflet)
// ============================================

const GeoState = {
    currentPosition: null,
    monsterSpawns: [],
    lootSpawns: [],
    isWatching: false,
    map: null,
    playerMarker: null,
    watchId: null,
    monsterMarkers: [],
    lootMarkers: [],
    compassHeading: 0,
    isCompassActive: false,
    fullMapMonsterMarkers: [],
    fullMapLootMarkers: []
};

// Inicializar bússola para rotação do mini-mapa
function initCompass() {
    if (window.DeviceOrientationEvent) {
        // Verificar se precisa de permissão (iOS 13+)
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permission => {
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleCompass, true);
                        GeoState.isCompassActive = true;
                        console.log('🧭 Bússola ativada (iOS)');
                    }
                })
                .catch(console.error);
        } else {
            // Android e outros
            window.addEventListener('deviceorientationabsolute', handleCompass, true);
            window.addEventListener('deviceorientation', handleCompass, true);
            GeoState.isCompassActive = true;
            console.log('🧭 Bússola ativada');
        }
    }
}

function handleCompass(event) {
    let heading = 0;

    // Obter heading (direção em graus)
    if (event.webkitCompassHeading !== undefined) {
        // iOS
        heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
        // Android - alpha é a rotação em torno do eixo Z
        heading = 360 - event.alpha;
    }

    GeoState.compassHeading = heading;

    // Rotacionar o container do mini-mapa
    const minimapContainer = document.querySelector('.ar-minimap');
    if (minimapContainer) {
        minimapContainer.style.transform = `rotate(${-heading}deg)`;
    }
}

// Gerar spawns de monstros e loot baseados na posição real
function generateGlobalSpawns() {
    if (!GeoState.currentPosition) return;

    const { latitude, longitude } = GeoState.currentPosition;

    // Limpar spawns antigos
    GeoState.monsterSpawns = [];
    GeoState.lootSpawns = [];

    // Tipos de monstros
    const monsterTypes = [
        { type: 'werewolf', name: 'Lobisomem', icon: '🐺' },
        { type: 'vampire', name: 'Vampiro', icon: '🧛' },
        { type: 'ghost', name: 'Fantasma', icon: '👻' },
        { type: 'demon', name: 'Demônio', icon: '😈' }
    ];

    // Tipos de loot
    const lootTypes = [
        { id: 'holy_water', name: 'Água Benta', icon: '💧' },
        { id: 'salt', name: 'Sal', icon: '🧂' },
        { id: 'iron_bar', name: 'Barra de Ferro', icon: '🔩' },
        { id: 'bandage', name: 'Bandagem', icon: '🩹' }
    ];

    // Gerar 5-8 monstros em um raio de 500m
    const monsterCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < monsterCount; i++) {
        const distance = 50 + Math.random() * 450; // 50-500 metros
        const angle = Math.random() * 2 * Math.PI;

        const deltaLat = (distance / 111000) * Math.cos(angle);
        const deltaLng = (distance / (111000 * Math.cos(latitude * Math.PI / 180))) * Math.sin(angle);

        const monster = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];

        GeoState.monsterSpawns.push({
            ...monster,
            id: `monster-${i}`,
            latitude: latitude + deltaLat,
            longitude: longitude + deltaLng,
            distance: Math.round(distance)
        });
    }

    // Gerar 8-12 loots em um raio de 300m
    const lootCount = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < lootCount; i++) {
        const distance = 30 + Math.random() * 270; // 30-300 metros
        const angle = Math.random() * 2 * Math.PI;

        const deltaLat = (distance / 111000) * Math.cos(angle);
        const deltaLng = (distance / (111000 * Math.cos(latitude * Math.PI / 180))) * Math.sin(angle);

        const loot = lootTypes[Math.floor(Math.random() * lootTypes.length)];

        GeoState.lootSpawns.push({
            ...loot,
            spawnId: `loot-${i}`,
            latitude: latitude + deltaLat,
            longitude: longitude + deltaLng,
            distance: Math.round(distance)
        });
    }

    console.log(`🎯 Gerados ${monsterCount} monstros e ${lootCount} loots no mapa`);
}

function initARGeolocation() {
    if (!navigator.geolocation) {
        console.warn('GPS não disponível');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            GeoState.currentPosition = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            // Gerar spawns globais baseados na posição real
            generateGlobalSpawns();
            // Iniciar radar de direção
            startRadarUpdate();
            updateARLocation();
            startWatchingPosition();
        },
        (err) => console.error('GPS error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// Radar de direção - atualiza marcadores baseado na posição 3D dos monstros/loot
let radarUpdateInterval = null;

function startRadarUpdate() {
    if (radarUpdateInterval) return;

    // Atualizar radar a cada 500ms
    radarUpdateInterval = setInterval(updateRadar, 500);
    console.log('📡 Radar de direção ativado');
}

function stopRadarUpdate() {
    if (radarUpdateInterval) {
        clearInterval(radarUpdateInterval);
        radarUpdateInterval = null;
    }
}

function updateRadar() {
    const markersContainer = document.getElementById('radar-markers');
    if (!markersContainer) return;

    // Limpar marcadores antigos
    markersContainer.innerHTML = '';

    // Obter monstros e loot ativos na cena AR
    const monsters = document.querySelectorAll('[ar-monster]');
    const loot = document.querySelectorAll('[ar-loot]');

    // Obter rotação da câmera (para calcular direção relativa)
    const camera = document.getElementById('camera');
    let cameraY = 0;
    if (camera) {
        const rotation = camera.getAttribute('rotation');
        if (rotation) {
            cameraY = rotation.y || 0;
        }
    }

    // Raio do radar (em pixels, metade do tamanho do radar menos padding)
    const radarRadius = 40;

    // Adicionar marcadores de monstros
    monsters.forEach(monster => {
        const pos = monster.getAttribute('position');
        if (pos) {
            const marker = createRadarMarker(pos.x, pos.z, cameraY, radarRadius, 'monster');
            if (marker) markersContainer.appendChild(marker);
        }
    });

    // Adicionar marcadores de loot
    loot.forEach(item => {
        const pos = item.getAttribute('position');
        if (pos) {
            const marker = createRadarMarker(pos.x, pos.z, cameraY, radarRadius, 'loot');
            if (marker) markersContainer.appendChild(marker);
        }
    });
}

function createRadarMarker(x, z, cameraY, radarRadius, type) {
    // Calcular distância e ângulo do objeto
    const distance = Math.sqrt(x * x + z * z);

    // Se muito longe, não mostrar (ou mostrar na borda)
    const maxDistance = 5; // 5 metros para representar o raio máximo do radar
    const normalizedDistance = Math.min(distance / maxDistance, 1);

    // Calcular ângulo em relação à câmera
    let angle = Math.atan2(x, -z); // Ângulo do objeto
    angle = angle - (cameraY * Math.PI / 180); // Ajustar pela rotação da câmera

    // Converter para posição no radar (50 é o centro do radar de 100px)
    const radarX = 50 + Math.sin(angle) * (normalizedDistance * radarRadius);
    const radarY = 50 - Math.cos(angle) * (normalizedDistance * radarRadius);

    // Criar elemento do marcador
    const marker = document.createElement('div');
    marker.className = `radar-marker ${type}`;
    marker.style.left = `${radarX}px`;
    marker.style.top = `${radarY}px`;

    return marker;
}

function startWatchingPosition() {
    if (GeoState.isWatching) return;

    GeoState.watchId = navigator.geolocation.watchPosition(
        (pos) => {
            GeoState.currentPosition = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateARLocation();
        },
        (err) => console.error('Watch error:', err),
        { enableHighAccuracy: true, maximumAge: 2000 }
    );

    GeoState.isWatching = true;
}

function updateARLocation() {
    const el = document.getElementById('ar-location');
    if (el && GeoState.currentPosition) {
        el.querySelector('.street').textContent = `📍 ${GeoState.currentPosition.latitude.toFixed(4)}, ${GeoState.currentPosition.longitude.toFixed(4)}`;
    }
}

// ============================================
// MAPA FULL (TELA MAP)
// ============================================

let fullMap = null;
let fullMapMarker = null;

function initFullMap() {
    const mapContainer = document.getElementById('full-map');
    if (!mapContainer) return;

    // Primeiro obter localização
    if (!GeoState.currentPosition) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                GeoState.currentPosition = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                createFullMap();
            },
            (err) => {
                console.error('GPS error:', err);
                // Usar localização padrão (São Paulo)
                GeoState.currentPosition = { latitude: -23.5505, longitude: -46.6333 };
                createFullMap();
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        createFullMap();
    }
}

function createFullMap() {
    const mapContainer = document.getElementById('full-map');
    if (!mapContainer || !GeoState.currentPosition) return;

    // Destruir mapa anterior se existir
    if (fullMap) {
        fullMap.remove();
        fullMap = null;
    }

    const { latitude, longitude } = GeoState.currentPosition;

    // Gerar spawns se ainda não existirem
    if (GeoState.monsterSpawns.length === 0) {
        generateGlobalSpawns();
    }

    // Criar mapa Leaflet
    fullMap = L.map('full-map', {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true
    });

    // Tile layer escuro
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(fullMap);

    // Marcador do jogador
    const playerIcon = L.divIcon({
        className: 'player-marker-full',
        html: '<div style="width:20px;height:20px;background:#00aaff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 20px #00aaff;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    fullMapMarker = L.marker([latitude, longitude], { icon: playerIcon })
        .addTo(fullMap)
        .bindPopup('📍 Você está aqui');

    // Adicionar marcadores de monstros com navegação
    GeoState.fullMapMonsterMarkers = [];
    GeoState.monsterSpawns.forEach((monster, index) => {
        const monsterIcon = L.divIcon({
            className: 'monster-marker-full',
            html: `<div style="width:30px;height:30px;background:linear-gradient(145deg, #ff4444, #cc0000);border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 15px #ff4444;cursor:pointer;">${monster.icon}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const popupContent = `
            <div class="map-popup-content">
                <div class="map-popup-header">
                    <span class="popup-icon">${monster.icon}</span>
                    <strong>${monster.name}</strong>
                </div>
                <div class="map-popup-info">
                    <span>📏 ~${monster.distance}m de distância</span>
                </div>
                <div class="map-popup-actions">
                    <button class="map-nav-btn" onclick="navigateToTarget(${monster.latitude}, ${monster.longitude}, '${monster.name}')">
                        🧭 Navegar
                    </button>
                    <button class="map-hunt-btn" onclick="startHuntFromMap()">
                        🎯 Caçar
                    </button>
                </div>
            </div>
        `;

        const marker = L.marker([monster.latitude, monster.longitude], { icon: monsterIcon })
            .addTo(fullMap)
            .bindPopup(popupContent, { className: 'custom-popup' });

        // Adicionar pulso para monstros próximos
        if (monster.distance < 100) {
            marker.getElement()?.classList.add('nearby-pulse');
        }

        GeoState.fullMapMonsterMarkers.push(marker);
    });

    // Adicionar marcadores de loot com navegação
    GeoState.fullMapLootMarkers = [];
    GeoState.lootSpawns.forEach((loot, index) => {
        const lootIcon = L.divIcon({
            className: 'loot-marker-full',
            html: `<div style="width:24px;height:24px;background:linear-gradient(145deg, #ffcc00, #ff9900);border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px #ffcc00;cursor:pointer;">${loot.icon}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const popupContent = `
            <div class="map-popup-content">
                <div class="map-popup-header">
                    <span class="popup-icon">${loot.icon}</span>
                    <strong>${loot.name}</strong>
                </div>
                <div class="map-popup-info">
                    <span>📏 ~${loot.distance}m de distância</span>
                </div>
                <div class="map-popup-actions">
                    <button class="map-nav-btn" onclick="navigateToTarget(${loot.latitude}, ${loot.longitude}, '${loot.name}')">
                        🧭 Navegar
                    </button>
                </div>
            </div>
        `;

        const marker = L.marker([loot.latitude, loot.longitude], { icon: lootIcon })
            .addTo(fullMap)
            .bindPopup(popupContent, { className: 'custom-popup' });

        GeoState.fullMapLootMarkers.push(marker);
    });

    // Forçar redimensionamento
    setTimeout(() => fullMap.invalidateSize(), 100);

    console.log('🗺️ Mapa full inicializado com pins de monstros e loot');
}

/**
 * Navegar para um alvo específico usando Google Maps ou app nativo
 */
function navigateToTarget(lat, lng, name) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

    // Mostrar confirmação
    if (confirm(`Abrir navegação para ${name}?`)) {
        window.open(url, '_blank');

        // Adicionar ao diário
        addDiaryEntry(`Iniciou navegação para ${name}`);
    }
}

/**
 * Iniciar caçada diretamente do mapa
 */
function startHuntFromMap() {
    // Fechar popup e mudar para tela de caça
    if (fullMap) {
        fullMap.closePopup();
    }
    goto('hunt');
}

/**
 * Mostrar rota no mapa até o alvo
 */
function showRouteOnMap(targetLat, targetLng) {
    if (!fullMap || !GeoState.currentPosition) return;

    const { latitude, longitude } = GeoState.currentPosition;

    // Remover rota anterior se existir
    if (GeoState.currentRoute) {
        fullMap.removeLayer(GeoState.currentRoute);
    }

    // Desenhar linha até o alvo
    GeoState.currentRoute = L.polyline(
        [[latitude, longitude], [targetLat, targetLng]],
        {
            color: '#cc0000',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        }
    ).addTo(fullMap);

    // Ajustar zoom para mostrar toda a rota
    fullMap.fitBounds(GeoState.currentRoute.getBounds(), { padding: [50, 50] });
}

// ============================================
// AR INVENTORY MODAL - COM OPÇÃO NENHUM
// ============================================

let currentARSlotType = null;

function openARInventory(slotType) {
    currentARSlotType = slotType;
    const modal = document.getElementById('ar-inventory-modal');
    const grid = document.getElementById('ar-inv-grid');

    if (!modal || !grid) return;

    grid.innerHTML = '';

    let items = [];
    let equippedItem = null;
    let noneIcon = '➖';
    let noneLabel = 'Nenhum';

    switch (slotType) {
        case 'weapon':
            // Filtrar armas com quantity > 0 (coletadas)
            items = GameData.inventory.weapons.filter(w => w.quantity > 0);
            equippedItem = GameData.equipped.weapon;
            noneIcon = '✋';
            noneLabel = 'Coletar';
            break;
        case 'accessory':
            items = GameData.inventory.accessories;
            equippedItem = GameData.equipped.accessory;
            noneIcon = '➖';
            noneLabel = 'Nenhum';
            break;
        case 'healing':
            items = GameData.inventory.healing;
            equippedItem = null; // Cura é sempre "nenhum" após usar
            noneIcon = '➖';
            noneLabel = 'Nenhum';
            break;
    }

    // Adicionar opção "Nenhum" primeiro (exceto para armas, pois a mão serve para coletar)
    if (slotType !== 'weapon') {
        const noneEl = document.createElement('div');
        const isNoneEquipped = (slotType === 'accessory' && !equippedItem) ||
            (slotType === 'healing' && !equippedItem);
        noneEl.className = `ar-inv-item ${isNoneEquipped ? 'equipped' : ''}`;
        noneEl.innerHTML = `<span style="font-size:28px;">${noneIcon}</span><small style="font-size:8px;color:#888;">${noneLabel}</small>`;
        noneEl.addEventListener('click', () => {
            selectNone(slotType);
        });
        grid.appendChild(noneEl);
    }

    // Adicionar itens
    items.forEach(item => {
        const isEquipped = equippedItem && equippedItem.id === item.id;
        const el = document.createElement('div');
        el.className = `ar-inv-item ${isEquipped ? 'equipped' : ''}`;

        // Usar iconPath (imagem PNG) se disponível, senão usar emoji
        const iconHtml = item.iconPath
            ? `<img src="${item.iconPath}" alt="${item.name}">`
            : `<span style="font-size:28px;">${item.icon}</span>`;

        // Para cura, mostrar quantidade
        if (slotType === 'healing') {
            el.innerHTML = `${iconHtml}<small style="font-size:8px;color:#888;">x${item.quantity}</small>`;
        } else {
            el.innerHTML = iconHtml;
        }

        el.addEventListener('click', () => {
            if (slotType === 'healing') {
                useHealingItem(item);
            } else {
                equipARItem(item.id, slotType);
            }
        });
        grid.appendChild(el);
    });

    modal.classList.add('visible');
}

function selectNone(slotType) {
    switch (slotType) {
        case 'weapon':
            // Modo coleta - mão aberta
            GameData.equipped.weapon = null;
            break;
        case 'accessory':
            // Remover efeito atual
            removeAccessoryEffect();
            GameData.equipped.accessory = null;
            break;
        case 'healing':
            GameData.equipped.healing = null;
            break;
    }
    updateARHUD();
    closeARInventory();
    console.log(`✋ Slot ${slotType} vazio - modo coleta`);
}

function closeARInventory() {
    document.getElementById('ar-inventory-modal')?.classList.remove('visible');
}

function equipARItem(itemId, slotType) {
    let items, slotKey;

    switch (slotType) {
        case 'weapon':
            items = GameData.inventory.weapons;
            slotKey = 'weapon';
            break;
        case 'accessory':
            items = GameData.inventory.accessories;
            slotKey = 'accessory';
            break;
        case 'healing':
            items = GameData.inventory.healing;
            slotKey = 'healing';
            break;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Se for acessório, aplicar efeito
    if (slotType === 'accessory') {
        removeAccessoryEffect();
        GameData.equipped[slotKey] = item;
        applyAccessoryEffect(item);
    } else {
        GameData.equipped[slotKey] = item;
    }

    updateARHUD();
    closeARInventory();

    console.log(`✅ Equipado: ${item.name}`);
}

function useHealingItem(item) {
    if (!item || item.quantity <= 0) {
        console.log('❌ Sem itens de cura');
        closeARInventory();
        return;
    }

    // Aplicar cura
    const prevHp = GameData.player.hp;
    GameData.player.hp = Math.min(GameData.player.hp + item.healAmount, GameData.player.maxHp);
    const healed = GameData.player.hp - prevHp;

    // Reduzir quantidade
    item.quantity--;

    // Vibrar
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 50]);
    }

    // Feedback visual
    const feedback = document.getElementById('ar-hit-feedback');
    if (feedback) {
        feedback.textContent = `+${healed} ❤️`;
        feedback.style.color = '#44ff44';
        feedback.className = 'ar-hit-feedback hit';
        setTimeout(() => {
            feedback.className = 'ar-hit-feedback';
            feedback.style.color = '';
        }, 500);
    }

    // Slot de cura fica vazio após usar
    GameData.equipped.healing = null;

    updateARHUD();
    closeARInventory();

    console.log(`💊 Curou ${healed} HP! Total: ${GameData.player.hp}/${GameData.player.maxHp}`);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Supernatural AR Initialized');

    // Iniciar splash
    initSplash();

    // Navegação Home
    document.getElementById('btn-start-hunt')?.addEventListener('click', () => goto('hunt'));
    document.getElementById('btn-map')?.addEventListener('click', () => goto('map'));
    document.getElementById('btn-inventory')?.addEventListener('click', () => goto('inventory'));
    document.getElementById('btn-bestiary')?.addEventListener('click', () => goto('bestiary'));
    document.getElementById('btn-diary')?.addEventListener('click', () => goto('diary'));
    document.getElementById('btn-profile')?.addEventListener('click', () => goto('profile'));

    // Back buttons
    document.getElementById('btn-back-map')?.addEventListener('click', goBack);
    document.getElementById('btn-back-inventory')?.addEventListener('click', goBack);
    document.getElementById('btn-back-bestiary')?.addEventListener('click', goBack);
    document.getElementById('btn-back-diary')?.addEventListener('click', goBack);
    document.getElementById('btn-back-profile')?.addEventListener('click', goBack);

    // Inventory tabs
    document.querySelectorAll('.inv-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            GameData.currentTab = tab.dataset.tab;
            renderInventoryFull();
        });
    });

    // Bestiary filters
    document.querySelectorAll('.bestiary-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('.bestiary-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            renderBestiary(filter.dataset.filter);
        });
    });

    // Monster detail close button
    document.getElementById('monster-detail-close')?.addEventListener('click', hideMonsterDetails);

    // Close monster detail when clicking overlay background
    document.getElementById('monster-detail-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'monster-detail-overlay') {
            hideMonsterDetails();
        }
    });

    // Profile name
    document.getElementById('profile-name')?.addEventListener('change', (e) => {
        GameData.player.name = e.target.value;
        saveGame(); // Salvar ao mudar nome
    });

    // AR buttons
    document.getElementById('ar-exit')?.addEventListener('click', exitAR);

    document.getElementById('ar-fire')?.addEventListener('click', () => {
        const scene = document.getElementById('ar-scene');
        const combat = scene?.systems['combat'];
        const weapon = GameData.equipped.weapon;

        // Reproduzir animação da arma (se tiver arma equipada)
        if (weapon) {
            playWeaponAnimation(weapon.id);
        }

        if (combat) {
            const result = combat.fire();

            // Verificar se é um combo ativado
            if (result.comboTriggered || result.stateChanged) {
                showComboFeedback(result.comboMessage, 'success');
            } else {
                showHitFeedback(result.hit, result.damage, result.isWeakness, result.isImmune, result.immuneReason);
            }
        }
    });

    document.getElementById('ar-spawn')?.addEventListener('click', () => {
        const scene = document.getElementById('ar-scene');
        const spawner = scene?.systems['monster-spawner'];
        if (spawner) spawner.spawnMonster();
    });

    // AR Inventory Slots - Abrir modal ao clicar
    document.getElementById('ar-slot-weapon')?.addEventListener('click', () => openARInventory('weapon'));
    document.getElementById('ar-slot-accessory')?.addEventListener('click', () => openARInventory('accessory'));
    document.getElementById('ar-slot-healing')?.addEventListener('click', () => openARInventory('healing'));

    // Fechar modal de inventário AR
    document.getElementById('ar-inv-close')?.addEventListener('click', closeARInventory);
});
