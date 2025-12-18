# Supernatural AR 🎮

Jogo de Realidade Aumentada baseado na série Supernatural, rodando diretamente no navegador Chrome mobile.

## 🚀 Tecnologias

- **A-Frame** - Framework WebXR para AR
- **Three.js** - Engine 3D (via A-Frame)
- **Vite** - Build tool
- **WebXR** - API de Realidade Aumentada

## 📱 Requisitos

- Chrome Android 79+ com ARCore
- Dispositivo com suporte a AR (Samsung S20 FE, etc.)

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (HTTPS)
npm run dev

# Build para produção
npm run build
```

## 🎮 Como Jogar

1. Acesse o site no Chrome mobile
2. Permita acesso à câmera
3. Aponte para uma superfície plana
4. Toque no botão **+** para spawnar um monstro
5. Aponte a mira para o monstro
6. Toque no botão **🔫** para atirar

## 📁 Estrutura

```
supernaturalweb/
├── public/           # Modelos 3D (.glb)
├── src/
│   └── main.js       # Lógica principal
├── index.html        # Entry point
└── vite.config.js    # Configuração Vite
```

## 🐺 Monstros Disponíveis

- Lobisomem
- Vampiro
- Fantasma
- Demônio

## 📄 Licença

MIT
