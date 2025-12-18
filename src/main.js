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
            { id: 'holy_water', name: 'Água Benta', icon: '💧', quantity: 5, damage: 35, weakness: ['demon'] }
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
        weaponSlot.querySelector('span').textContent = GameData.equipped.weapon?.icon || '🤛';
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

    fire: function () {
        const camera = this.el.sceneEl.camera;
        const weapon = GameData.equipped.weapon;

        if (!camera || !weapon) {
            return { hit: false, reason: 'no_weapon' };
        }

        const cameraPosition = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();

        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);

        this.raycaster.set(cameraPosition, cameraDirection);

        const meshes = [];
        this.monsters.forEach(monster => {
            const mesh = monster.getObject3D('mesh');
            if (mesh) meshes.push(mesh);
        });

        if (meshes.length === 0) {
            return { hit: false, reason: 'no_monsters' };
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

    findMonsterFromMesh: function (mesh) {
        let current = mesh;
        while (current) {
            if (current.el && current.el.hasAttribute('ar-monster')) {
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
    },

    spawnMonster: function (type = null) {
        let position;

        if (this.lastHitPose && this.reticle && this.reticle.getAttribute('visible')) {
            const reticlePos = this.reticle.getAttribute('position');
            position = { x: reticlePos.x, y: reticlePos.y, z: reticlePos.z };
        } else {
            const camera = document.getElementById('camera');
            const cameraPos = camera.getAttribute('position');
            const cameraRot = camera.getAttribute('rotation');
            const angle = THREE.MathUtils.degToRad(cameraRot.y);
            position = {
                x: cameraPos.x - Math.sin(angle) * 2,
                y: 0,
                z: cameraPos.z - Math.cos(angle) * 2
            };
        }

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

        return monster;
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
// AR INVENTORY MODAL
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

    switch (slotType) {
        case 'weapon':
            items = GameData.inventory.weapons;
            equippedItem = GameData.equipped.weapon;
            break;
        case 'accessory':
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
        el.className = `ar-inv-item ${isEquipped ? 'equipped' : ''}`;
        el.innerHTML = `<span>${item.icon}</span>`;
        el.addEventListener('click', () => {
            equipARItem(item.id, slotType);
        });
        grid.appendChild(el);
    });

    modal.classList.add('visible');
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

    GameData.equipped[slotKey] = item;
    updateARHUD();
    closeARInventory();

    console.log(`✅ Equipado no AR: ${item.name}`);
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
