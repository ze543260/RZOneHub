use crate::ai_client;
use crate::project_analyzer::analyze_project;
use crate::types::{ChatRequest, ChatResponse, CodeRequest, CodeResponse, ProjectAnalysis};

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
