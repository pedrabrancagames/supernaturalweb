/**
 * Supernatural AR - Main Application
 * Sistema de Inventário com 3 Slots + Combate AR
 */

// ============================================
// DADOS DO JOGO
// ============================================

const GameData = {
    // Inventário do jogador (todos os itens coletados)
    inventory: {
        weapons: [
            { id: 'fist', name: 'Punho', icon: '🤛', quantity: 1, damage: 5, weakness: [] },
            { id: 'shotgun', name: 'Espingarda', icon: '🔫', quantity: 1, damage: 30, weakness: ['vampire', 'werewolf'] },
            { id: 'iron_bar', name: 'Barra de Ferro', icon: '🔩', quantity: 3, damage: 25, weakness: ['ghost'] },
            { id: 'silver_knife', name: 'Faca de Prata', icon: '🔪', quantity: 1, damage: 40, weakness: ['werewolf'] },
            { id: 'holy_water', name: 'Água Benta', icon: '💧', quantity: 5, damage: 35, weakness: ['demon'] }
        ],
        accessories: [
            { id: 'camera', name: 'Filmadora', icon: '📹', quantity: 1, effect: 'reveal_ghost', filter: 'grayscale' },
            { id: 'uv_light', name: 'Lanterna UV', icon: '🔦', quantity: 1, effect: 'reveal_messages', filter: 'uv' },
            { id: 'emf', name: 'Detector EMF', icon: '📡', quantity: 1, effect: 'detect_nearby', filter: null }
        ],
        healing: [
            { id: 'bandage', name: 'Bandagem', icon: '🩹', quantity: 5, healAmount: 20 },
            { id: 'medkit', name: 'Kit Médico', icon: '💊', quantity: 2, healAmount: 50 },
            { id: 'adrenaline', name: 'Adrenalina', icon: '💉', quantity: 1, healAmount: 100 }
        ]
    },

    // Itens equipados (1 de cada tipo)
    equipped: {
        weapon: null,
        accessory: null,
        healing: null
    },

    // Status do jogador
    player: {
        hp: 100,
        maxHp: 100
    },

    // Tab atual do inventário
    currentTab: 'weapons'
};

// Inicializar com punho equipado
GameData.equipped.weapon = GameData.inventory.weapons[0];

// ============================================
// COMPONENTE: ar-monster
// ============================================
AFRAME.registerComponent('ar-monster', {
    schema: {
        type: { type: 'string', default: 'werewolf' },
        hp: { type: 'number', default: 100 },
        maxHp: { type: 'number', default: 100 }
    },

    init: function () {
        const el = this.el;
        const data = this.data;

        const modelMap = {
            werewolf: '#werewolf-model',
            vampire: '#vampire-model',
            ghost: '#ghost-model',
            demon: '#demon-model'
        };

        el.setAttribute('gltf-model', modelMap[data.type] || '#werewolf-model');
        el.setAttribute('scale', '0.5 0.5 0.5');

        el.setAttribute('animation', {
            property: 'rotation',
            to: '0 360 0',
            loop: true,
            dur: 8000,
            easing: 'linear'
        });

        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.registerMonster(el);
        }

        console.log(`🐺 Monstro spawned: ${data.type} com ${data.hp} HP`);
    },

    takeDamage: function (amount, weaponId) {
        // Verificar se a arma é efetiva contra este monstro
        const weapon = GameData.inventory.weapons.find(w => w.id === weaponId);
        let actualDamage = amount;
        let isWeakness = false;

        if (weapon && weapon.weakness.includes(this.data.type)) {
            actualDamage = amount * 2; // Dano dobrado se for fraqueza
            isWeakness = true;
            console.log(`⚡ FRAQUEZA! Dano dobrado: ${actualDamage}`);
        } else if (weapon && weapon.weakness.length > 0 && !weapon.weakness.includes(this.data.type)) {
            actualDamage = Math.floor(amount * 0.3); // Dano reduzido se não for fraqueza
            console.log(`🛡️ Resistente! Dano reduzido: ${actualDamage}`);
        }

        this.data.hp -= actualDamage;

        // Efeito visual de dano
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material) {
                    const originalColor = node.material.color.clone();
                    node.material.color.setHex(isWeakness ? 0xffff00 : 0xff0000);
                    setTimeout(() => {
                        node.material.color.copy(originalColor);
                    }, 150);
                }
            });
        }

        updateMonsterHP(this.data.hp, this.data.maxHp, this.data.type);
        console.log(`💥 Monstro tomou ${actualDamage} de dano! HP restante: ${this.data.hp}`);

        if (this.data.hp <= 0) {
            this.die();
        }

        return { damage: actualDamage, isWeakness, remainingHp: this.data.hp };
    },

    die: function () {
        console.log(`💀 Monstro derrotado: ${this.data.type}`);

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

        setTimeout(() => {
            this.el.parentNode.removeChild(this.el);
            updateMonsterCount();
            hideMonsterHP();
        }, 600);
    },

    remove: function () {
        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.unregisterMonster(this.el);
        }
    }
});

// ============================================
// SISTEMA: combat
// ============================================
AFRAME.registerSystem('combat', {
    schema: {},

    init: function () {
        this.raycaster = new THREE.Raycaster();
        this.monsters = [];
        console.log('⚔️ Sistema de combate inicializado');
    },

    registerMonster: function (el) {
        if (!this.monsters.includes(el)) {
            this.monsters.push(el);
            console.log(`📝 Monstro registrado. Total: ${this.monsters.length}`);
        }
    },

    unregisterMonster: function (el) {
        const idx = this.monsters.indexOf(el);
        if (idx !== -1) {
            this.monsters.splice(idx, 1);
            console.log(`📝 Monstro removido. Total: ${this.monsters.length}`);
        }
    },

    fire: function () {
        const camera = this.el.sceneEl.camera;
        const equippedWeapon = GameData.equipped.weapon;

        if (!camera) {
            console.warn('❌ Câmera não encontrada');
            return { hit: false };
        }

        if (!equippedWeapon) {
            console.log('🤷 Nenhuma arma equipada');
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
            if (mesh) {
                meshes.push(mesh);
            }
        });

        if (meshes.length === 0) {
            console.log('🎯 Nenhum monstro na cena');
            return { hit: false, reason: 'no_monsters' };
        }

        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const hitObject = intersects[0];
            const monsterEl = this.findMonsterFromMesh(hitObject.object);

            if (monsterEl) {
                const monsterComponent = monsterEl.components['ar-monster'];
                const result = monsterComponent.takeDamage(equippedWeapon.damage, equippedWeapon.id);

                if (navigator.vibrate) {
                    navigator.vibrate(result.isWeakness ? [100, 50, 100] : [50, 30, 50]);
                }

                return {
                    hit: true,
                    monster: monsterComponent.data.type,
                    damage: result.damage,
                    isWeakness: result.isWeakness,
                    remainingHp: result.remainingHp,
                    point: hitObject.point
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

// ============================================
// SISTEMA: monster-spawner
// ============================================
AFRAME.registerSystem('monster-spawner', {
    init: function () {
        this.sceneEl = this.el.sceneEl;
        this.reticle = null;
        this.lastHitPose = null;

        this.sceneEl.addEventListener('loaded', () => {
            this.reticle = document.getElementById('reticle');
            console.log('🎯 Monster Spawner inicializado');
        });

        this.sceneEl.addEventListener('ar-hit-test-achieved', (e) => {
            if (this.reticle) {
                this.reticle.setAttribute('visible', true);
                this.lastHitPose = {
                    position: this.reticle.getAttribute('position'),
                    rotation: this.reticle.getAttribute('rotation')
                };
            }
        });
    },

    spawnMonster: function (type = null) {
        let position;
        let rotation = { x: 0, y: 0, z: 0 };

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

        const hpMap = {
            werewolf: 100,
            vampire: 80,
            ghost: 60,
            demon: 120
        };

        const monster = document.createElement('a-entity');
        monster.setAttribute('ar-monster', {
            type: monsterType,
            hp: hpMap[monsterType],
            maxHp: hpMap[monsterType]
        });
        monster.setAttribute('position', position);
        monster.setAttribute('rotation', rotation);

        const container = document.getElementById('monsters-container');
        container.appendChild(monster);

        updateMonsterCount();
        showMonsterHP(monsterType, hpMap[monsterType], hpMap[monsterType]);

        console.log(`✨ Monstro spawnado: ${monsterType} em`, position);

        return monster;
    }
});

// ============================================
// SISTEMA DE INVENTÁRIO
// ============================================

function openInventory(slotType = null) {
    const modal = document.getElementById('inventory-modal');
    modal.classList.add('visible');

    // Se um tipo foi especificado, abrir nessa tab
    if (slotType) {
        const tabMap = {
            weapon: 'weapons',
            accessory: 'accessories',
            healing: 'healing'
        };
        switchTab(tabMap[slotType] || 'weapons');
    }

    renderInventory();
}

function closeInventory() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.remove('visible');
}

function switchTab(tabName) {
    GameData.currentTab = tabName;

    // Atualizar tabs visuais
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    renderInventory();
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
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

        const itemEl = document.createElement('div');
        itemEl.className = `inventory-item ${isEquipped ? 'equipped' : ''}`;
        itemEl.dataset.itemId = item.id;

        itemEl.innerHTML = `
      <span class="item-icon">${item.icon}</span>
      <span class="item-name">${item.name}</span>
      ${item.quantity > 1 ? `<span class="item-qty">x${item.quantity}</span>` : ''}
    `;

        itemEl.addEventListener('click', () => equipItem(item.id, GameData.currentTab));

        grid.appendChild(itemEl);
    });
}

function equipItem(itemId, category) {
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

    // Se já está equipado, desequipar
    if (GameData.equipped[slotKey] && GameData.equipped[slotKey].id === itemId) {
        // Para armas, sempre manter o punho
        if (slotKey === 'weapon') {
            GameData.equipped[slotKey] = GameData.inventory.weapons[0]; // Punho
        } else {
            GameData.equipped[slotKey] = null;
        }
    } else {
        GameData.equipped[slotKey] = item;
    }

    updateEquipmentSlots();
    renderInventory();
    closeInventory();

    console.log(`✅ Equipado: ${item.name}`);
}

function updateEquipmentSlots() {
    // Atualizar slot de arma
    const weaponSlot = document.getElementById('slot-weapon');
    const weapon = GameData.equipped.weapon;
    weaponSlot.querySelector('.slot-icon').textContent = weapon ? weapon.icon : '🤛';

    // Atualizar slot de acessório
    const accessorySlot = document.getElementById('slot-accessory');
    const accessory = GameData.equipped.accessory;
    accessorySlot.querySelector('.slot-icon').textContent = accessory ? accessory.icon : '➖';

    // Atualizar slot de cura
    const healingSlot = document.getElementById('slot-healing');
    const healing = GameData.equipped.healing;
    healingSlot.querySelector('.slot-icon').textContent = healing ? healing.icon : '➖';

    // Atualizar debug
    const debugWeapon = document.getElementById('debug-weapon');
    if (debugWeapon) {
        debugWeapon.textContent = weapon ? weapon.name : 'Nenhuma';
    }

    // Aplicar filtro de acessório se necessário
    applyAccessoryFilter();
}

function applyAccessoryFilter() {
    const accessory = GameData.equipped.accessory;
    const sceneEl = document.getElementById('ar-scene');

    // Remover filtros existentes
    sceneEl.style.filter = 'none';

    if (accessory && accessory.filter) {
        switch (accessory.filter) {
            case 'grayscale':
                sceneEl.style.filter = 'grayscale(1) contrast(1.2)';
                break;
            case 'uv':
                sceneEl.style.filter = 'hue-rotate(240deg) saturate(2)';
                break;
        }
    }
}

function useHealingItem() {
    const healing = GameData.equipped.healing;
    if (!healing) {
        console.log('❌ Nenhum item de cura equipado');
        return;
    }

    if (GameData.player.hp >= GameData.player.maxHp) {
        console.log('❤️ HP já está cheio!');
        return;
    }

    // Aplicar cura
    GameData.player.hp = Math.min(GameData.player.maxHp, GameData.player.hp + healing.healAmount);

    // Reduzir quantidade
    healing.quantity--;

    // Se acabou, remover dos equipados
    if (healing.quantity <= 0) {
        const idx = GameData.inventory.healing.findIndex(h => h.id === healing.id);
        if (idx !== -1) {
            GameData.inventory.healing.splice(idx, 1);
        }
        GameData.equipped.healing = null;
    }

    updatePlayerHP();
    updateEquipmentSlots();

    console.log(`💊 Curado! +${healing.healAmount} HP. HP atual: ${GameData.player.hp}`);

    // Feedback visual
    if (navigator.vibrate) {
        navigator.vibrate([30, 20, 30]);
    }
}

function updatePlayerHP() {
    const fill = document.getElementById('player-hp-fill');
    const percent = (GameData.player.hp / GameData.player.maxHp) * 100;
    fill.style.width = `${percent}%`;

    // Mudar cor conforme HP
    if (percent < 25) {
        fill.style.background = 'linear-gradient(90deg, #ff0000, #660000)';
    } else if (percent < 50) {
        fill.style.background = 'linear-gradient(90deg, #ff6600, #cc3300)';
    } else {
        fill.style.background = 'linear-gradient(90deg, #00cc00, #44ff44)';
    }
}

// ============================================
// FUNÇÕES DE UI/HUD
// ============================================

function updateMonsterCount() {
    const count = document.querySelectorAll('[ar-monster]').length;
    document.getElementById('debug-monsters').textContent = count;
}

function showMonsterHP(name, hp, maxHp) {
    const hpContainer = document.getElementById('monster-hp');
    const nameEl = document.getElementById('monster-name');
    const fillEl = document.getElementById('monster-hp-fill');

    const nameMap = {
        werewolf: '🐺 Lobisomem',
        vampire: '🧛 Vampiro',
        ghost: '👻 Fantasma',
        demon: '😈 Demônio'
    };

    nameEl.textContent = nameMap[name] || name;
    fillEl.style.width = `${(hp / maxHp) * 100}%`;
    hpContainer.classList.add('visible');
}

function updateMonsterHP(hp, maxHp, name) {
    const fillEl = document.getElementById('monster-hp-fill');
    const percent = Math.max(0, (hp / maxHp) * 100);
    fillEl.style.width = `${percent}%`;

    if (percent < 25) {
        fillEl.style.background = 'linear-gradient(90deg, #ff0000, #660000)';
    } else if (percent < 50) {
        fillEl.style.background = 'linear-gradient(90deg, #ff6600, #cc3300)';
    }
}

function hideMonsterHP() {
    document.getElementById('monster-hp').classList.remove('visible');
}

function showHitFeedback(hit, damage = 0, isWeakness = false) {
    const feedback = document.getElementById('hit-feedback');

    if (hit) {
        feedback.textContent = isWeakness ? `⚡-${damage}` : `-${damage}`;
        feedback.className = 'hit';
        if (isWeakness) {
            feedback.style.color = '#ffff00';
        }
    } else {
        feedback.textContent = 'MISS';
        feedback.className = 'miss';
    }

    setTimeout(() => {
        feedback.className = '';
        feedback.style.color = '';
    }, 300);
}

function updateDebugShot(result) {
    const el = document.getElementById('debug-shot');
    if (result.hit) {
        el.textContent = result.isWeakness ? `CRIT! -${result.damage}` : `HIT! -${result.damage}`;
        el.style.color = result.isWeakness ? '#ffff00' : '#ff4444';
    } else {
        el.textContent = result.reason === 'no_monsters' ? 'Sem alvo' : 'Errou';
        el.style.color = '#888';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

let arSession = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Supernatural AR - Sistema de Inventário');

    const scene = document.getElementById('ar-scene');
    const startScreen = document.getElementById('start-screen');
    const enterArButton = document.getElementById('enter-ar-button');
    const exitArButton = document.getElementById('exit-ar-button');
    const arStatus = document.getElementById('ar-status');
    const hud = document.getElementById('hud');

    async function checkARSupport() {
        if (!navigator.xr) {
            arStatus.textContent = '❌ WebXR não disponível';
            enterArButton.disabled = true;
            return false;
        }

        try {
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (supported) {
                arStatus.textContent = '✅ AR disponível! Toque para iniciar';
                enterArButton.disabled = false;
                return true;
            } else {
                arStatus.textContent = '❌ AR não suportado neste dispositivo';
                enterArButton.disabled = true;
                return false;
            }
        } catch (e) {
            arStatus.textContent = '❌ Erro ao verificar AR: ' + e.message;
            enterArButton.disabled = true;
            return false;
        }
    }

    async function enterAR() {
        console.log('🚀 Entrando no modo AR...');
        arStatus.textContent = '⏳ Iniciando câmera AR...';

        try {
            if (scene.enterAR) {
                await scene.enterAR();
            } else {
                const sessionInit = {
                    requiredFeatures: ['hit-test', 'local-floor'],
                    optionalFeatures: ['dom-overlay', 'anchors'],
                    domOverlay: { root: hud }
                };

                arSession = await navigator.xr.requestSession('immersive-ar', sessionInit);
                scene.xrSession = arSession;

                arSession.addEventListener('end', () => {
                    console.log('📴 Sessão AR encerrada');
                    exitAR();
                });
            }

            startScreen.classList.add('hidden');
            hud.classList.add('visible');

            console.log('✅ Modo AR ativado!');

        } catch (e) {
            console.error('❌ Erro ao entrar em AR:', e);
            arStatus.textContent = '❌ Erro: ' + e.message;
        }
    }

    function exitAR() {
        console.log('📴 Saindo do modo AR...');

        if (arSession) {
            arSession.end();
            arSession = null;
        }

        if (scene.xrSession) {
            scene.xrSession.end();
        }

        startScreen.classList.remove('hidden');
        hud.classList.remove('visible');
    }

    scene.addEventListener('loaded', () => {
        console.log('✓ Cena A-Frame carregada');
        checkARSupport();
        updateEquipmentSlots();
        updatePlayerHP();

        // Botões principais
        enterArButton.addEventListener('click', enterAR);
        exitArButton.addEventListener('click', exitAR);

        // Botão de Spawn
        document.getElementById('spawn-button').addEventListener('click', () => {
            const spawner = scene.systems['monster-spawner'];
            if (spawner) {
                spawner.spawnMonster();
            }
        });

        // Botão de Atirar
        document.getElementById('fire-button').addEventListener('click', () => {
            const combat = scene.systems['combat'];
            if (combat) {
                const result = combat.fire();
                showHitFeedback(result.hit, result.damage, result.isWeakness);
                updateDebugShot(result);
                console.log('💥 Resultado do tiro:', result);
            }
        });

        // Slots de equipamento - abrir inventário ao clicar
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotType = slot.dataset.type;
                openInventory(slotType);
            });
        });

        // Slot de cura - usar item com long press ou duplo clique
        const healingSlot = document.getElementById('slot-healing');
        let healingPressTimer;

        healingSlot.addEventListener('touchstart', () => {
            healingPressTimer = setTimeout(() => {
                useHealingItem();
            }, 500);
        });

        healingSlot.addEventListener('touchend', () => {
            clearTimeout(healingPressTimer);
        });

        // Fechar inventário
        document.getElementById('close-inventory').addEventListener('click', closeInventory);

        // Tabs do inventário
        document.querySelectorAll('.inventory-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
            });
        });
    });

    scene.addEventListener('enter-vr', () => {
        if (scene.is('ar-mode')) {
            console.log('🎯 Modo AR ativado via A-Frame');
            startScreen.classList.add('hidden');
            hud.classList.add('visible');
        }
    });

    scene.addEventListener('exit-vr', () => {
        console.log('📴 Saiu do modo AR/VR');
        startScreen.classList.remove('hidden');
        hud.classList.remove('visible');
    });
});
