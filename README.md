# Titan Web Coletor

Aplicação web responsiva e otimizada para operação em **coletores de dados industriais** (coletores de código de barras a laser). O sistema integra operações de conferência de tabaco (PMD), picking e reabastecimento.

---

## 🚀 Funcionalidades

### 1. 🚜 PMD (Conferência de Tabaco)
- Seleção e listagem de ordens de conferência.
- Leitura rápida de materiais com leitor de código de barras.
- Validação automática de lote (`10...`) e código do material.
- Animações visuais de confirmação verde e tratamento claro de erros.

### 2. 📦 Abastecimento
- **Reabastecimento**:
  - Leitura do SU do Palete (`POST /supply/pick-refueling/{su}`).
  - Apresentação em destaque do Módulo de Abastecimento.
  - Confirmação de abastecimento por módulo (`POST /supply/supply-material`).
- **Picking**:
  - Consulta automática de tarefas de picking (`POST /supply/claim`).
  - Suporte a múltiplos status:
    - **`CLAIMED`**: Leitura e confirmação de SU (`POST /supply/picking`).
    - **`PICKING`**: Leitura e confirmação de Local/Posição (`POST /supply/place-in-buffer`).
  - Ciclo contínuo automatizado com recarregamento de tarefas.

---

## 📱 Otimizações para Coletores de Dados

- **Input Otimizado sem Teclado Virtual**: Atributo `inputMode="none"` evita a abertura indesejada do teclado virtual na tela do coletor.
- **Foco Contínuo Ininterrupto**: O campo de leitura mantém foco automático após cada leitura ou evento `blur`.
- **Submissão por Enter**: Suporte nativo ao caractere de término de scanner laser (`Enter`).

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# API Principal (FastAPI - Conferência PMD)
VITE_API_URL=http://localhost:25566

# API de Abastecimento (Spring Boot - Picking / Reabastecimento)
VITE_SUPPLY_API_URL=http://localhost:8081
```

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- **Node.js**: v20+ ou v22+
- **npm**: v10+

### Instalação e Execução
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (porta 3001)
npm run dev

# 3. Compilar projeto para produção
npm run build
```

---

## 🐳 Execução com Docker

### 1. Usando Docker Compose (Recomendado)

```bash
# Subir a aplicação na porta 3001
docker compose up -d --build
```

A aplicação estará disponível em `http://localhost:3001`.

### 2. Usando Docker diretamente

```bash
# Compilar a imagem Docker
docker build \
  --build-arg VITE_API_URL=http://localhost:25566 \
  --build-arg VITE_SUPPLY_API_URL=http://localhost:8081 \
  -t titan-web-coletor .

# Executar o contêiner na porta 3001
docker run -d -p 3001:80 --name titan-web-coletor titan-web-coletor
```

---

## 📁 Estrutura do Projeto

```
Titan-Web-Coletor/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   ├── hooks/              # Custom Hooks (useConference, usePicking, useReabastecimento)
│   ├── pages/              # Páginas da aplicação (Dashboard, Conference, Picking, Reabastecimento)
│   ├── routes/             # Configuração de rotas (React Router)
│   ├── services/           # Comunicação com APIs (apiFetch, supplyApiFetch)
│   └── utils/              # Funções utilitárias e formatadores
├── Dockerfile              # Build multi-stage Node.js + serve
└── package.json            # Dependências e scripts
```
