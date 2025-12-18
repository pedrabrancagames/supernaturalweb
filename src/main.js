/**
 * Supernatural AR - Main Application
 * Protótipo: Spawn de monstros em superfícies + Sistema de Tiro com Raycasting
 */

// ============================================
// COMPONENTE: ar-monster
// Representa um monstro na cena AR
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

        // Mapear tipo para modelo
        const modelMap = {
            werewolf: '#werewolf-model',
            vampire: '#vampire-model',
            ghost: '#ghost-model',
            demon: '#demon-model'
        };

        // Carregar modelo 3D
        el.setAttribute('gltf-model', modelMap[data.type] || '#werewolf-model');

        // Escala do monstro (ajustar conforme necessário)
        el.setAttribute('scale', '0.5 0.5 0.5');

        // Animação idle (rotação lenta)
        el.setAttribute('animation', {
            property: 'rotation',
            to: '0 360 0',
            loop: true,
            dur: 8000,
            easing: 'linear'
        });

        // Registrar no sistema de combate
        const combatSystem = this.el.sceneEl.systems['combat'];
        if (combatSystem) {
            combatSystem.registerMonster(el);
        }

        console.log(`🐺 Monstro spawned: ${data.type} com ${data.hp} HP`);
    },

    takeDamage: function (amount) {
        this.data.hp -= amount;

        // Efeito visual de dano (piscar vermelho)
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.traverse((node) => {
                if (node.isMesh && node.material) {
                    const originalColor = node.material.color.clone();
                    node.material.color.setHex(0xff0000);
                    setTimeout(() => {
                        node.material.color.copy(originalColor);
                    }, 150);
                }
            });
        }

        // Atualizar HUD
        updateMonsterHP(this.data.hp, this.data.maxHp, this.data.type);

        console.log(`💥 Monstro tomou ${amount} de dano! HP restante: ${this.data.hp}`);

        // Verificar se morreu
        if (this.data.hp <= 0) {
            this.die();
        }

        return this.data.hp;
    },

    die: function () {
        console.log(`💀 Monstro derrotado: ${this.data.type}`);

        // Efeito de morte (escalar para baixo e sumir)
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

        // Remover após animação
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
// Gerencia raycasting e detecção de tiros
// ============================================
AFRAME.registerSystem('combat', {
    schema: {},

    init: function () {
        this.raycaster = new THREE.Raycaster();
        this.monsters = [];
        this.tempMatrix = new THREE.Matrix4();

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

        if (!camera) {
            console.warn('❌ Câmera não encontrada');
            return { hit: false };
        }

        // Raycaster do centro da tela (mira)
        // Origem: posição da câmera
        // Direção: para onde a câmera está olhando
        const cameraPosition = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();

        camera.getWorldPosition(cameraPosition);
        camera.getWorldDirection(cameraDirection);

        this.raycaster.set(cameraPosition, cameraDirection);

        // Coletar todos os meshes dos monstros
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

        // Verificar interseções
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            // Encontrou um alvo!
            const hitObject = intersects[0];
            const monsterEl = this.findMonsterFromMesh(hitObject.object);

            if (monsterEl) {
                const monsterComponent = monsterEl.components['ar-monster'];
                const damage = 25; // Dano base

                monsterComponent.takeDamage(damage);

                // Vibrar dispositivo
                if (navigator.vibrate) {
                    navigator.vibrate([50, 30, 50]);
                }

                return {
                    hit: true,
                    monster: monsterComponent.data.type,
                    damage: damage,
                    remainingHp: monsterComponent.data.hp,
                    point: hitObject.point
                };
            }
        }

        return { hit: false, reason: 'missed' };
    },

    findMonsterFromMesh: function (mesh) {
        // Subir na hierarquia até encontrar a entity com ar-monster
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
// Gerencia spawn de monstros em superfícies
// ============================================
AFRAME.registerSystem('monster-spawner', {
    init: function () {
        this.sceneEl = this.el.sceneEl;
        this.reticle = null;
        this.lastHitPose = null;

        // Aguardar cena carregar
        this.sceneEl.addEventListener('loaded', () => {
            this.reticle = document.getElementById('reticle');
            console.log('🎯 Monster Spawner inicializado');
        });

        // Escutar hit-test
        this.sceneEl.addEventListener('ar-hit-test-start', () => {
            console.log('📍 AR Hit Test iniciado');
            document.getElementById('debug-mode').textContent = 'AR Ativo ✓';
        });

        // Guardar última pose válida
        this.sceneEl.addEventListener('ar-hit-test-achieved', (e) => {
            if (this.reticle) {
                this.reticle.setAttribute('visible', true);
                // Guardar posição/rotação do reticle
                this.lastHitPose = {
                    position: this.reticle.getAttribute('position'),
                    rotation: this.reticle.getAttribute('rotation')
                };
            }
        });
    },

    spawnMonster: function (type = null) {
        // Se não temos pose, spawnar na frente da câmera
        let position;
        let rotation = { x: 0, y: 0, z: 0 };

        if (this.lastHitPose && this.reticle && this.reticle.getAttribute('visible')) {
            // Usar posição do reticle (superfície detectada)
            const reticlePos = this.reticle.getAttribute('position');
            position = { x: reticlePos.x, y: reticlePos.y, z: reticlePos.z };
        } else {
            // Fallback: spawnar 2 metros à frente da câmera
            const camera = document.getElementById('camera');
            const cameraPos = camera.getAttribute('position');
            const cameraRot = camera.getAttribute('rotation');

            // Calcular posição à frente
            const angle = THREE.MathUtils.degToRad(cameraRot.y);
            position = {
                x: cameraPos.x - Math.sin(angle) * 2,
                y: 0,
                z: cameraPos.z - Math.cos(angle) * 2
            };
        }

        // Tipos de monstros disponíveis
        const types = ['werewolf', 'vampire', 'ghost', 'demon'];
        const monsterType = type || types[Math.floor(Math.random() * types.length)];

        // HP por tipo
        const hpMap = {
            werewolf: 100,
            vampire: 80,
            ghost: 60,
            demon: 120
        };

        // Criar entidade do monstro
        const monster = document.createElement('a-entity');
        monster.setAttribute('ar-monster', {
            type: monsterType,
            hp: hpMap[monsterType],
            maxHp: hpMap[monsterType]
        });
        monster.setAttribute('position', position);
        monster.setAttribute('rotation', rotation);

        // Adicionar à cena
        const container = document.getElementById('monsters-container');
        container.appendChild(monster);

        // Atualizar contador
        updateMonsterCount();

        // Mostrar HP do monstro
        showMonsterHP(monsterType, hpMap[monsterType], hpMap[monsterType]);

        console.log(`✨ Monstro spawnado: ${monsterType} em`, position);

        return monster;
    }
});

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

    // Traduzir nome
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

    // Mudar cor conforme HP
    if (percent < 25) {
        fillEl.style.background = 'linear-gradient(90deg, #ff0000, #660000)';
    } else if (percent < 50) {
        fillEl.style.background = 'linear-gradient(90deg, #ff6600, #cc3300)';
    }
}

function hideMonsterHP() {
    document.getElementById('monster-hp').classList.remove('visible');
}

function showHitFeedback(hit, damage = 0) {
    const feedback = document.getElementById('hit-feedback');

    if (hit) {
        feedback.textContent = `-${damage}`;
        feedback.className = 'hit';
    } else {
        feedback.textContent = 'MISS';
        feedback.className = 'miss';
    }

    // Limpar após animação
    setTimeout(() => {
        feedback.className = '';
    }, 300);
}

function updateDebugShot(result) {
    const el = document.getElementById('debug-shot');
    if (result.hit) {
        el.textContent = `HIT! -${result.damage}`;
        el.style.color = '#ff4444';
    } else {
        el.textContent = result.reason === 'no_monsters' ? 'Sem alvo' : 'Errou';
        el.style.color = '#888';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Supernatural AR - Protótipo Iniciando...');

    const scene = document.getElementById('ar-scene');

    // Aguardar cena carregar
    scene.addEventListener('loaded', () => {
        console.log('✓ Cena A-Frame carregada');

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
                showHitFeedback(result.hit, result.damage);
                updateDebugShot(result);

                console.log('💥 Resultado do tiro:', result);
            }
        });
    });

    // Verificar suporte WebXR
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            if (supported) {
                console.log('✓ WebXR AR suportado!');
                document.getElementById('debug-mode').textContent = 'WebXR OK ✓';
            } else {
                console.log('⚠️ WebXR AR não suportado neste dispositivo');
                document.getElementById('debug-mode').textContent = 'AR não suportado';
                document.getElementById('instructions').textContent =
                    'AR não suportado. Teste em Chrome Android com ARCore.';
            }
        });
    } else {
        console.log('❌ WebXR não disponível');
        document.getElementById('debug-mode').textContent = 'Sem WebXR';
    }
});
