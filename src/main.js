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
            { id: 'camera', name: 'Filmadora', icon: '📹', iconPath: '/images/icon-mao.png', quantity: 1, effect: 'reveal_ghost' },
            { id: 'uv_light', name: 'Lanterna UV', icon: '🔦', iconPath: '/images/icon-mao.png', quantity: 1, effect: 'reveal_messages' },
            { id: 'emf', name: 'Detector EMF', icon: '📡', iconPath: '/images/icon-mao.png', quantity: 1, effect: 'detect_nearby' }
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
        { id: 'werewolf', name: 'Lobisomem', icon: '🐺', type: 'Licantropo', defeated: false, weakness: 'Prata' },
        { id: 'vampire', name: 'Vampiro', icon: '🧛', type: 'Morto-Vivo', defeated: false, weakness: 'Estaca/Sol' },
        { id: 'ghost', name: 'Fantasma', icon: '👻', type: 'Espírito', defeated: false, weakness: 'Ferro/Sal' },
        { id: 'demon', name: 'Demônio', icon: '😈', type: 'Sobrenatural', defeated: false, weakness: 'Água Benta' }
    ],

    diary: [],

    currentTab: 'weapons',
    currentScreen: 'splash'
};

// Inicializar com mão equipada
GameData.equipped.weapon = GameData.inventory.weapons[0];

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
        }
    }

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

async function initSplash() {
    const progress = document.getElementById('splash-progress');
    const status = document.getElementById('splash-status');

    const allResources = [
        ...PRELOAD_RESOURCES.images.map(src => ({ type: 'image', src })),
        ...PRELOAD_RESOURCES.models.map(src => ({ type: 'model', src }))
    ];

    const totalResources = allResources.length;
    let loadedCount = 0;

    status.textContent = 'Iniciando carregamento...';
    progress.style.width = '0%';

    // Carregar recursos em paralelo, mas atualizar UI sequencialmente
    const loadPromises = allResources.map(async (resource, index) => {
        // Atualizar status antes de carregar
        const fileName = getFileName(resource.src);

        if (resource.type === 'image') {
            await preloadImage(resource.src);
        } else {
            await preloadModel(resource.src);
        }

        loadedCount++;
        const progressPercent = Math.round((loadedCount / totalResources) * 90); // Até 90%

        progress.style.width = `${progressPercent}%`;
        status.textContent = `Carregando: ${fileName}`;

        return resource.src;
    });

    try {
        await Promise.all(loadPromises);

        // Etapa final
        progress.style.width = '95%';
        status.textContent = 'Preparando AR...';
        await new Promise(r => setTimeout(r, 300));

        progress.style.width = '100%';
        status.textContent = 'Pronto!';
        await new Promise(r => setTimeout(r, 500));

        console.log(`✅ ${totalResources} recursos pré-carregados com sucesso!`);
        goto('home');

    } catch (error) {
        console.error('❌ Erro no carregamento:', error);
        status.textContent = 'Erro ao carregar recursos';
        // Mesmo com erro, vai para home após delay
        setTimeout(() => goto('home'), 2000);
    }
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

function renderBestiary() {
    const list = document.getElementById('bestiary-list');
    if (!list) return;

    list.innerHTML = '';

    GameData.bestiary.forEach(monster => {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.innerHTML = `
      <div class="monster-icon">${monster.icon}</div>
      <div class="monster-info">
        <div class="monster-name">${monster.name}</div>
        <div class="monster-type">${monster.type} • Fraqueza: ${monster.weakness}</div>
      </div>
      <div class="monster-status ${monster.defeated ? 'defeated' : 'locked'}">
        ${monster.defeated ? '✓' : '🔒'}
      </div>
    `;
        list.appendChild(card);
    });
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

async function startARMode() {
    const scene = document.getElementById('ar-scene');
    if (!scene) return;

    // Verificar suporte WebXR
    if (!navigator.xr) {
        alert('WebXR não disponível neste navegador');
        goto('home');
        return;
    }

    try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!supported) {
            alert('AR não suportado neste dispositivo');
            goto('home');
            return;
        }

        // Entrar em AR
        if (scene.enterAR) {
            await scene.enterAR();
        }

        updateARHUD();
        initARGeolocation();

    } catch (e) {
        console.error('Erro ao iniciar AR:', e);
        alert('Erro ao iniciar AR: ' + e.message);
        goto('home');
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
        // Monstros não ficam mais rodando - removida animação de rotação

        // Fantasmas começam invisíveis - precisam da Filmadora para serem vistos
        if (this.data.type === 'ghost') {
            // Verificar se a filmadora está equipada
            const hasCamera = GameData.equipped.accessory?.id === 'camera';
            this.el.setAttribute('visible', hasCamera);
            if (!hasCamera) {
                this.el.classList.add('ghost-hidden');
            }

            // Configurar movimento circular e levitação para o fantasma
            this.ghostOrbitAngle = Math.random() * Math.PI * 2; // Ângulo inicial aleatório
            this.ghostOrbitSpeed = 0.3 + Math.random() * 0.2; // Velocidade de órbita
            this.ghostHoverOffset = 0; // Offset para levitação
            this.ghostOrbitRadius = 2 + Math.random(); // Raio da órbita

            // Animação de levitação suave (balanço vertical)
            const pos = this.el.getAttribute('position');
            this.ghostBaseY = pos.y + 0.5; // Flutuar acima do chão
            this.el.setAttribute('position', { x: pos.x, y: this.ghostBaseY, z: pos.z });

            console.log(`👻 Fantasma spawnado - Visível: ${hasCamera} - Com movimento orbital`);
        }

        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.registerMonster(this.el);
        }
    },

    tick: function (time, deltaTime) {
        // Movimento circular e levitação apenas para fantasmas
        if (this.data.type !== 'ghost') return;
        if (!deltaTime) return;

        const dt = deltaTime / 1000; // Converter para segundos
        const camera = document.getElementById('camera');
        if (!camera) return;

        const cameraPos = camera.getAttribute('position');

        // Atualizar ângulo de órbita
        this.ghostOrbitAngle += this.ghostOrbitSpeed * dt;

        // Calcular nova posição orbital ao redor do jogador
        const newX = cameraPos.x + Math.cos(this.ghostOrbitAngle) * this.ghostOrbitRadius;
        const newZ = cameraPos.z + Math.sin(this.ghostOrbitAngle) * this.ghostOrbitRadius;

        // Efeito de levitação (subir e descer suavemente)
        this.ghostHoverOffset += dt * 2;
        const hoverY = this.ghostBaseY + Math.sin(this.ghostHoverOffset) * 0.3;

        // Aplicar nova posição
        this.el.setAttribute('position', { x: newX, y: hoverY, z: newZ });

        // Fazer o fantasma olhar para o jogador
        const angleToPlayer = Math.atan2(cameraPos.x - newX, cameraPos.z - newZ) * (180 / Math.PI);
        this.el.setAttribute('rotation', { x: 0, y: angleToPlayer, z: 0 });
    },

    takeDamage: function (amount, weaponId) {
        const weapon = GameData.inventory.weapons.find(w => w.id === weaponId);
        let actualDamage = amount;
        let isWeakness = false;

        if (weapon && weapon.weakness.includes(this.data.type)) {
            actualDamage = amount * 2;
            isWeakness = true;
        } else if (weapon && weapon.weakness.length > 0 && !weapon.weakness.includes(this.data.type)) {
            actualDamage = Math.floor(amount * 0.3);
        }

        this.data.hp -= actualDamage;

        updateMonsterHP(this.data.hp, this.data.maxHp, this.data.type);

        if (this.data.hp <= 0) {
            this.die();
        }

        return { damage: actualDamage, isWeakness, remainingHp: this.data.hp };
    },

    die: function () {
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
        if (monster) monster.defeated = true;

        // Adicionar ao diário
        addDiaryEntry(`Derrotou um ${this.data.type}`);

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

        // Se não há loot disponível, não spawna nada
        if (availableLoot.length === 0) {
            console.log('📦 Todos os itens já foram coletados!');
            return null;
        }

        const loot = availableLoot[Math.floor(Math.random() * availableLoot.length)];

        const entity = document.createElement('a-entity');
        entity.setAttribute('ar-loot', loot);
        entity.setAttribute('position', position);

        document.getElementById('monsters-container').appendChild(entity);

        console.log(`✨ Loot ${loot.name} spawnou!`);

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
        scale: { type: 'string', default: '0.6 0.6 0.6' }
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

        // Adicionar efeito de brilho (luz pontual)
        const light = document.createElement('a-light');
        light.setAttribute('type', 'point');
        light.setAttribute('color', this.data.category === 'healing' ? '#44ff44' : '#4ecdc4');
        light.setAttribute('intensity', '0.8');
        light.setAttribute('distance', '1');
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

            // Feedback visual - mostrar nome do item
            const feedback = document.getElementById('ar-hit-feedback');
            if (feedback) {
                feedback.textContent = `+1 ${this.data.name}`;
                feedback.style.color = '#ffcc00';
                feedback.className = 'ar-hit-feedback hit';
                setTimeout(() => {
                    feedback.className = 'ar-hit-feedback';
                    feedback.style.color = '';
                }, 500);
            }

            // Vibrar
            if (navigator.vibrate) {
                navigator.vibrate([30, 20, 30]);
            }

            console.log(`✨ Coletou: ${this.data.name}`);
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

    const names = { werewolf: '🐺 Lobisomem', vampire: '🧛 Vampiro', ghost: '👻 Fantasma', demon: '😈 Demônio' };

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

function showHitFeedback(hit, damage = 0, isWeakness = false) {
    const feedback = document.getElementById('ar-hit-feedback');
    if (!feedback) return;

    if (hit) {
        feedback.textContent = isWeakness ? `⚡-${damage}` : `-${damage}`;
        feedback.className = 'ar-hit-feedback hit';
    } else {
        feedback.textContent = 'MISS';
        feedback.className = 'ar-hit-feedback miss';
    }

    setTimeout(() => {
        feedback.className = 'ar-hit-feedback';
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

    // Adicionar marcadores de monstros
    GeoState.fullMapMonsterMarkers = [];
    GeoState.monsterSpawns.forEach(monster => {
        const monsterIcon = L.divIcon({
            className: 'monster-marker-full',
            html: `<div style="width:24px;height:24px;background:#ff4444;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 10px #ff4444;">${monster.icon}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([monster.latitude, monster.longitude], { icon: monsterIcon })
            .addTo(fullMap)
            .bindPopup(`<b>${monster.icon} ${monster.name}</b><br>Distância: ~${monster.distance}m`);

        GeoState.fullMapMonsterMarkers.push(marker);
    });

    // Adicionar marcadores de loot
    GeoState.fullMapLootMarkers = [];
    GeoState.lootSpawns.forEach(loot => {
        const lootIcon = L.divIcon({
            className: 'loot-marker-full',
            html: `<div style="width:20px;height:20px;background:#ffcc00;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 8px #ffcc00;">${loot.icon}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([loot.latitude, loot.longitude], { icon: lootIcon })
            .addTo(fullMap)
            .bindPopup(`<b>${loot.icon} ${loot.name}</b><br>Distância: ~${loot.distance}m`);

        GeoState.fullMapLootMarkers.push(marker);
    });

    // Forçar redimensionamento
    setTimeout(() => fullMap.invalidateSize(), 100);

    console.log('🗺️ Mapa full inicializado com pins de monstros e loot');
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

    // Profile name
    document.getElementById('profile-name')?.addEventListener('change', (e) => {
        GameData.player.name = e.target.value;
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
            showHitFeedback(result.hit, result.damage, result.isWeakness);
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
