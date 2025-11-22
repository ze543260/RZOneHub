import { create } from 'zustand';
import type { DocumentationConfig, DocumentationResult, JSDocComment, DiagramData } from '../types/documentation';

interface DocumentationState {
  config: DocumentationConfig;
  result: DocumentationResult | null;
  isGenerating: boolean;
  
  // Actions
  setConfig: (config: Partial<DocumentationConfig>) => void;
  generateDocumentation: () => Promise<void>;
  exportDocumentation: () => Promise<void>;
}

const defaultConfig: DocumentationConfig = {
  projectName: 'My Project',
  projectPath: '',
  includeJSDoc: true,
  includeReadme: true,
  includeDiagrams: true,
  includeAPI: true,
  includeChangelog: true,
  language: 'pt'
};

const mockGenerateJSDoc = (): JSDocComment[] => [
  {
    file: 'src/utils/helpers.ts',
    line: 12,
    type: 'function',
    name: 'calculateTotal',
    signature: 'calculateTotal(items: Item[], tax: number): number',
    generatedDoc: `/**
 * Calcula o total de um carrinho de compras incluindo impostos
 * @param {Item[]} items - Array de itens do carrinho
 * @param {number} tax - Taxa de imposto (em decimal, ex: 0.15 para 15%)
 * @returns {number} Valor total calculado com impostos
 * @example
 * const total = calculateTotal(cartItems, 0.15);
 * // returns 115.00 para um carrinho de R$ 100
 */`
  },
  {
    file: 'src/components/Button.tsx',
    line: 8,
    type: 'interface',
    name: 'ButtonProps',
    signature: 'interface ButtonProps',
    generatedDoc: `/**
 * Propriedades do componente Button
 * @interface ButtonProps
 * @property {string} [variant='primary'] - Variante visual do botão
 * @property {string} [size='medium'] - Tamanho do botão
 * @property {boolean} [disabled=false] - Se o botão está desabilitado
 * @property {() => void} onClick - Função chamada ao clicar no botão
 * @property {React.ReactNode} children - Conteúdo do botão
 */`
  },
  {
    file: 'src/api/client.ts',
    line: 34,
    type: 'class',
    name: 'APIClient',
    signature: 'class APIClient',
    generatedDoc: `/**
 * Cliente HTTP para comunicação com a API
 * @class APIClient
 * @description Gerencia requisições HTTP com autenticação e tratamento de erros
 * @example
 * const api = new APIClient({ baseURL: 'https://api.example.com' });
 * const data = await api.get('/users');
 */`
  }
];

const mockGenerateDiagrams = (): DiagramData[] => [
  {
    type: 'architecture',
    title: 'Arquitetura do Sistema',
    mermaidCode: `graph TB
    A[Cliente Web] -->|HTTP/HTTPS| B[Load Balancer]
    B --> C[App Server 1]
    B --> D[App Server 2]
    C --> E[Cache Redis]
    D --> E
    C --> F[(Database)]
    D --> F
    E --> F
    C --> G[Queue]
    D --> G
    G --> H[Worker]
    H --> F`
  },
  {
    type: 'class',
    title: 'Diagrama de Classes - Domínio de Usuário',
    mermaidCode: `classDiagram
    class User {
        +String id
        +String email
        +String name
        +DateTime createdAt
        +login()
        +logout()
        +updateProfile()
    }
    class Profile {
        +String userId
        +String avatar
        +String bio
        +update()
    }
    class Permission {
        +String name
        +String description
        +check()
    }
    User "1" --> "1" Profile
    User "1" --> "*" Permission`
  },
  {
    type: 'sequence',
    title: 'Fluxo de Autenticação',
    mermaidCode: `sequenceDiagram
    participant U as Usuário
    participant C as Cliente
    participant S as Servidor
    participant DB as Database
    
    U->>C: Insere credenciais
    C->>S: POST /auth/login
    S->>DB: Verifica credenciais
    DB-->>S: Usuário válido
    S->>S: Gera JWT token
    S-->>C: Token + User data
    C->>C: Armazena token
    C-->>U: Redireciona para dashboard`
  }
];

const mockGenerateReadme = (projectName: string): string => `# ${projectName}

## 📝 Descrição

${projectName} é uma aplicação moderna desenvolvida com as melhores práticas de desenvolvimento.

## 🚀 Tecnologias

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Tests**: Jest, Testing Library

## 📦 Instalação

\`\`\`bash
# Clone o repositório
git clone https://github.com/seu-usuario/${projectName.toLowerCase().replace(/\s+/g, '-')}.git

# Entre no diretório
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
\`\`\`

## 🔧 Configuração

Crie um arquivo \`.env\` na raiz do projeto com as seguintes variáveis:

\`\`\`env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
API_PORT=3000
\`\`\`

## 📖 Uso

### Iniciar o servidor

\`\`\`bash
npm start
\`\`\`

### Executar testes

\`\`\`bash
npm test
\`\`\`

### Build para produção

\`\`\`bash
npm run build
\`\`\`

## 📚 API Documentation

A documentação completa da API está disponível em \`/docs/api.md\`.

### Endpoints Principais

- \`GET /api/users\` - Lista todos os usuários
- \`POST /api/auth/login\` - Autenticação de usuário
- \`GET /api/products\` - Lista produtos

## 🏗️ Arquitetura

Veja \`/docs/architecture.md\` para detalhes sobre a arquitetura do sistema.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Equipe de Desenvolvimento** - [GitHub](https://github.com/seu-usuario)

## 📞 Suporte

Para suporte, envie um email para support@example.com ou abra uma issue no GitHub.
`;

export const useDocumentationStore = create<DocumentationState>((set, get) => ({
  config: defaultConfig,
  result: null,
  isGenerating: false,

  setConfig: (newConfig) => {
    set(state => ({
      config: { ...state.config, ...newConfig }
    }));
  },

  generateDocumentation: async () => {
    set({ isGenerating: true });
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { config } = get();
      const generatedFiles: Array<{ path: string; content: string }> = [];
      
      const jsDocs = config.includeJSDoc ? mockGenerateJSDoc() : undefined;
      const readme = config.includeReadme ? mockGenerateReadme(config.projectName) : undefined;
      const diagrams = config.includeDiagrams ? mockGenerateDiagrams() : undefined;
      
      if (readme) {
        generatedFiles.push({ path: 'README.md', content: readme });
      }
      
      if (jsDocs) {
        const jsDocContent = jsDocs.map(doc => 
          `File: ${doc.file}\nLine: ${doc.line}\nType: ${doc.type}\n\n${doc.generatedDoc}\n${doc.signature}\n\n`
        ).join('\n---\n\n');
        generatedFiles.push({ path: 'docs/jsdoc.md', content: jsDocContent });
      }
      
      if (diagrams) {
        diagrams.forEach((diagram, index) => {
          generatedFiles.push({
            path: `docs/diagrams/${diagram.type}-${index + 1}.md`,
            content: `# ${diagram.title}\n\n\`\`\`mermaid\n${diagram.mermaidCode}\n\`\`\``
          });
        });
      }
      
      const api = config.includeAPI ? [
        {
          method: 'GET' as const,
          path: '/api/users',
          description: 'Lista todos os usuários do sistema',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Número da página' },
            { name: 'limit', type: 'number', required: false, description: 'Itens por página' }
          ],
          responses: [
            { status: 200, description: 'Lista de usuários retornada com sucesso', schema: 'User[]' },
            { status: 401, description: 'Não autorizado' }
          ]
        }
      ] : undefined;
      
      if (api) {
        const apiContent = api.map(endpoint => 
          `## ${endpoint.method} ${endpoint.path}\n\n${endpoint.description}\n\n### Parâmetros\n\n${
            endpoint.parameters.map(p => `- **${p.name}** (${p.type})${p.required ? ' *obrigatório*' : ''}: ${p.description}`).join('\n')
          }\n\n### Respostas\n\n${
            endpoint.responses.map(r => `- **${r.status}**: ${r.description}${r.schema ? ` - \`${r.schema}\`` : ''}`).join('\n')
          }\n\n`
        ).join('\n');
        generatedFiles.push({ path: 'docs/api.md', content: `# API Documentation\n\n${apiContent}` });
      }
      
      const changelog = config.includeChangelog ? [
        {
          version: '1.0.0',
          date: new Date().toISOString().split('T')[0],
          changes: [
            { type: 'added' as const, description: 'Implementação inicial do sistema' },
            { type: 'added' as const, description: 'Sistema de autenticação com JWT' },
            { type: 'added' as const, description: 'CRUD completo de usuários' }
          ]
        }
      ] : undefined;
      
      if (changelog) {
        const changelogContent = changelog.map(entry =>
          `## [${entry.version}] - ${entry.date}\n\n${
            entry.changes.map(c => `### ${c.type.toUpperCase()}\n- ${c.description}`).join('\n\n')
          }\n\n`
        ).join('\n');
        generatedFiles.push({ path: 'CHANGELOG.md', content: `# Changelog\n\n${changelogContent}` });
      }
      
      const result: DocumentationResult = {
        timestamp: Date.now(),
        config,
        jsDocs,
        readme,
        diagrams,
        api,
        changelog,
        generatedFiles
      };
      
      set({ result, isGenerating: false });
    } catch (error) {
      console.error('Documentation generation failed:', error);
      set({ isGenerating: false });
    }
  },

  exportDocumentation: async () => {
    const { result } = get();
    if (!result) return;
    
    // Simulate exporting files
    console.log('Exporting documentation files:', result.generatedFiles);
    
    // In a real implementation, this would use Tauri's file system API
    alert(`${result.generatedFiles.length} arquivos de documentação gerados com sucesso!`);
  }
}));
