# 🎮 AR Game Starter Kit

Um kit inicial completo para criar jogos de Realidade Aumentada (AR) para web, baseado no sistema do Supernatural AR.

## ⚡ Recursos Incluídos

### 🎯 Sistema de Combate
- Dano baseado em fraquezas e imunidades
- Feedback visual de acertos/críticos/misses
- Sistema de HP para jogador e inimigos

### 🎒 Sistema de Inventário
- Categorias: Armas, Acessórios, Itens de Cura
- Equipamento com efeitos especiais
- HUD dinâmico no modo AR

### 📖 Sistema de Enciclopédia (Bestiário)
- Fichas de inimigos com informações detalhadas
- Status de descoberta (desconhecido/encontrado/derrotado)
- Sistema de fraquezas e imunidades

### 📜 Sistema de Missões (Quests)
- Missões ativas, disponíveis e completadas
- Progresso e recompensas
- Tracker visual no modo AR

### 🗺️ Sistema de Mapa
- Integração com Leaflet
- Geolocalização real
- Marcadores para inimigos e loot

### 📱 Interface Completa
- Tela de Splash com loading
- Home (Base de Operações)
- Tela de Mapa
- Inventário completo
- Perfil e Configurações
- Diário de eventos

## 📁 Estrutura do Projeto

```
starter-kit/
├── src/
│   ├── main.js              # Lógica principal do jogo
│   ├── lib/
│   │   ├── geolocation.js   # Sistema de GPS
│   │   └── navigation.js    # Navegação entre telas
│   └── styles/
│       └── main.css         # Estilos do jogo
├── public/
│   ├── audio/               # Arquivos de áudio
│   ├── images/              # Ícones e imagens
│   └── models/              # Modelos 3D (.glb)
├── docs/
│   └── GUIA-DESENVOLVIMENTO.md
├── index.html               # HTML principal
├── package.json             # Dependências
└── vite.config.js           # Configuração do Vite
```

## 🚀 Como Usar

### 1. Copie o Starter Kit
```bash
# Copie a pasta starter-kit para um novo diretório
cp -r starter-kit meu-novo-jogo
cd meu-novo-jogo
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Execute em Modo de Desenvolvimento
```bash
npm run dev
```

### 4. Acesse no Navegador
Abra `http://localhost:5173` (ou a URL mostrada no terminal)

## ⚙️ Configuração

### Personalizando o GameConfig

Edite o arquivo `src/main.js` e modifique o objeto `GameConfig`:

```javascript
const GameConfig = {
    // Nome do seu jogo
    gameName: 'Meu Jogo AR',
    
    // Versão
    version: '1.0.0',
    
    // Configurações do jogador inicial
    player: {
        name: 'Jogador',
        startingHp: 100,
        startingLevel: 1
    },
    
    // Dificuldade (easy, normal, hard)
    difficulty: 'normal',
    
    // Habilitar funcionalidades
    features: {
        geolocation: true,
        quests: true,
        bestiary: true,
        diary: true
    }
};
```

### Adicionando Novos Inimigos

No objeto `GameData.bestiary`, adicione novos inimigos:

```javascript
{
    id: 'meu-inimigo',
    name: 'Nome do Inimigo',
    icon: '👾',
    type: 'Tipo',
    hp: 100,
    damage: 10,
    weaknesses: ['item_id_1', 'item_id_2'],
    immunities: ['item_id_3'],
    model: 'meu-modelo-3d',
    lore: 'História do inimigo...',
    tips: 'Dicas de como derrotar...',
    dangerLevel: 3
}
```

### Adicionando Novos Itens

No objeto `GameData.inventory.weapons`, adicione novos itens:

```javascript
{
    id: 'minha-arma',
    name: 'Nome da Arma',
    icon: '⚔️',
    iconPath: '/images/icon-minha-arma.png',
    damage: 25,
    weakness: ['inimigo_id_1'],
    image: '/images/bg-minha-arma.png',
    quantity: 1,
    special: null // ou 'trap', 'exorcism', 'ignite', etc.
}
```

### Adicionando Modelos 3D

1. Adicione o arquivo `.glb` em `/public/models/`
2. Registre o asset no HTML:
```html
<a-asset-item id="meu-modelo-model" src="/models/meu-modelo.glb"></a-asset-item>
```
3. Referencie o modelo no bestiário

## 🎨 Personalização Visual

### Cores e Tema

Edite as variáveis CSS em `src/styles/main.css`:

```css
:root {
    /* Cores Primárias */
    --primary: #ff0000;
    --primary-dark: #990000;
    
    /* Cores de Fundo */
    --bg-dark: #0a0a0a;
    --bg-card: rgba(20, 20, 20, 0.9);
    
    /* Cores de Texto */
    --text-primary: #ffffff;
    --text-secondary: #888888;
    
    /* Cores de Status */
    --hp-color: #ff3333;
    --hp-gradient: linear-gradient(90deg, #8b0000, #ff0000);
    
    /* Efeitos */
    --glow-color: rgba(255, 0, 0, 0.5);
}
```

### Fontes

Substitua as fontes no `<head>` do `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=SuaFonte:wght@400;700&display=swap" rel="stylesheet">
```

## 📖 Documentação Detalhada

Consulte os arquivos em `/docs/` para:

- **GUIA-DESENVOLVIMENTO.md** - Guia completo de desenvolvimento
- **API-REFERENCIA.md** - Documentação das funções
- **SISTEMA-COMBATE.md** - Como funciona o combate

## 🔧 Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **A-Frame** | Renderização 3D e AR |
| **Leaflet** | Mapas interativos |
| **Vite** | Build e dev server |
| **Vanilla JS** | Lógica do jogo |
| **CSS3** | Estilização moderna |

## 📱 Compatibilidade

- ✅ Chrome (Android) - WebXR completo
- ✅ Safari (iOS) - WebXR parcial
- ✅ Firefox - WebXR completo
- ⚠️ Browsers antigos - Modo fallback sem AR

## 📝 Licença

MIT License - Use livremente para seus projetos!

---

Desenvolvido com 💀 pelo time Pedra Branca Games
