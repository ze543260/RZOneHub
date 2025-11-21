# 🤖 AI Dev Hub

<div align="center">

![AI Dev Hub](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=Tauri&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Hub de Inteligência Artificial para desenvolvimento Windows**

Um assistente de desenvolvimento desktop poderoso que integra IA para auxiliar na criação de apps e sistemas.

[Começar](#-instalação) • [Funcionalidades](#-funcionalidades) • [Documentação](#-uso) • [Contribuir](#-contribuindo)

</div>

---

## 📋 Sobre o Projeto

AI Dev Hub é uma aplicação desktop moderna construída com Tauri e React que oferece um ambiente integrado para desenvolvedores interagirem com modelos de IA. O objetivo é acelerar o desenvolvimento de software através de assistência inteligente, geração de código, análise de projetos e muito mais.

### Por que AI Dev Hub?

- 🚀 **Performance nativa**: Construído com Rust e Tauri para máxima eficiência
- 💻 **Multiplataforma**: Funciona no Windows, macOS e Linux
- 🎨 **Interface moderna**: Design limpo com glassmorphism e Tailwind CSS
- 🔒 **Privacidade**: Seus dados ficam no seu computador
- 🔌 **Extensível**: Fácil adicionar novos modelos e funcionalidades

---

## ✨ Funcionalidades

### 🤝 Chat Interativo com IA
- Conversação natural com modelos de linguagem
- Contexto de conversação persistente
- Suporte a múltiplas sessões
- Histórico de conversas

### 💡 Geração de Código
- Gere código em múltiplas linguagens
- Templates e snippets inteligentes
- Refatoração assistida por IA
- Explicação de código existente

### 📊 Análise de Projetos
- Análise de estrutura de diretórios
- Identificação de padrões e arquitetura
- Sugestões de melhorias
- Detecção de problemas potenciais

### ⚙️ Configurações Flexíveis
- Integração com múltiplas APIs (Anthropic, OpenAI, etc.)
- Modelos locais via Ollama
- Personalização de interface
- Gerenciamento de API keys

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Router** - Navegação
- **Zustand** - Gerenciamento de estado

### Backend
- **Rust** - Performance e segurança
- **Tauri** - Framework desktop
- **Tokio** - Runtime assíncrono
- **Serde** - Serialização

### APIs e Integrações
- **Claude API** (Anthropic)
- **OpenAI API**
- **Ollama** (modelos locais)

---

## 📦 Instalação

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **Rust** (versão estável mais recente)
- **Visual Studio Build Tools** (Windows)

#### Instalando Rust no Windows

```bash
# Via winget
winget install Rustlang.Rustup

# Ou baixe direto de: https://rustup.rs/
```

#### Instalando Visual Studio Build Tools

```bash
# Via winget
winget install Microsoft.VisualStudio.2022.BuildTools

# Durante instalação, selecione:
# - Desktop development with C++
```

### Configuração do Projeto

1. **Clone ou crie o projeto:**

```bash
# Opção 1: Criar projeto Vite + React
npm create vite@latest . -- --template react-ts

# Instalar dependências
npm install

# Adicionar Tauri
npm install -D @tauri-apps/cli
npm install @tauri-apps/api
```

2. **Inicializar Tauri:**

```bash
npx tauri init
```

Configure durante o setup:
- **App name:** ai-dev-hub
- **Window title:** AI Dev Hub
- **Web assets path:** ../dist
- **Dev server URL:** http://localhost:5173
- **Dev command:** npm run dev
- **Build command:** npm run build

3. **Instalar dependências adicionais:**

```bash
npm install tailwindcss postcss autoprefixer
npm install react-router-dom
npm install zustand
npm install lucide-react
npm install @tauri-apps/plugin-store
```

4. **Configurar Tailwind CSS:**

```bash
npx tailwindcss init -p
```

---

## 🚀 Uso

### Modo Desenvolvimento

```bash
npm run tauri dev
```

Isso irá:
- Iniciar o servidor de desenvolvimento Vite
- Compilar o backend Rust
- Abrir a aplicação desktop

### Build de Produção

```bash
npm run tauri build
```

O instalador será gerado em:
- Windows: `src-tauri/target/release/bundle/`
- Formatos: `.msi`, `.exe`

---

## 📂 Estrutura do Projeto

```
ai-dev-hub/
├── src/                      # Código React/TypeScript
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Chat/           # Componentes de chat
│   │   ├── CodeGenerator/  # Gerador de código
│   │   ├── ProjectAnalyzer/# Analisador de projetos
│   │   └── Settings/       # Configurações
│   ├── hooks/              # Custom hooks
│   ├── store/              # Estado global (Zustand)
│   ├── types/              # TypeScript types
│   ├── utils/              # Funções utilitárias
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Entry point
│
├── src-tauri/               # Código Rust/Tauri
│   ├── src/
│   │   ├── main.rs         # Entry point Rust
│   │   ├── commands.rs     # Comandos Tauri
│   │   └── api/            # Integrações de API
│   ├── Cargo.toml          # Dependências Rust
│   └── tauri.conf.json     # Configuração Tauri
│
├── public/                  # Assets estáticos
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## ⚙️ Configuração

### API Keys

1. Abra a aplicação
2. Vá em **Settings** (⚙️)
3. Adicione suas API keys:
   - **Anthropic (Claude)**: Para usar Claude API
   - **OpenAI**: Para usar GPT models
   - **Ollama**: Configure o endpoint local

### Modelos Locais (Ollama)

Para usar modelos localmente sem API keys:

```bash
# Instalar Ollama
winget install Ollama.Ollama

# Baixar um modelo
ollama pull codellama
ollama pull llama2

# Verificar se está rodando
curl http://localhost:11434
```

Configure o endpoint em Settings: `http://localhost:11434`

---

## 🎨 Personalização

### Temas

A aplicação suporta customização de cores e temas. Edite:

```typescript
// src/theme.ts
export const theme = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  // ...
}
```

### Adicionar Novos Comandos Tauri

1. **Rust** (`src-tauri/src/commands.rs`):

```rust
#[tauri::command]
fn my_custom_command(input: String) -> Result<String, String> {
    Ok(format!("Processed: {}", input))
}
```

2. **Registrar** (`src-tauri/src/main.rs`):

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

3. **Usar no React**:

```typescript
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke('my_custom_command', { input: 'test' });
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga o estilo de código do projeto
- Adicione testes quando apropriado
- Atualize a documentação
- Mantenha commits pequenos e descritivos

---

## 📝 Roadmap

- [x] Chat básico com IA
- [x] Geração de código
- [x] Análise de projetos
- [ ] Suporte a plugins
- [ ] Integração com VSCode
- [ ] Terminal integrado
- [ ] Code review automático
- [ ] Debugging assistido por IA
- [ ] Documentação automática
- [ ] Testes automatizados com IA

---

## 🐛 Problemas Conhecidos

### Windows

- **Build lento na primeira vez**: Normal, Rust compila muitas dependências
- **Antivírus bloqueando**: Adicione exceção para a pasta do projeto

### Geral

- Verifique as [Issues](../../issues) para problemas conhecidos

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- [Tauri](https://tauri.app/) - Framework desktop incrível
- [Anthropic](https://www.anthropic.com/) - Claude API
- [OpenAI](https://openai.com/) - GPT models
- [Ollama](https://ollama.ai/) - Modelos locais

---

## 📞 Contato

Criado por **José** - IFSUL de Minas

- 💼 LinkedIn: [seu-linkedin]
- 🐙 GitHub: [seu-github]
- 📧 Email: [seu-email]

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

Made with ❤️ and 🦀 Rust

</div>