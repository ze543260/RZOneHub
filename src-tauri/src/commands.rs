use crate::ai_client;
use crate::project_analyzer::analyze_project;
use crate::types::{ChatRequest, ChatResponse, CodeRequest, CodeResponse, ProjectAnalysis};
use std::process::Command;
use std::path::PathBuf;

#[tauri::command]
pub async fn chat_with_ai(request: ChatRequest) -> Result<ChatResponse, String> {
    log::info!("Chat request - Provider: {}, API key present: {}", 
        request.provider, 
        request.api_key.is_some()
    );
    
    ai_client::generate_chat_response(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_code(request: CodeRequest) -> Result<CodeResponse, String> {
    ai_client::generate_code_snippet(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn analyze_project_structure(path: Option<String>) -> Result<ProjectAnalysis, String> {
    log::info!("Analyzing project at path: {:?}", path);
    analyze_project(path).map_err(|e| {
        log::error!("Project analysis failed: {}", e);
        e.to_string()
    })
}

#[tauri::command]
pub async fn test_api_connection(provider: String, api_key: String) -> Result<bool, String> {
    let request = ChatRequest {
        provider,
        api_key: Some(api_key),
        prompt: "Hello".to_string(),
        history: vec![],
        model: None,
    };

    match ai_client::generate_chat_response(request).await {
        Ok(_) => Ok(true),
        Err(e) => Err(e.to_string()),
    }
}

// GitHub integration placeholder
#[tauri::command]
pub async fn connect_github(token: String) -> Result<bool, String> {
    // TODO: Implement GitHub API integration
    // For now, just validate the token format
    if token.starts_with("ghp_") || token.starts_with("github_pat_") {
        Ok(true)
    } else {
        Err("Token do GitHub inválido. Deve começar com 'ghp_' ou 'github_pat_'".to_string())
    }
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[derive(serde::Serialize)]
pub struct SystemInfo {
    platform: String,
    arch: String,
    version: String,
}

#[tauri::command]
pub async fn open_repository(repo_url: String, repo_name: String) -> Result<String, String> {
    // Define a pasta onde os repositórios serão clonados
    let home_dir = dirs::home_dir()
        .ok_or_else(|| "Não foi possível encontrar o diretório home".to_string())?;
    
    let repos_dir = home_dir.join("RZOneHub").join("repos");
    
    // Cria o diretório se não existir
    std::fs::create_dir_all(&repos_dir)
        .map_err(|e| format!("Erro ao criar diretório: {}", e))?;
    
    let repo_path = repos_dir.join(&repo_name);
    
    // Verifica se o repositório já existe
    if repo_path.exists() {
        // Abre diretamente no VS Code
        open_in_vscode(&repo_path)?;
        return Ok(format!("Repositório já existe em: {}", repo_path.display()));
    }
    
    // Clona o repositório
    log::info!("Clonando repositório {} em {:?}", repo_url, repo_path);
    
    let output = Command::new("git")
        .args(&["clone", &repo_url, repo_path.to_str().unwrap()])
        .output()
        .map_err(|e| format!("Erro ao executar git clone: {}. Certifique-se de que o Git está instalado.", e))?;
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Erro ao clonar repositório: {}", stderr));
    }
    
    // Abre no VS Code
    open_in_vscode(&repo_path)?;
    
    Ok(format!("Repositório clonado e aberto em: {}", repo_path.display()))
}

fn open_in_vscode(path: &PathBuf) -> Result<(), String> {
    let output = Command::new("code")
        .arg(path)
        .spawn()
        .map_err(|e| format!("Erro ao abrir VS Code: {}. Certifique-se de que 'code' está no PATH.", e))?;
    
    Ok(())
}

// ===== IDE Commands =====

#[tauri::command]
pub fn list_directory(path: Option<String>) -> Result<DirectoryListing, String> {
    use std::fs;
    
    let target_path = if let Some(p) = path {
        PathBuf::from(p)
    } else {
        std::env::current_dir()
            .map_err(|e| format!("Erro ao obter diretório atual: {}", e))?
    };

    log::info!("Listando diretório: {:?}", target_path);

    let mut files = Vec::new();
    read_directory_shallow(&target_path, &mut files)?;

    Ok(DirectoryListing {
        path: target_path.to_string_lossy().to_string(),
        files,
    })
}

// Carrega apenas um nível de profundidade
fn read_directory_shallow(path: &PathBuf, files: &mut Vec<FileNode>) -> Result<(), String> {
    use std::fs;

    let entries = fs::read_dir(path)
        .map_err(|e| format!("Erro ao ler diretório: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Erro ao ler entrada: {}", e))?;
        let file_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Ignora arquivos/pastas ocultos e pastas pesadas
        if file_name.starts_with('.') || 
           file_name == "node_modules" || 
           file_name == "target" ||
           file_name == "dist" ||
           file_name == "build" ||
           file_name == ".git" ||
           file_name == "vendor" ||
           file_name == "__pycache__" ||
           file_name == "RZ-One" {
            continue;
        }

        let is_directory = file_path.is_dir();
        let node = FileNode {
            name: file_name,
            path: file_path.to_string_lossy().to_string(),
            is_directory,
            children: if is_directory { Some(Vec::new()) } else { None },
            expanded: Some(false),
        };

        files.push(node);
    }

    // Ordena: diretórios primeiro, depois arquivos, alfabeticamente
    files.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });

    Ok(())
}

// Novo comando para expandir diretório sob demanda
#[tauri::command]
pub fn expand_directory(path: String) -> Result<Vec<FileNode>, String> {
    use std::fs;
    
    log::info!("Expandindo diretório: {}", path);
    
    let mut files = Vec::new();
    read_directory_shallow(&PathBuf::from(path), &mut files)?;
    Ok(files)
}

#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    use std::fs;
    
    log::info!("Lendo arquivo: {}", path);
    
    fs::read_to_string(&path)
        .map_err(|e| format!("Erro ao ler arquivo: {}", e))
}

#[tauri::command]
pub fn write_file_content(path: String, content: String) -> Result<(), String> {
    use std::fs;
    
    log::info!("Salvando arquivo: {}", path);
    
    fs::write(&path, content)
        .map_err(|e| format!("Erro ao salvar arquivo: {}", e))
}

#[tauri::command]
pub async fn run_terminal_command(command: String, cwd: Option<String>) -> Result<String, String> {
    use std::process::Command;
    
    log::info!("Executando comando: {} em {:?}", command, cwd);
    
    let working_dir = if let Some(dir) = cwd {
        PathBuf::from(dir)
    } else {
        std::env::current_dir()
            .map_err(|e| format!("Erro ao obter diretório atual: {}", e))?
    };

    // Detecta o sistema operacional e usa o shell apropriado
    #[cfg(target_os = "windows")]
    let output = Command::new("powershell")
        .args(&["-Command", &command])
        .current_dir(working_dir)
        .output()
        .map_err(|e| format!("Erro ao executar comando: {}", e))?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("sh")
        .args(&["-c", &command])
        .current_dir(working_dir)
        .output()
        .map_err(|e| format!("Erro ao executar comando: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() {
        if !stderr.is_empty() {
            return Ok(format!("Erro:\n{}", stderr));
        }
    }

    let result = if !stdout.is_empty() && !stderr.is_empty() {
        format!("{}\n{}", stdout, stderr)
    } else if !stdout.is_empty() {
        stdout
    } else if !stderr.is_empty() {
        stderr
    } else {
        "Comando executado com sucesso (sem saída)".to_string()
    };

    Ok(result)
}

#[derive(serde::Serialize)]
pub struct DirectoryListing {
    path: String,
    files: Vec<FileNode>,
}

#[derive(serde::Serialize, Clone)]
pub struct FileNode {
    name: String,
    path: String,
    #[serde(rename = "isDirectory")]
    is_directory: bool,
    children: Option<Vec<FileNode>>,
    expanded: Option<bool>,
}

