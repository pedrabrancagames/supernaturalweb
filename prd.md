# PRD – Product Requirements Document

## Nome do Projeto
**Supernatural AR (Project Winchester)**

- **Plataforma:** Navegador Mobile (Web App / PWA)  
- **Foco:** Android  
- **Tema:** Supernatural (Série de TV)  
- **Status:** Rascunho Inicial  
- **Dispositivo:** Samsung S20 fe com proessador Snapdragon

---

## 1. Visão Geral do Produto

Um jogo de Realidade Aumentada (AR) baseado em geolocalização, rodando diretamente no navegador (sem instalação de APK).  
O jogador assume o papel de um caçador cujo objetivo é rastrear, estudar e eliminar monstros do folclore da série *Supernatural*, utilizando ferramentas e armas coletadas, gerenciando inventário e consultando um diário de caça.

---

## 2. Arquitetura Técnica (Foco: Custo Zero)

O jogo será hospedado nos planos gratuitos da Vercel e Supabase, então o projeto deve se adequar as limitações dos planos gratuitos.

---

## 3. Fluxo de Usuário (Sitemap)

### 3.1. Tela de Boas-vindas (Splash Screen)

**Elementos:**
- Logo do jogo  
- Imagem de fundo temática  
- Botão **"Entrar"**  
  - Login Anônimo

### 3.2. Tela Home (Base de Operações)

Menu principal com navegação para as 6 funcionalidades principais:

1. Iniciar Caçada (Ação Principal)  
2. Mapa (Navegação Global)  
3. Inventário (Gerenciamento de Recursos)  
4. Casos (Bestiário / Lore)  
5. Diário (Histórico)  
6. Perfil (Configurações)  

---

## 4. Módulos do Sistema

### 4.1. Módulo: Iniciar Caçada (Modo AR)

**Core feature do jogo.**  
Ao ativar, a câmera do celular é aberta e elementos digitais são sobrepostos ao mundo real.

#### Interface (HUD)

- **Marcadores de Vida**
  - Jogador: Barra de HP no topo esquerdo estilizada com o tema da serie
  - Monstro: Barra de HP no topo direito estilizada com o tema da serie (visível apenas em combate/proximidade)

- **Logotipo do Jogo**
  - Posicionado no topo central, entre as duas barras de HP. Pode ser o pentagrama que aparece na série.

- **Mini-mapa (Radar)**
  - Localização: Rodapé esquerdo  
  - Formato: Redondo  
  - Lógica:
    - Jogador fixo no centro
    - Mapa gira conforme a bússola do celular
    - Mostra ícones de monstros e loots próximos

- **Botão de Ação**
  - Localização: Rodapé central  
  - Formato: Redondo  
  - Executa a ação referente ao item selecionado no inventário do tipo arma

- **Botões de Inventário**
  - Localização: Rodapé direito  
  - Formato: Redondo  
  - Abre um modal rápido de inventário sem sair do modo AR

- **Botões de assessorios**
  - Localização: Acima do botão de inventário  
  - Formato: Redondo  
  - Quando o jogador seleciona um assessorio o botão fica visivel no modo ar com o iconde do assessorio escolhido. O jogador deve clicar para ativar ou desativar o assessorio.

- **Botões de Cura**
  - Localização: Acima do botão de assessorios  
  - Formato: Redondo  
  - Quando o jogador seleciona um item de cura o botão fica visivel no modo ar com o iconde o item de cura escolhido. O jogador deve clicar para recuperar pontos de vida.

#### Tipos de Itens no Inventário

O inventário deve ser dividido em 3 tipos:

1. **Armas**
   - Exemplo: Espingarda
   - Exibição em AR:
     - Imagem PNG transparente no rodapé
     - Exemplo: mãos segurando uma espingarda, atrás dos botões

2. **Assessorios**
   - Exemplo: Câmera
   - Efeito em AR:
     - Aplica filtro visual (ex: preto e branco)
     - Revela monstros invisíveis a olho nu
   - Exemplo: lanterna UV
     - Aplica filtro visual (ex: luz uv)
     - Revela mensagens ocultas, só possivel ver com a lanterna UV.

3. **Objetos de Cura**
   - Exemplo: Frasco de remédio
   - Efeito em AR:
     - Recupera pontos de vida ao ser utilizado

**Regras de Seleção:**
- O jogador pode escolher até um item de cada tipo::
  - arma
  - assessorio
  - cura 

---

### 4.2. Módulo: Mapa (Exploração)

- **Visualização:** Mapa 2D em tela cheia (estilo GPS)
- **Interações:**
  - Zoom (pinça)
  - Pan (arrastar)
- **Funcionalidades:**
  - Mostra a geolocalização atual do jogador
- **Pins / Marcadores:**
  - Monstros (ícones vermelhos)
  - Objetos coletáveis / Loot (ícones amarelos ou verdes)

---

### 4.3. Módulo: Inventário

- **Grid de Itens**
  - Lista visual de todos os itens coletados
  - Exemplos:
    - Sal
    - Ferro
    - Prata
    - Água Benta
    - Isqueiro
  - os item devem estar divididos em 3 tipos.

---

### 4.4. Módulo: Casos (Bestiário)

- **Lista de Monstros**
  - Vampiro
  - Lobisomem
  - Fantasma
  - Djinn

- **Detalhe do Caso (Dossiê)**
  - **Lore:** Origem e história
  - **Fraqueza:** Como derrotar o monstro  
    - Exemplo:
      - Fantasma: Sal + Queimar ossos
      - Lobisomem: Prata
  - **Dica:** Essencial para preparação antes da caçada AR

---

### 4.5. Módulo: Diário (Logs)

- **Automação:** Registro automático de eventos importantes

**Estrutura do Log:**
- Data/Hora (Timestamp)
- Evento (ex: *Derrotou Wendigo*)
- Local:
  - Nome da rua (se possível)
  - Ou Latitude / Longitude
- Status:
  - *Saiu ileso*
  - *Sofreu danos graves*

---

### 4.6. Módulo: Perfil

- **Dados do Usuário**
  - Nome de Caçador (Display Name)
  - E-mail
  - Nível (opcional)

- **Configurações**
  - Sensibilidade da câmera
  - Ligar / desligar som

---

## 5. Regras de Negócio e Lógica de Jogo

### 5.1. Lógica de Combate

- O dano só é aplicado se o item usado for a fraqueza correta do monstro
- Exemplo:
  - Ferro contra Lobisomem → 0 de dano
  - Prata contra Lobisomem → Dano crítico

### 5.2. Lógica de “Mãos Vazias”

- Ícone de mão selecionado → ação **Interagir**
- Botão de ação próximo a loot:
  - Item é adicionado ao inventário

### 5.3. Persistência

- Todo item gasto (balas, sal, óleo, etc.) deve ser descontado imediatamente no banco de dados (Supabase)
- Objetivo: evitar cheating ao recarregar a página

---

## 6. Requisitos Não Funcionais

- **Performance**
  - Modelos 3D leves (.glb / .gltf comprimidos)

- **Permissões**
  - Solicitar câmera e localização no primeiro acesso
  - Tratar recusas com mensagens amigáveis

- **Responsividade**
  - Layout adaptável a diferentes telas Android
  - Botões na “zona do polegar” (parte inferior)

---

## 7. Mecânicas de Combate

- Monstros são modelos 3D no formato `.glb`

---

### 7.1. Fantasmas

- **Item:** Filmadora Antiga

**Fluxo de Uso:**
1. Jogador encontra e coleta a Filmadora
2. Seleciona a Filmadora no Inventário
3. No modo AR:
   - Tela aplica filtro Grayscale com granulação (ou similar)
   - Fantasmas tornam-se visíveis
   - Jogador deve selecionar uma barra de ferro no inventário para atacar o fontasma usnado o botão de ação.
   - Ao deselecionar a câmera, o filtro sai e o monstro desaparece

---

### 7.2. Demônios

- **Fluxo de Derrota:**
  1. Selecionar **Selo da Armadilha do Diabo**
  2. Apontar para o demônio e usar o botão de ação
  3. Selo aparece no chão e imobiliza o demônio
  4. Selecionar a **Bíblia**
  5. Ao usar o botão de ação:
     - Toca áudio de oração em latim
     - Demônio é exorcizado

---

### 7.3. Bruxas

- **Fluxo de Derrota:**
  1. Encontrar e coletar sacos de maldição espalhados pelo chão
  2. Destruir os sacos
  3. Bruxa torna-se vulnerável
  4. Atacar com qualquer arma que mate um ser humano, como faca e revolver.

> Enquanto os sacos não forem destruídos, a bruxa pode atacar, mas não recebe dano.

---

### 7.4. Cão do Inferno

- **Fluxo de Derrota:**
  1. Selecionar **Saco de Sal**
  2. No modo AR, desenhar um círculo no chão
  3. O círculo impede ataques do Cão do Inferno
  4. Selecionar **Lâmina de Anjo** para derrotá-lo

---

### 7.5. Demônio da Encruzilhada

- **Fluxo de Derrota:**
  1. Ir até uma encruzilhada detectada (OpenStreetMap)
  2. Selecionar a **Caixa com Foto**
  3. Enterrar a caixa no chão (modo AR)
  4. Demônio aparece
  5. Usar **Selo da Armadilha do Diabo** para imobilizar
  6. Selecionar a **Bíblia**
  7. Oração em latim exorciza o demônio

---

### 7.6. Lobisomem

- **Derrota:**
  - Selecionar revólver com **bala de prata**
  - Atirar no lobisomem usando o botão de ação

---

### 7.7. Vampiro

- **Fluxo de Derrota:**
  1. Atacar com **Lâmina com Sangue do Morto**
  2. Reduzir HP do vampiro a zero
  3. Vampiro fica imobilizado
  4. Finalizar com **Estaca de Madeira**

---

### 7.8. Wendigo

- **Derrota:**
  - Selecionar Garrafa com Líquido Inflamável como arma
  - Selecionar Isqueiro como assessorio
  - Atacar com o botão de ação para jogar liquido inflamavel e depois clicar no botão de assessorio para acender o isqueiro.

---
