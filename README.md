# Supernatural AR (Project Winchester) 👻🔫

Jogo de Realidade Aumentada (WebAR) baseado na série *Supernatural*. Torne-se um caçador, rastreie monstros usando geolocalização e combata o mal usando a câmera do seu celular.

O jogo roda diretamente no navegador (Web App / PWA), sem necessidade de instalação.

---

## 📚 Documentação Oficial

Toda a informação que você precisa, seja para jogar ou para desenvolver:

*   **[📖 Manual do Caçador](docs/MANUAL-DO-CACADOR.md)**: Aprenda a jogar, usar o equipamento e sobreviver.
*   **[📓 Bestiário de Winchester](docs/BESTIARIO-DE-WINCHESTER.md)**: Detalhes sobre monstros, fraquezas, imunidades e como matá-los.
*   **[🛠️ Guia de Desenvolvimento AR](docs/GUIA-DESENVOLVIMENTO-AR.md)**: Guia técnico completo sobre a arquitetura do projeto, A-Frame, código fonte e como criar novos recursos.

---

## 🚀 Começando Rápido

### Pré-requisitos
*   Node.js instalado.
*   Um celular Android com suporte a ARCore (Google Play Services for AR) e navegador Chrome atualizado.
*   *Nota: O jogo requer HTTPS para funcionar o modo AR (WebXR).*

### Instalação e Execução

Clone o repositório e instale as dependências:

```bash
# Instalar dependências
npm install
```

Rodar em modo de desenvolvimento (hosteado na rede local):

```bash
# Isso vai gerar um link https local e um link de rede (ex: https://192.168.x.x:5173)
# Acesse o link de rede no seu celular.
npm run dev
```

---

## 📱 Funcionalidades Principais

*   **Modo AR:** Combate em tempo real sobreposto ao mundo físico.
*   **Geolocalização (GPS):** Mapa estilo "Google Maps" para encontrar monstros e loot na sua cidade.
*   **Sistema de Inventário:** Gerencie armas, itens de cura e acessórios.
*   **Sistema de Combos:** Monstros complexos exigem sequências específicas (ex: Demônio = Armadilha + Bíblia).
*   **Bestiário Dinâmico:** Registre e aprenda sobre as criaturas que enfrenta.

---

## 🛠️ Tecnologias

*   **Vite:** Build tool e Dev Server.
*   **A-Frame (WebXR):** Renderização 3D e Realidade Aumentada.
*   **Leaflet:** Sistema de mapas e geolocalização.
*   **Vanilla JS:** Lógica do jogo (sem frameworks pesados de frontend para performance máxima).

---

## 🤝 Contribuindo

Consulte o [Guia de Desenvolvimento](docs/GUIA-DESENVOLVIMENTO-AR.md) para entender a estrutura de arquivos e como adicionar novos monstros.

---

*“Salvar pessoas, caçar coisas. O negócio da família.”*
