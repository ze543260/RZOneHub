use anyhow::Result;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

use crate::types::{FileInfo, FileTypeStat, ProjectAnalysis};

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
    let largest_files: Vec<FileInfo> = files_with_size
        .into_iter()
        .take(10)
        .filter_map(|(path, size)| {
            path.strip_prefix(&root).ok().map(|p| FileInfo {
                path: p.to_string_lossy().to_string(),
                size,
            })
        })
        .collect();

    let suggestions = generate_suggestions(total_files, &file_type_stats);

    Ok(ProjectAnalysis {
        total_files,
        total_directories,
        file_types: file_type_stats,
        largest_files,
        suggestions,
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
