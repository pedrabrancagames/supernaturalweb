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
            { id: 'fist', name: 'Punho', icon: '🤛', quantity: 1, damage: 5, weakness: [] },
            { id: 'shotgun', name: 'Espingarda', icon: '🔫', quantity: 1, damage: 30, weakness: ['vampire', 'werewolf'] },
            { id: 'iron_bar', name: 'Barra de Ferro', icon: '🔩', quantity: 3, damage: 25, weakness: ['ghost'] },
            { id: 'silver_knife', name: 'Faca de Prata', icon: '🔪', quantity: 1, damage: 40, weakness: ['werewolf'] },
            { id: 'holy_water', name: 'Água Benta', icon: '💧', quantity: 5, damage: 35, weakness: ['demon'] },
            { id: 'salt', name: 'Sal', icon: '🧂', quantity: 0, damage: 25, weakness: ['ghost', 'demon'] }
        ],
        accessories: [
            { id: 'camera', name: 'Filmadora', icon: '📹', quantity: 1, effect: 'reveal_ghost' },
            { id: 'uv_light', name: 'Lanterna UV', icon: '🔦', quantity: 1, effect: 'reveal_messages' },
            { id: 'emf', name: 'Detector EMF', icon: '📡', quantity: 1, effect: 'detect_nearby' }
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

// Inicializar com punho equipado
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
// SPLASH SCREEN
// ============================================

function initSplash() {
    const progress = document.getElementById('splash-progress');
    const status = document.getElementById('splash-status');

    const steps = [
        { progress: 20, text: 'Carregando recursos...' },
        { progress: 40, text: 'Verificando GPS...' },
        { progress: 60, text: 'Preparando AR...' },
        { progress: 80, text: 'Invocando entidades...' },
        { progress: 100, text: 'Pronto!' }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            progress.style.width = `${steps[currentStep].progress}%`;
            status.textContent = steps[currentStep].text;
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => goto('home'), 500);
        }
    }, 600);
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
            items = GameData.inventory.weapons;
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
        el.innerHTML = `
      <span class="inv-item-icon">${item.icon}</span>
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

    // Atualizar slots
    const weaponSlot = document.getElementById('ar-slot-weapon');
    const accessorySlot = document.getElementById('ar-slot-accessory');
    const healingSlot = document.getElementById('ar-slot-healing');

    if (weaponSlot) {
        // Mão aberta (✋) quando sem arma = modo coleta
        weaponSlot.querySelector('span').textContent = GameData.equipped.weapon?.icon || '✋';
    }
    if (accessorySlot) {
        accessorySlot.querySelector('span').textContent = GameData.equipped.accessory?.icon || '➖';
    }
    if (healingSlot) {
        healingSlot.querySelector('span').textContent = GameData.equipped.healing?.icon || '➖';
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

        this.el.setAttribute('gltf-model', modelMap[this.data.type] || '#werewolf-model');
        this.el.setAttribute('scale', '0.5 0.5 0.5');
        this.el.setAttribute('animation', {
            property: 'rotation',
            to: '0 360 0',
            loop: true,
            dur: 8000,
            easing: 'linear'
        });

        // Fantasmas começam invisíveis - precisam da Filmadora para serem vistos
        if (this.data.type === 'ghost') {
            // Verificar se a filmadora está equipada
            const hasCamera = GameData.equipped.accessory?.id === 'camera';
            this.el.setAttribute('visible', hasCamera);
            if (!hasCamera) {
                this.el.classList.add('ghost-hidden');
            }
            console.log(`👻 Fantasma spawnado - Visível: ${hasCamera}`);
        }

        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.registerMonster(this.el);
        }
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

        // Se não tem arma (mão vazia), tenta coletar loot
        if (!weapon) {
            return this.tryCollectLoot();
        }

        // Com arma, tenta atacar monstros
        const meshes = [];
        this.monsters.forEach(monster => {
            // Ignorar fantasmas invisíveis (precisam da filmadora)
            if (monster.classList.contains('ghost-hidden')) {
                return;
            }
            const mesh = monster.getObject3D('mesh');
            if (mesh) meshes.push(mesh);
        });

        if (meshes.length === 0) {
            // Se não tem monstros, tenta coletar loot mesmo com arma
            return this.tryCollectLoot();
        }

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
        const lootTypes = [
            { id: 'holy_water', icon: '💧', name: 'Água Benta', category: 'weapons', damage: 35, model: 'holy-water-model' },
            { id: 'salt', icon: '🧂', name: 'Sal', category: 'weapons', damage: 25, model: 'salt-model' }
        ];

        const loot = lootTypes[Math.floor(Math.random() * lootTypes.length)];

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
        model: { type: 'string', default: 'holy-water-model' }
    },

    init: function () {
        // Carregar modelo 3D do loot
        this.el.setAttribute('gltf-model', `#${this.data.model}`);

        // Escala apropriada para os itens
        this.el.setAttribute('scale', '0.3 0.3 0.3');

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
            }
        } else if (category === 'weapons') {
            const item = GameData.inventory.weapons.find(i => i.id === this.data.id);
            if (item) {
                item.quantity++;
                added = true;
            }
        }

        if (added) {
            GameData.player.itemsCollected++;

            // Feedback visual
            const feedback = document.getElementById('ar-hit-feedback');
            if (feedback) {
                feedback.textContent = `+1 ${this.data.icon}`;
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
    isWatching: false,
    map: null,
    playerMarker: null,
    watchId: null
};

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
            initMiniMap();
            updateARLocation();
            startWatchingPosition();
        },
        (err) => console.error('GPS error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function initMiniMap() {
    if (GeoState.map) return; // Já inicializado

    const mapContainer = document.getElementById('ar-map');
    if (!mapContainer || !GeoState.currentPosition) return;

    const { latitude, longitude } = GeoState.currentPosition;

    // Criar mapa Leaflet
    GeoState.map = L.map('ar-map', {
        center: [latitude, longitude],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false
    });

    // Tile layer (OpenStreetMap escuro)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(GeoState.map);

    // Marcador do jogador
    const playerIcon = L.divIcon({
        className: 'player-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    GeoState.playerMarker = L.marker([latitude, longitude], { icon: playerIcon })
        .addTo(GeoState.map);

    console.log('🗺️ Mini-mapa inicializado');
}

function startWatchingPosition() {
    if (GeoState.isWatching) return;

    GeoState.watchId = navigator.geolocation.watchPosition(
        (pos) => {
            GeoState.currentPosition = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };
            updateMiniMap();
            updateARLocation();
        },
        (err) => console.error('Watch error:', err),
        { enableHighAccuracy: true, maximumAge: 2000 }
    );

    GeoState.isWatching = true;
}

function updateMiniMap() {
    if (!GeoState.map || !GeoState.currentPosition) return;

    const { latitude, longitude } = GeoState.currentPosition;

    // Mover mapa para manter jogador no centro
    GeoState.map.setView([latitude, longitude], GeoState.map.getZoom(), { animate: true });

    // Atualizar marcador do jogador
    if (GeoState.playerMarker) {
        GeoState.playerMarker.setLatLng([latitude, longitude]);
    }
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
        className: 'player-marker',
        html: '<div style="width:16px;height:16px;background:#00aaff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 15px #00aaff;"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    fullMapMarker = L.marker([latitude, longitude], { icon: playerIcon })
        .addTo(fullMap)
        .bindPopup('Você está aqui');

    // Forçar redimensionamento
    setTimeout(() => fullMap.invalidateSize(), 100);

    console.log('🗺️ Mapa full inicializado');
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
            items = GameData.inventory.weapons.filter(w => w.id !== 'fist');
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

    // Adicionar opção "Nenhum" primeiro
    const noneEl = document.createElement('div');
    const isNoneEquipped = (slotType === 'weapon' && (!equippedItem || equippedItem.id === 'fist')) ||
        (slotType === 'accessory' && !equippedItem) ||
        (slotType === 'healing' && !equippedItem);
    noneEl.className = `ar-inv-item ${isNoneEquipped ? 'equipped' : ''}`;
    noneEl.innerHTML = `<span>${noneIcon}</span><small style="font-size:8px;color:#888;">${noneLabel}</small>`;
    noneEl.addEventListener('click', () => {
        selectNone(slotType);
    });
    grid.appendChild(noneEl);

    // Adicionar itens
    items.forEach(item => {
        const isEquipped = equippedItem && equippedItem.id === item.id;
        const el = document.createElement('div');
        el.className = `ar-inv-item ${isEquipped ? 'equipped' : ''}`;

        // Para cura, mostrar quantidade
        if (slotType === 'healing') {
            el.innerHTML = `<span>${item.icon}</span><small style="font-size:8px;color:#888;">x${item.quantity}</small>`;
        } else {
            el.innerHTML = `<span>${item.icon}</span>`;
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

function applyAccessoryEffect(accessory) {
    if (!accessory) return;

    const scene = document.getElementById('ar-scene');
    if (!scene) return;

    switch (accessory.id) {
        case 'camera':
            // Efeito de filmadora - grayscale
            scene.style.filter = 'grayscale(100%)';
            break;
        case 'uv_light':
            // Efeito de lanterna UV
            scene.style.filter = 'hue-rotate(270deg) brightness(1.2)';
            break;
        case 'emf':
            // EMF não tem efeito visual
            break;
    }

    console.log(`🔧 Efeito de ${accessory.name} aplicado`);
}

function removeAccessoryEffect() {
    const scene = document.getElementById('ar-scene');
    if (scene) {
        scene.style.filter = '';
    }
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
