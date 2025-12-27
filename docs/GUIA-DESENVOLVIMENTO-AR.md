# 📖 Guia Completo: Como Criar um Jogo AR como Supernatural Hunters

Este guia ensina como criar jogos de Realidade Aumentada para web, usando como base o projeto **Supernatural AR**.

---

## 📋 Sumário

1. [Tecnologias Utilizadas](#1-tecnologias-utilizadas)
2. [Estrutura do Projeto](#2-estrutura-do-projeto)
3. [Configurando o Ambiente](#3-configurando-o-ambiente)
4. [Arquitetura do Jogo](#4-arquitetura-do-jogo)
5. [Sistema de Telas (Navegação)](#5-sistema-de-telas-navegação)
6. [A-Frame: Renderização 3D e AR](#6-a-frame-renderização-3d-e-ar)
7. [Sistema de Combate](#7-sistema-de-combate)
8. [Geolocalização com Leaflet](#8-geolocalização-com-leaflet)
9. [Persistência de Dados (LocalStorage)](#9-persistência-de-dados-localstorage)
10. [Otimização de Modelos 3D](#10-otimização-de-modelos-3d)

---

## 1. Tecnologias Utilizadas

| Tecnologia | Uso | Link |
|------------|-----|------|
| **Vite** | Bundler/Dev Server rápido | https://vite.dev |
| **A-Frame** | Framework WebXR para 3D/AR | https://aframe.io |
| **Leaflet** | Mapas interativos | https://leafletjs.com |
| **gltf-transform** | Otimização de modelos 3D | https://gltf-transform.dev |

### Por que essas tecnologias?

- **Vite**: Hot reload instantâneo, build otimizado, suporte nativo a ES modules
- **A-Frame**: Abstração simples do Three.js, WebXR nativo, sistema de componentes
- **Leaflet**: Leve, touch-friendly, fácil de customizar

---

## 2. Estrutura do Projeto

```
supernaturalweb/
├── index.html          # HTML principal com todas as telas
├── package.json        # Dependências npm
├── vite.config.js      # Configuração do Vite
├── public/             # Assets estáticos
│   ├── *.glb           # Modelos 3D (monstros, itens)
│   ├── images/         # Ícones e imagens
│   └── backup-originals/ # Backup dos GLB originais
├── src/
│   ├── main.js         # Lógica principal do jogo
│   └── styles/
│       └── main.css    # Estilos CSS
└── scripts/
    └── optimize-glb.bat # Script de otimização
```

---

## 3. Configurando o Ambiente

### 3.1 Criar Projeto com Vite

```bash
# Criar projeto
npm create vite@latest meu-jogo-ar -- --template vanilla

# Entrar na pasta
cd meu-jogo-ar

# Instalar dependências
npm install
```

### 3.2 Configurar vite.config.js

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,      // Permite acesso via IP local (para testar no celular)
    https: true,     // HTTPS necessário para WebXR
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
```

### 3.3 Adicionar A-Frame no HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- A-Frame (DEVE vir antes do seu código) -->
  <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
  
  <!-- Leaflet para mapas -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <!-- Suas telas aqui -->
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## 4. Arquitetura do Jogo

### 4.1 Estado Global (GameData)

Todo o estado do jogo fica em um objeto global:

```javascript
const GameData = {
    // Dados do jogador
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
    
    // Inventário categorizado
    inventory: {
        weapons: [
            { 
                id: 'knife',           // ID único
                name: 'Faca',          // Nome exibido
                icon: '🔪',            // Emoji
                iconPath: '/images/icon-faca.png',  // Ícone PNG
                quantity: 1,           // Quantidade
                damage: 15,            // Dano base
                weakness: ['vampire'], // Monstros que são fracos a esta arma
                image: '/images/bg-faca.png'  // Imagem de fundo no HUD
            },
            // ... mais armas
        ],
        accessories: [...],
        healing: [...]
    },
    
    // Item equipado atualmente
    equipped: {
        weapon: null,
        accessory: null,
        healing: null
    },
    
    // Bestiário (dados dos monstros)
    bestiary: [
        {
            id: 'werewolf',
            name: 'Lobisomem',
            icon: '🐺',
            type: 'Licantropo',
            status: 'unknown',  // unknown, encountered, studied, defeated
            encounterCount: 0,
            lore: 'Humanos amaldiçoados...',
            weaknesses: [
                { item: 'Prata', description: 'Balas ou lâminas de prata' }
            ],
            immunities: ['Fogo', 'Armas comuns'],
            tips: 'Use o Colt com munição de prata.',
            dangerLevel: 4  // 1-5 caveiras
        },
        // ... mais monstros
    ],
    
    // Diário de eventos
    diary: [],
    
    // Controle de navegação
    currentScreen: 'splash'
};
```

---

## 5. Sistema de Telas (Navegação)

### 5.1 Estrutura HTML das Telas

Cada tela é uma `<div>` com classe `screen`:

```html
<!-- Tela de Splash (carregamento) -->
<div id="screen-splash" class="screen active">
    <div class="splash-content">
        <h1>MEU JOGO AR</h1>
        <div class="loading-bar">
            <div class="loading-fill" id="splash-progress"></div>
        </div>
    </div>
</div>

<!-- Tela Home -->
<div id="screen-home" class="screen hidden">
    <h2>Menu Principal</h2>
    <button id="btn-start-hunt">Iniciar Caçada</button>
    <button id="btn-inventory">Inventário</button>
</div>

<!-- Tela de Caçada (AR) -->
<div id="screen-hunt" class="screen hidden">
    <a-scene id="ar-scene">
        <!-- Cena 3D aqui -->
    </a-scene>
    <div id="ar-hud">
        <!-- Interface sobreposta -->
    </div>
</div>
```

### 5.2 CSS das Telas

```css
.screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.screen.hidden {
    display: none !important;
}

.screen.active {
    display: flex;
}
```

### 5.3 Função de Navegação (JavaScript)

```javascript
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
    }
    
    // Atualizar estado
    GameData.currentScreen = screenId;
    
    // Executar lógica específica da tela
    switch (screenId) {
        case 'home':
            updateHomeStats();
            break;
        case 'hunt':
            startARMode();
            break;
        case 'inventory':
            renderInventory();
            break;
        case 'map':
            initFullMap();
            break;
    }
}

// Event listeners para navegação
document.getElementById('btn-start-hunt').addEventListener('click', () => goto('hunt'));
document.getElementById('btn-inventory').addEventListener('click', () => goto('inventory'));
```

---

## 6. A-Frame: Renderização 3D e AR

### 6.1 Estrutura Básica da Cena

```html
<a-scene 
    id="ar-scene" 
    vr-mode-ui="enabled: false"
    embedded
    webxr="requiredFeatures: hit-test, local-floor; 
           optionalFeatures: dom-overlay; 
           overlayElement: #ar-hud;"
    renderer="colorManagement: true; alpha: true;"
    background="color: transparent">
    
    <!-- Assets (modelos 3D pré-carregados) -->
    <a-assets>
        <a-asset-item id="werewolf-model" src="/werewolf.glb"></a-asset-item>
        <a-asset-item id="vampire-model" src="/vampire.glb"></a-asset-item>
    </a-assets>
    
    <!-- Iluminação -->
    <a-light type="ambient" color="#fff" intensity="0.6"></a-light>
    <a-light type="directional" color="#fff" intensity="0.9" position="1 4 3"></a-light>
    
    <!-- Container para monstros -->
    <a-entity id="monsters-container"></a-entity>
    
    <!-- Câmera do jogador -->
    <a-entity id="camera-rig">
        <a-camera id="camera" position="0 1.6 0"></a-camera>
    </a-entity>
</a-scene>
```

### 6.2 Criando Componentes A-Frame Customizados

```javascript
AFRAME.registerComponent('ar-monster', {
    schema: {
        type: { type: 'string', default: 'werewolf' },
        hp: { type: 'number', default: 100 },
        maxHp: { type: 'number', default: 100 }
    },
    
    init: function() {
        const modelMap = {
            werewolf: '#werewolf-model',
            vampire: '#vampire-model'
        };
        
        const scaleMap = {
            werewolf: '2 2 2',
            vampire: '2 2 2'
        };
        
        this.el.setAttribute('gltf-model', modelMap[this.data.type]);
        this.el.setAttribute('scale', scaleMap[this.data.type]);
    },
    
    tick: function(time, deltaTime) {
        // Lógica executada a cada frame
    },
    
    takeDamage: function(amount, weaponId) {
        this.data.hp -= amount;
        this.playHitEffect();
        
        if (this.data.hp <= 0) {
            this.die();
        }
        
        return { damage: amount, remainingHp: this.data.hp };
    },
    
    playHitEffect: function() {
        this.el.setAttribute('material', 'emissive', '#ff0000');
        
        const scale = this.el.getAttribute('scale');
        const originalScale = { x: scale.x, y: scale.y, z: scale.z };
        
        this.el.setAttribute('animation__hit', {
            property: 'scale',
            from: originalScale,
            to: { x: scale.x * 1.05, y: scale.y * 1.05, z: scale.z * 1.05 },
            dur: 80,
            dir: 'alternate'
        });
        
        setTimeout(() => {
            this.el.setAttribute('material', 'emissive', '#000000');
            this.el.removeAttribute('animation__hit');
            this.el.setAttribute('scale', originalScale);
        }, 160);
    },
    
    die: function() {
        this.el.setAttribute('animation__death', {
            property: 'scale',
            to: '0 0 0',
            dur: 500,
            easing: 'easeInQuad'
        });
        
        setTimeout(() => {
            this.el.parentNode.removeChild(this.el);
        }, 500);
        
        GameData.player.monstersDefeated++;
    }
});
```

### 6.3 Spawnar Monstros Dinamicamente

```javascript
function spawnMonster(type = 'werewolf') {
    const container = document.getElementById('monsters-container');
    
    const monster = document.createElement('a-entity');
    
    const camera = document.getElementById('camera');
    const cameraPos = camera.getAttribute('position');
    const angle = Math.random() * Math.PI * 2;
    const distance = 3 + Math.random() * 2;
    
    const x = cameraPos.x + Math.sin(angle) * distance;
    const z = cameraPos.z - Math.cos(angle) * distance;
    
    monster.setAttribute('position', { x, y: 0, z });
    monster.setAttribute('ar-monster', { type: type, hp: 100, maxHp: 100 });
    monster.classList.add('monster');
    
    container.appendChild(monster);
    
    return monster;
}
```

---

## 7. Sistema de Combate

### 7.1 Fraquezas e Imunidades

```javascript
takeDamage: function(amount, weaponId) {
    const weapon = GameData.inventory.weapons.find(w => w.id === weaponId);
    let actualDamage = amount;
    let isWeakness = false;
    let isImmune = false;
    
    if (weapon && weapon.weakness && weapon.weakness.length > 0) {
        if (weapon.weakness.includes(this.data.type)) {
            actualDamage = amount * 2;
            isWeakness = true;
        } else {
            actualDamage = 0;
            isImmune = true;
        }
    }
    
    if (!isImmune) {
        this.data.hp -= actualDamage;
    }
    
    return {
        damage: actualDamage,
        isWeakness,
        isImmune,
        remainingHp: this.data.hp
    };
}
```

### 7.2 Sistema de Combos

```javascript
checkComboMechanics: function(weapon) {
    if (!weapon) return { requiresCombo: false };
    
    const type = this.data.type;
    const weaponId = weapon.id;
    
    if (type === 'demon') {
        if (weaponId === 'devil_trap') {
            return {
                requiresCombo: true,
                comboStep: 1,
                nextState: 'trapped',
                message: 'Demônio preso!',
                comboTimeout: 15000
            };
        }
        if (weaponId === 'bible' && this.monsterState === 'trapped') {
            return {
                requiresCombo: true,
                comboStep: 2,
                message: 'EXORCISMO!',
                comboDamage: 500
            };
        }
    }
    
    return { requiresCombo: false };
}
```

---

## 8. Geolocalização com Leaflet

### 8.1 Inicializar Mapa

```javascript
let fullMap = null;

function initFullMap() {
    const mapContainer = document.getElementById('full-map');
    
    fullMap = L.map(mapContainer).setView([-23.5505, -46.6333], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(fullMap);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fullMap.setView([latitude, longitude], 16);
                
                L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'player-marker',
                        html: '🧔',
                        iconSize: [30, 30]
                    })
                }).addTo(fullMap);
                
                spawnMapMonsters(latitude, longitude);
            },
            (error) => console.error('Erro:', error),
            { enableHighAccuracy: true }
        );
    }
}
```

---

## 9. Persistência de Dados (LocalStorage)

```javascript
function saveGame() {
    const saveData = {
        player: GameData.player,
        inventory: GameData.inventory,
        equipped: GameData.equipped,
        bestiary: GameData.bestiary,
        diary: GameData.diary,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('supernatural_save', JSON.stringify(saveData));
}

function loadGame() {
    const saved = localStorage.getItem('supernatural_save');
    
    if (saved) {
        const saveData = JSON.parse(saved);
        GameData.player = { ...GameData.player, ...saveData.player };
        GameData.inventory = saveData.inventory;
        GameData.equipped = saveData.equipped;
        GameData.bestiary = saveData.bestiary;
        GameData.diary = saveData.diary || [];
        return true;
    }
    return false;
}

// Auto-save a cada minuto
setInterval(saveGame, 60000);
window.addEventListener('beforeunload', saveGame);
```

---

## 10. Otimização de Modelos 3D

### 10.1 Instalar gltf-transform

```bash
npm install --save-dev @gltf-transform/cli
```

### 10.2 Otimizar Modelo

```bash
npx gltf-transform optimize modelo.glb modelo_opt.glb --compress draco --texture-compress webp
```

### Resultados Típicos

| Antes | Depois | Redução |
|-------|--------|---------|
| 75 MB | 1.5 MB | ~98% |
| 56 MB | 1 MB | ~98% |

---

## 🎮 Próximos Passos

1. Clone o projeto como base
2. Substitua os modelos 3D pelos seus
3. Customize o GameData com seus monstros/itens
4. Modifique o CSS para seu tema
5. Adicione novos sistemas

---

## 📚 Recursos

- [Documentação A-Frame](https://aframe.io/docs/)
- [Three.js](https://threejs.org/docs/)
- [WebXR API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Blender](https://www.blender.org/)
- [Sketchfab](https://sketchfab.com/)
