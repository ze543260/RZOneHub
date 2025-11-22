use anyhow::Result;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

use crate::types::{FileInfo, FileTypeStat, ProjectAnalysis};

const MAX_FILE_SIZE: u64 = 500_000; // 500KB (aumentado de 100KB)
const MAX_FILES_WITH_CONTENT: usize = 100; // 100 arquivos (aumentado de 20)

const IGNORED_DIRS: &[&str] = &[
    "node_modules",
    "target",
    "dist",
    "build",
    ".git",
    ".next",
    ".nuxt",
    "__pycache__",
    "venv",
    ".venv",
    "vendor",
];

const IGNORED_EXTENSIONS: &[&str] = &[
    "lock",
    "log",
    "tmp",
    "temp",
    "cache",
    "min.js",
    "min.css",
    "map",
];

pub fn analyze_project(base_path: Option<String>) -> Result<ProjectAnalysis> {
    let root = if let Some(path) = base_path {
        PathBuf::from(path)
    } else {
        std::env::current_dir()?
    };

    let mut total_files = 0;
    let mut total_directories = 0;
    let mut file_types: HashMap<String, usize> = HashMap::new();
    let mut files_with_size: Vec<(PathBuf, u64)> = Vec::new();

    for entry in WalkDir::new(&root)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| !is_ignored(e.path()))
    {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        let path = entry.path();

        if path.is_dir() {
            total_directories += 1;
        } else if path.is_file() {
            total_files += 1;

            // Count file types
            if let Some(ext) = path.extension() {
                if let Some(ext_str) = ext.to_str() {
                    if !IGNORED_EXTENSIONS.contains(&ext_str) {
                        *file_types.entry(ext_str.to_string()).or_insert(0) += 1;
                    }
                }
            }

            // Collect file sizes
            if let Ok(metadata) = fs::metadata(path) {
                files_with_size.push((path.to_path_buf(), metadata.len()));
            }
        }
    }

    // Sort and get top file types
    let mut file_type_stats: Vec<FileTypeStat> = file_types
        .into_iter()
        .map(|(ext, count)| FileTypeStat {
            extension: ext,
            count,
        })
        .collect();
    file_type_stats.sort_by(|a, b| b.count.cmp(&a.count));
    file_type_stats.truncate(10);

    // Sort and get largest files
    files_with_size.sort_by(|a, b| b.1.cmp(&a.1));
    
    let mut largest_files: Vec<FileInfo> = Vec::new();
    let mut files_added = 0;
    
    // Incluir TODOS os arquivos de código, não apenas os maiores
    for (path, size) in files_with_size.iter() {
        if let Ok(relative_path) = path.strip_prefix(&root) {
            let path_str = relative_path.to_string_lossy().to_string();
            
            // Adiciona conteúdo para TODOS arquivos de código menores que MAX_FILE_SIZE
            let content = if should_include_content(&path_str) && *size < MAX_FILE_SIZE && files_added < MAX_FILES_WITH_CONTENT {
                files_added += 1;
                fs::read_to_string(path).ok()
            } else {
                None
            };
            
            // Adiciona à lista se tiver conteúdo ou for um arquivo grande
            if content.is_some() || largest_files.len() < 20 {
                largest_files.push(FileInfo {
                    path: path_str,
                    size: *size,
                    content,
                });
            }
            
            // Limita o total de arquivos retornados
            if largest_files.len() >= 50 {
                break;
            }
        }
    }

    let suggestions = generate_suggestions(total_files, &file_type_stats);

    // Gerar resumo do projeto com conteúdo de arquivos
    let summary = generate_project_summary(
        &root,
        total_files,
        total_directories,
        &file_type_stats,
        &largest_files,
    );

    Ok(ProjectAnalysis {
        total_files,
        total_directories,
        file_types: file_type_stats,
        largest_files,
        suggestions,
        summary,
    })
}

fn is_ignored(path: &Path) -> bool {
    path.components().any(|comp| {
        if let Some(name) = comp.as_os_str().to_str() {
            IGNORED_DIRS.contains(&name)
        } else {
            false
        }
    })
}

fn generate_suggestions(total_files: usize, file_types: &[FileTypeStat]) -> Vec<String> {
    let mut suggestions = Vec::new();

    // Check for test files
    let has_tests = file_types
        .iter()
        .any(|ft| ft.extension == "test.ts" || ft.extension == "spec.ts");
    
    if !has_tests && total_files > 20 {
        suggestions.push(
            "Considere adicionar testes automatizados para garantir qualidade do código.".to_string(),
        );
    }

    // Check for documentation
    let has_readme = file_types.iter().any(|ft| ft.extension == "md");
    if !has_readme {
        suggestions.push(
            "Adicione um README.md para documentar o projeto e facilitar onboarding.".to_string(),
        );
    }

    // Check for TypeScript
    let has_typescript = file_types.iter().any(|ft| ft.extension == "ts" || ft.extension == "tsx");
    let has_javascript = file_types.iter().any(|ft| ft.extension == "js" || ft.extension == "jsx");
    
    if has_javascript && !has_typescript && total_files > 30 {
        suggestions.push(
            "Migrar para TypeScript pode melhorar a manutenibilidade e prevenir bugs.".to_string(),
        );
    }

    // Check for configuration files
    let has_eslint = file_types.iter().any(|ft| ft.extension.contains("eslint"));
    if !has_eslint && (has_typescript || has_javascript) {
        suggestions.push(
            "Configure ESLint para manter consistência de código e identificar problemas.".to_string(),
        );
    }

    // Project size suggestions
    if total_files > 100 {
        suggestions.push(
            "Projeto grande detectado. Considere modularizar o código em pacotes menores.".to_string(),
        );
    }

    // CI/CD suggestion
    let has_ci = file_types.iter().any(|ft| ft.extension == "yml" || ft.extension == "yaml");
    if !has_ci && total_files > 50 {
        suggestions.push(
            "Configure CI/CD (GitHub Actions, GitLab CI) para automatizar testes e deploys.".to_string(),
        );
    }

    // Generic best practice
    if suggestions.is_empty() {
        suggestions.push(
            "Projeto bem estruturado! Continue mantendo boas práticas de desenvolvimento.".to_string(),
        );
    }

    suggestions
}

fn generate_project_summary(
    root: &PathBuf,
    total_files: usize,
    total_directories: usize,
    file_types: &[FileTypeStat],
    files_with_content: &[FileInfo],
) -> String {
    let mut summary = String::new();
    
    summary.push_str(&format!("# Análise do Projeto\n\n"));
    summary.push_str(&format!("**Localização:** {}\n", root.display()));
    summary.push_str(&format!("**Total de arquivos:** {}\n", total_files));
    summary.push_str(&format!("**Total de diretórios:** {}\n\n", total_directories));
    
    // Detectar tipo de projeto
    let project_type = detect_project_type(file_types);
    if let Some(ptype) = project_type {
        summary.push_str(&format!("**Tipo de projeto:** {}\n\n", ptype));
    }
    
    if !file_types.is_empty() {
        summary.push_str("## Principais tipos de arquivo:\n");
        for (i, ft) in file_types.iter().take(5).enumerate() {
            summary.push_str(&format!("{}. `.{}` - {} arquivo{}\n", 
                i + 1, 
                ft.extension, 
                ft.count,
                if ft.count > 1 { "s" } else { "" }
            ));
        }
        summary.push_str("\n");
    }
    
    // Adicionar conteúdo de arquivos de configuração importantes
    summary.push_str(&read_important_files(root));
    
    // Adicionar conteúdo dos arquivos principais
    let files_with_code: Vec<_> = files_with_content
        .iter()
        .filter(|f| f.content.is_some())
        .collect();
    
    if !files_with_code.is_empty() {
        summary.push_str("\n## Código-fonte do projeto (subpastas incluídas):\n\n");
        
        for file in files_with_code.iter().take(50) { // Aumentado de 10 para 50
            if let Some(content) = &file.content {
                let truncated = if content.len() > 3000 { // Aumentado de 1500 para 3000
                    format!("{}...\n[Arquivo truncado - {} bytes totais]", 
                        &content[..3000], 
                        file.size
                    )
                } else {
                    content.clone()
                };
                
                summary.push_str(&format!("### {}\n```\n{}\n```\n\n", file.path, truncated));
            }
        }
    }
    
    summary
}

fn should_include_content(path: &str) -> bool {
    let code_extensions = [
        // Linguagens de programação
        "rs", "ts", "tsx", "js", "jsx", "py", "go", "java", "cs", 
        "cpp", "c", "h", "hpp", "cc", "cxx", "php", "rb", "swift",
        "kt", "dart", "scala", "r", "m", "mm", "vb", "fs",
        // Web e markup
        "vue", "svelte", "html", "htm", "css", "scss", "sass", "less",
        "xml", "svg",
        // Configuração e dados
        "json", "toml", "yaml", "yml", "md", "txt", "ini", "cfg",
        "env", "properties", "conf",
        // Scripts
        "sh", "bash", "zsh", "fish", "ps1", "bat", "cmd",
        // Outros
        "sql", "graphql", "proto", "cmake", "makefile"
    ];
    
    let path_lower = path.to_lowercase();
    
    // Verifica extensão
    if let Some(ext) = path_lower.split('.').last() {
        if code_extensions.contains(&ext) {
            return true;
        }
    }
    
    // Verifica arquivos sem extensão comuns
    let filename = path_lower.split('/').last().unwrap_or("");
    let special_files = [
        "dockerfile", "makefile", "rakefile", "gemfile", 
        "procfile", "license", "readme", "changelog"
    ];
    
    special_files.iter().any(|&f| filename.starts_with(f))
}

fn read_important_files(root: &PathBuf) -> String {
    let mut content = String::new();
    let important_files = [
        "package.json",
        "Cargo.toml",
        "tsconfig.json",
        "README.md",
        "requirements.txt",
        "go.mod",
        "pyproject.toml",
        "pom.xml",
        "build.gradle",
        "composer.json",
        ".env.example",
        "vite.config.ts",
        "next.config.js",
        "tailwind.config.js",
    ];
    
    content.push_str("## Arquivos de configuração:\n\n");
    let mut found_any = false;
    
    for file_name in &important_files {
        let file_path = root.join(file_name);
        if file_path.exists() {
            if let Ok(file_content) = fs::read_to_string(&file_path) {
                found_any = true;
                // Limita o tamanho do conteúdo
                let truncated = if file_content.len() > 2000 {
                    format!("{}...\n[Conteúdo truncado - arquivo completo tem {} bytes]", 
                        &file_content[..2000],
                        file_content.len()
                    )
                } else {
                    file_content
                };
                
                content.push_str(&format!("### {}\n```\n{}\n```\n\n", file_name, truncated));
            }
        }
    }
    
    if !found_any {
        content.push_str("Nenhum arquivo de configuração padrão encontrado.\n\n");
    }
    
    content
}

fn detect_project_type(file_types: &[FileTypeStat]) -> Option<String> {
    let extensions: Vec<&str> = file_types.iter().map(|ft| ft.extension.as_str()).collect();
    
    if extensions.contains(&"rs") {
        return Some("Rust".to_string());
    }
    if extensions.contains(&"tsx") || extensions.contains(&"jsx") {
        return Some("React/TypeScript".to_string());
    }
    if extensions.contains(&"ts") {
        return Some("TypeScript".to_string());
    }
    if extensions.contains(&"js") {
        return Some("JavaScript".to_string());
    }
    if extensions.contains(&"py") {
        return Some("Python".to_string());
    }
    if extensions.contains(&"go") {
        return Some("Go".to_string());
    }
    if extensions.contains(&"java") {
        return Some("Java".to_string());
    }
    if extensions.contains(&"cs") {
        return Some("C#".to_string());
    }
    if extensions.contains(&"cpp") || extensions.contains(&"cc") {
        return Some("C++".to_string());
    }
    if extensions.contains(&"vue") {
        return Some("Vue.js".to_string());
    }
    if extensions.contains(&"svelte") {
        return Some("Svelte".to_string());
    }
    
    None
}
