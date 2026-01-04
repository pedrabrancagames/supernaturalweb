# 📖 Guia de Desenvolvimento - AR Game Starter Kit

Este guia explica como personalizar e estender o Starter Kit para criar seu próprio jogo de Realidade Aumentada.

---

## 📋 Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Configuração Inicial](#configuração-inicial)
3. [Personalizando o Jogo](#personalizando-o-jogo)
4. [Sistema de Inventário](#sistema-de-inventário)
5. [Sistema de Combate](#sistema-de-combate)
6. [Sistema de Missões](#sistema-de-missões)
7. [Enciclopédia/Bestiário](#enciclopédiabestiário)
8. [Sistema AR (A-Frame)](#sistema-ar-a-frame)
9. [Geolocalização](#geolocalização)
10. [Salvamento de Dados](#salvamento-de-dados)
11. [Dicas Avançadas](#dicas-avançadas)

---

## Estrutura do Projeto

```
starter-kit/
├── index.html              # HTML principal com todas as telas
├── package.json            # Dependências Node.js
├── vite.config.js          # Configuração do Vite
├── src/
│   ├── main.js             # Lógica principal do jogo
│   ├── lib/
│   │   ├── geolocation.js  # Sistema de GPS
│   │   └── navigation.js   # Navegação entre telas
│   └── styles/
│       └── main.css        # Estilos (Design System)
├── public/
│   ├── audio/              # Efeitos sonoros
│   ├── images/             # Ícones e imagens
│   └── models/             # Modelos 3D (.glb)
└── docs/
    └── GUIA-DESENVOLVIMENTO.md
```

---

## Configuração Inicial

### 1. Instalação

```bash
npm install
npm run dev
```

### 2. Objeto GameConfig

O arquivo `src/main.js` começa com o objeto `GameConfig`. Este é o coração da configuração do seu jogo:

```javascript
const GameConfig = {
    // Nome do jogo (aparece no console e meta tags)
    gameName: 'Meu Jogo Incrível',
    version: '1.0.0',
    
    // Configuração inicial do jogador
    player: {
        name: 'Aventureiro',
        startingHp: 100,
        startingLevel: 1
    },
    
    // Dificuldade: 'easy', 'normal', 'hard'
    difficulty: 'normal',
    
    // Liga/desliga funcionalidades
    features: {
        geolocation: true,    // Usar GPS?
        quests: true,         // Sistema de missões?
        bestiary: true,       // Enciclopédia?
        diary: true,          // Diário de eventos?
        sound: true,          // Sons?
        vibration: true       // Vibração?
    }
};
```

---

## Personalizando o Jogo

### Alterando Cores e Visual

Edite as variáveis CSS em `src/styles/main.css`:

```css
:root {
    /* Suas cores principais */
    --primary: #6366f1;        /* Azul-violeta */
    --primary-dark: #4f46e5;
    --primary-light: #818cf8;
    
    /* Cores secundárias */
    --secondary: #10b981;      /* Verde */
    --accent: #f59e0b;         /* Laranja */
    
    /* Fundos */
    --bg-dark: #0a0a0a;
    --bg-card: rgba(20, 20, 20, 0.95);
}
```

### Exemplos de Paletas

**Jogo de Terror:**
```css
--primary: #dc2626;
--primary-dark: #991b1b;
--bg-dark: #000000;
```

**Jogo de Fantasia:**
```css
--primary: #8b5cf6;
--primary-dark: #6d28d9;
--bg-dark: #1e1b4b;
```

**Jogo Militar/Sobrevivência:**
```css
--primary: #22c55e;
--primary-dark: #15803d;
--bg-dark: #14532d;
```

### Alterando Fontes

No `index.html`, modifique o Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@400;700&display=swap" rel="stylesheet">
```

No CSS:

```css
:root {
    --font-primary: 'SuaFonte', sans-serif;
    --font-display: 'SuaFonteTitulos', sans-serif;
}
```

**Sugestões de Fontes por Tema:**
- Terror: `Creepster`, `Nosifer`, `Eater`
- Fantasia: `Cinzel`, `MedievalSharp`, `Uncial Antiqua`
- Sci-Fi: `Orbitron`, `Audiowide`, `Rajdhani`
- Casual: `Outfit`, `Poppins`, `Nunito`

---

## Sistema de Inventário

### Estrutura de um Item

```javascript
// Arma
{
    id: 'sword',              // ID único (usado internamente)
    name: 'Espada',           // Nome exibido
    icon: '⚔️',               // Emoji (fallback)
    iconPath: '/images/icon-sword.png',  // Ícone personalizado
    quantity: 1,              // Quantidade
    damage: 25,               // Dano base
    weakness: ['slime', 'goblin'],  // IDs de inimigos vulneráveis
    image: '/images/bg-sword.png',  // Imagem de fundo no AR
    special: 'magic',         // Efeito especial (opcional)
    canCollect: true          // Pode ser coletado?
}

// Acessório
{
    id: 'torch',
    name: 'Tocha',
    icon: '🔦',
    iconPath: '/images/icon-torch.png',
    quantity: 1,
    effect: 'reveal_hidden'   // Efeito quando equipado
}

// Item de Cura
{
    id: 'potion',
    name: 'Poção',
    icon: '🧪',
    quantity: 3,
    healAmount: 25            // HP restaurado
}
```

### Adicionando um Novo Item

1. Adicione ao array correspondente em `GameData.inventory`:

```javascript
inventory: {
    weapons: [
        // ... itens existentes
        {
            id: 'laser_gun',
            name: 'Pistola Laser',
            icon: '🔫',
            iconPath: '/images/icon-laser.png',
            quantity: 0,
            damage: 50,
            weakness: ['robot', 'alien'],
            image: '/images/bg-laser.png',
            special: 'energy',
            canCollect: true
        }
    ],
    // ...
}
```

2. Crie as imagens necessárias:
   - `/public/images/icon-laser.png` (48x48 ou 64x64)
   - `/public/images/bg-laser.png` (imagem grande para o HUD AR)

### Efeitos Especiais de Armas

O campo `special` pode ter valores como:

| Valor | Descrição |
|-------|-----------|
| `magic` | Bypassa imunidades físicas |
| `fire` | Causa dano de fogo |
| `ice` | Causa dano de gelo |
| `holy` | Efetivo contra mortos-vivos |
| `trap` | Imobiliza o inimigo |

Para implementar efeitos, edite a função `attack()`:

```javascript
function attack() {
    // ... código existente
    
    // Checar efeito especial
    if (weapon.special === 'fire') {
        // Aplicar dano de fogo
        enemy.onFire = true;
    }
}
```

---

## Sistema de Combate

### Fórmula de Dano

```
Dano Final = Dano Base × Modificador de Dificuldade × Multiplicador de Fraqueza
```

- **Dano Base**: Definido no item
- **Mod. Dificuldade**: 
  - Easy: 1.5x
  - Normal: 1.0x
  - Hard: 0.75x
- **Mult. Fraqueza**: 2.0x se o inimigo é fraco à arma

### Personalizando o Combate

Edite a função `attack()` em `src/main.js`:

```javascript
function attack() {
    // Pegar arma equipada
    const weaponId = GameData.equipped.weapon || 'fist';
    const weapon = GameData.inventory.weapons.find(w => w.id === weaponId);
    
    // Calcular dano base
    let damage = weapon.damage;
    
    // Aplicar modificador de dificuldade
    const diffMod = GameConfig.difficultyModifiers[GameConfig.difficulty];
    damage *= diffMod.playerDamage;
    
    // Checar crítico (seu próprio sistema!)
    const isCritical = Math.random() < 0.1; // 10% de chance
    if (isCritical) {
        damage *= 2;
    }
    
    // Checar fraqueza do inimigo
    const isWeak = weapon.weakness.includes(enemy.id);
    if (isWeak) {
        damage *= 2;
    }
    
    // Aplicar dano
    enemy.currentHp -= damage;
    
    // ... resto do código
}
```

### Adicionando Habilidades Especiais

```javascript
function useSpecialAbility(abilityId) {
    switch(abilityId) {
        case 'fireball':
            // Dano em área
            GameData.arState.spawnedEntities.forEach(entity => {
                if (entity.type === 'enemy') {
                    entity.currentHp -= 30;
                }
            });
            break;
            
        case 'heal_aura':
            // Cura gradual
            GameData.player.hp = Math.min(
                GameData.player.maxHp,
                GameData.player.hp + 50
            );
            break;
    }
}
```

---

## Sistema de Missões

### Estrutura de uma Missão

```javascript
{
    id: 'hunt_dragons',       // ID único
    title: 'Caçador de Dragões',
    description: 'Derrote 3 dragões para provar seu valor.',
    type: 'kill',             // Tipo: 'kill', 'collect', 'walk', 'custom'
    target: 'dragon',         // ID do alvo (ou 'any')
    required: 3,              // Quantidade necessária
    progress: 0,              // Progresso atual
    reward: {
        xp: 500,
        item: 'dragon_sword'  // ID do item de recompensa
    },
    completed: false
}
```

### Tipos de Missão

| Tipo | Descrição |
|------|-----------|
| `kill` | Derrotar inimigos |
| `collect` | Coletar itens |
| `walk` | Caminhar X metros |
| `custom` | Lógica personalizada |

### Criando uma Missão Personalizada

1. Adicione a missão:

```javascript
{
    id: 'photo_ghost',
    title: 'Fotógrafo Espiritual',
    description: 'Fotografe um fantasma usando a câmera especial.',
    type: 'custom',
    target: 'ghost',
    required: 1,
    progress: 0,
    reward: { xp: 200, item: 'ghost_detector' },
    completed: false
}
```

2. Implemente a lógica personalizada:

```javascript
function useCamera() {
    // Verificar se há fantasma na frente
    const enemy = GameData.arState.currentEnemy;
    if (enemy && enemy.id === 'ghost') {
        // Atualizar progresso da missão
        updateCustomQuestProgress('photo_ghost');
    }
}

function updateCustomQuestProgress(questId) {
    const quest = GameData.quests.active.find(q => q.id === questId);
    if (quest && quest.type === 'custom') {
        quest.progress++;
        if (quest.progress >= quest.required) {
            completeQuest(questId);
        }
    }
}
```

---

## Enciclopédia/Bestiário

### Estrutura de um Inimigo

```javascript
{
    id: 'dragon',             // ID único
    name: 'Dragão',           // Nome exibido
    icon: '🐉',               // Emoji
    type: 'Mítico',           // Categoria
    status: 'unknown',        // unknown, encountered, studied, defeated
    encounterCount: 0,        // Vezes encontrado
    hp: 500,                  // HP máximo
    damage: 50,               // Dano do ataque
    model: 'dragon-model',    // ID do modelo 3D
    lore: 'Descrição longa do inimigo...',
    weaknesses: ['Gelo', 'Espada Mágica'],
    immunities: ['Fogo', 'Veneno'],
    tips: 'Use armas de gelo. Cuidado com seu sopro de fogo!',
    dangerLevel: 5            // 1-5 (nível de perigo)
}
```

### Adicionando um Novo Inimigo

1. Adicione ao array `GameData.bestiary`
2. Adicione o modelo 3D em `/public/models/`
3. Registre o asset no HTML:

```html
<a-assets>
    <a-asset-item id="dragon-model" src="/models/dragon.glb"></a-asset-item>
</a-assets>
```

### Status do Inimigo

| Status | Significado |
|--------|-------------|
| `unknown` | Nunca encontrado |
| `encountered` | Encontrado pelo menos 1 vez |
| `studied` | Informações parciais reveladas |
| `defeated` | Derrotado pelo menos 1 vez |

---

## Sistema AR (A-Frame)

### Componentes A-Frame

O A-Frame usa uma arquitetura de entidade-componente. Os principais elementos:

```html
<!-- Cena AR -->
<a-scene id="ar-scene" embedded webxr="...">

    <!-- Assets (modelos, texturas, etc.) -->
    <a-assets>
        <a-asset-item id="meu-modelo" src="/models/modelo.glb"></a-asset-item>
    </a-assets>
    
    <!-- Iluminação -->
    <a-light type="ambient" color="#fff" intensity="0.6"></a-light>
    
    <!-- Câmera -->
    <a-camera id="camera" position="0 1.6 0"></a-camera>
    
    <!-- Container de entidades do jogo -->
    <a-entity id="entities-container"></a-entity>
    
</a-scene>
```

### Criando um Componente A-Frame Customizado

```javascript
// Registrar componente de inimigo
AFRAME.registerComponent('enemy', {
    schema: {
        type: { type: 'string', default: 'slime' },
        hp: { type: 'number', default: 100 },
        damage: { type: 'number', default: 10 }
    },
    
    init: function() {
        // Inicialização
        this.currentHp = this.data.hp;
        
        // Carregar modelo
        this.el.setAttribute('gltf-model', `#${this.data.type}-model`);
        
        // Adicionar animação
        this.el.setAttribute('animation', {
            property: 'rotation',
            to: '0 360 0',
            loop: true,
            dur: 4000,
            easing: 'linear'
        });
    },
    
    tick: function(time, delta) {
        // Chamado a cada frame
        // Use para IA, movimentação, etc.
    },
    
    takeDamage: function(damage) {
        this.currentHp -= damage;
        if (this.currentHp <= 0) {
            this.die();
        }
    },
    
    die: function() {
        // Animação de morte
        this.el.setAttribute('animation', {
            property: 'scale',
            to: '0 0 0',
            dur: 500
        });
        
        // Remover após animação
        setTimeout(() => {
            this.el.parentNode.removeChild(this.el);
        }, 500);
    }
});
```

### Spawning Dinâmico de Entidades

```javascript
function spawnEnemy(type, position) {
    const container = document.getElementById('entities-container');
    
    // Criar entidade
    const entity = document.createElement('a-entity');
    entity.setAttribute('enemy', { type: type, hp: 100 });
    entity.setAttribute('position', position);
    entity.setAttribute('scale', '0.5 0.5 0.5');
    
    // Adicionar à cena
    container.appendChild(entity);
    
    return entity;
}
```

---

## Geolocalização

### Usando o Módulo de Geolocalização

```javascript
import { 
    startWatching, 
    stopWatching, 
    getCurrentPosition,
    onPositionUpdate,
    calculateDistance,
    getRandomPointInRadius
} from './lib/geolocation.js';

// Iniciar monitoramento
startWatching();

// Reagir a atualizações de posição
onPositionUpdate((lat, lng, accuracy) => {
    console.log(`Nova posição: ${lat}, ${lng}`);
    
    // Spawnar inimigo próximo
    const spawnPoint = getRandomPointInRadius(lat, lng, 50);
    createEnemyAtLocation(spawnPoint.lat, spawnPoint.lng);
});

// Calcular distância até um ponto
const distance = calculateDistance(
    playerLat, playerLng,
    enemyLat, enemyLng
);

if (distance < 10) {
    // Jogador está perto do inimigo!
    startCombat();
}
```

### Gerando Spawns Baseados em Localização

```javascript
function generateNearbySpawns(count) {
    const pos = getPosition();
    if (!pos) return [];
    
    const spawns = [];
    for (let i = 0; i < count; i++) {
        const point = getRandomPointInRadius(
            pos.lat, 
            pos.lng, 
            GameConfig.spawn.spawnRadius
        );
        
        spawns.push({
            type: getRandomEnemyType(),
            lat: point.lat,
            lng: point.lng
        });
    }
    
    return spawns;
}
```

---

## Salvamento de Dados

### localStorage

O Starter Kit usa `localStorage` para salvar o progresso:

```javascript
// Salvar
function saveGameData() {
    localStorage.setItem('ar_game_data', JSON.stringify(GameData));
}

// Carregar
function loadGameData() {
    const saved = localStorage.getItem('ar_game_data');
    if (saved) {
        Object.assign(GameData, JSON.parse(saved));
    }
}
```

### Migrando para IndexedDB (para mais dados)

```javascript
const DB_NAME = 'ar_game_db';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            db.createObjectStore('gameData', { keyPath: 'id' });
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveToIndexedDB(data) {
    const db = await openDB();
    const tx = db.transaction('gameData', 'readwrite');
    tx.objectStore('gameData').put({ id: 'main', ...data });
}
```

---

## Dicas Avançadas

### 1. Performance em Mobile

```javascript
// Reduzir qualidade em mobile
if (window.innerWidth < 768) {
    const scene = document.getElementById('ar-scene');
    scene.setAttribute('renderer', 'antialias: false');
}
```

### 2. Otimizando Modelos 3D

Use o gltf-pipeline para otimizar modelos:

```bash
npx gltf-pipeline -i modelo.glb -o modelo-otimizado.glb --draco.compressionLevel 10
```

### 3. Lazy Loading de Assets

```javascript
// Carregar assets sob demanda
function loadEnemyModel(enemyType) {
    return new Promise((resolve) => {
        const asset = document.createElement('a-asset-item');
        asset.id = `${enemyType}-model`;
        asset.src = `/models/${enemyType}.glb`;
        asset.onload = () => resolve();
        
        document.querySelector('a-assets').appendChild(asset);
    });
}
```

### 4. Debug Mode

```javascript
// Adicionar modo debug
if (location.search.includes('debug=true')) {
    window.DEBUG = true;
    
    // Mostrar FPS
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    
    // Expor dados para console
    window.GameData = GameData;
    window.GameConfig = GameConfig;
}
```

### 5. PWA (Progressive Web App)

Para tornar seu jogo instalável, crie um `manifest.json`:

```json
{
    "name": "Meu Jogo AR",
    "short_name": "JogoAR",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0a0a0a",
    "theme_color": "#6366f1",
    "icons": [
        {
            "src": "/images/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

---

## 🎉 Próximos Passos

1. **Personalize** o `GameConfig` com seu tema
2. **Adicione** seus inimigos e itens
3. **Crie** suas missões
4. **Teste** em um dispositivo móvel
5. **Deploy** no Vercel ou Netlify

Boa sorte com seu jogo! 🎮
