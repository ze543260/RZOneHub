use anyhow::{Context, Result};
use reqwest::Client;
use serde_json::{json, Value};

use crate::types::{ChatMessage, ChatRequest, ChatResponse, CodeRequest, CodeResponse};

const OPENAI_CHAT_URL: &str = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_CHAT_URL: &str = "https://api.anthropic.com/v1/messages";
const GEMINI_CHAT_URL: &str = "https://generativelanguage.googleapis.com/v1beta/models";
const COHERE_CHAT_URL: &str = "https://api.cohere.ai/v1/chat";
const MISTRAL_CHAT_URL: &str = "https://api.mistral.ai/v1/chat/completions";
const GROQ_CHAT_URL: &str = "https://api.groq.com/openai/v1/chat/completions";
const DEEPSEEK_CHAT_URL: &str = "https://api.deepseek.com/chat/completions";
const OLLAMA_CHAT_URL: &str = "http://localhost:11434/api/chat";

pub async fn generate_chat_response(request: ChatRequest) -> Result<ChatResponse> {
    let client = Client::new();
    
    match request.provider.as_str() {
        "openai" => openai_chat(&client, request).await,
        "anthropic" => anthropic_chat(&client, request).await,
        "gemini" => gemini_chat(&client, request).await,
        "cohere" => cohere_chat(&client, request).await,
        "mistral" => mistral_chat(&client, request).await,
        "groq" => groq_chat(&client, request).await,
        "deepseek" => deepseek_chat(&client, request).await,
        "ollama" => ollama_chat(&client, request).await,
        _ => Ok(ChatResponse {
            content: "Provedor de IA não suportado.".to_string(),
        }),
    }
}

pub async fn generate_code_snippet(request: CodeRequest) -> Result<CodeResponse> {
    let prompt = format!(
        "Gere um snippet de código em {} para: {}\n\nRetorne apenas o código, sem explicações.",
        request.language, request.description
    );

    let chat_request = ChatRequest {
        provider: request.provider,
        api_key: request.api_key,
        prompt,
        history: vec![],
        model: request.model,
    };

    let response = generate_chat_response(chat_request).await?;

    Ok(CodeResponse {
        code: response.content,
        language: request.language,
    })
}

async fn openai_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("OpenAI API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "gpt-4o-mini".to_string());

    let mut messages: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": msg.role,
                "content": msg.content
            })
        })
        .collect();

    messages.push(json!({
        "role": "user",
        "content": request.prompt
    }));

    let body = json!({
        "model": model,
        "messages": messages,
        "temperature": 0.7
    });

    let response = client
        .post(OPENAI_CHAT_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para OpenAI")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .context("Resposta inválida da OpenAI")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn anthropic_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("Anthropic API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "claude-3-5-sonnet-20241022".to_string());

    let mut messages: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": msg.role,
                "content": msg.content
            })
        })
        .collect();

    messages.push(json!({
        "role": "user",
        "content": request.prompt
    }));

    let body = json!({
        "model": model,
        "messages": messages,
        "max_tokens": 4096
    });

    let response = client
        .post(ANTHROPIC_CHAT_URL)
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para Anthropic")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["content"][0]["text"]
        .as_str()
        .context("Resposta inválida da Anthropic")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn gemini_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("Gemini API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "gemini-1.5-flash".to_string());

    let url = format!("{}{}:generateContent?key={}", GEMINI_CHAT_URL, model, api_key);

    let mut parts = vec![];
    for msg in &request.history {
        parts.push(json!({ "text": msg.content }));
    }
    parts.push(json!({ "text": request.prompt }));

    let body = json!({
        "contents": [{
            "parts": parts
        }]
    });

    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para Gemini")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .context("Resposta inválida do Gemini")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn cohere_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("Cohere API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "command-r-plus".to_string());

    let chat_history: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": if msg.role == "assistant" { "CHATBOT" } else { "USER" },
                "message": msg.content
            })
        })
        .collect();

    let body = json!({
        "model": model,
        "message": request.prompt,
        "chat_history": chat_history
    });

    let response = client
        .post(COHERE_CHAT_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para Cohere")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["text"]
        .as_str()
        .context("Resposta inválida da Cohere")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn mistral_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("Mistral API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "mistral-large-latest".to_string());

    let mut messages: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": msg.role,
                "content": msg.content
            })
        })
        .collect();

    messages.push(json!({
        "role": "user",
        "content": request.prompt
    }));

    let body = json!({
        "model": model,
        "messages": messages
    });

    let response = client
        .post(MISTRAL_CHAT_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para Mistral")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .context("Resposta inválida da Mistral")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn groq_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("Groq API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "llama-3.3-70b-versatile".to_string());

    let mut messages: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": msg.role,
                "content": msg.content
            })
        })
        .collect();

    messages.push(json!({
        "role": "user",
        "content": request.prompt
    }));

    let body = json!({
        "model": model,
        "messages": messages
    });

    let response = client
        .post(GROQ_CHAT_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para Groq")?;

    let status = response.status();
    let data: Value = response.json().await.context("Falha ao parsear resposta")?;
    
    log::info!("Groq response status: {}", status);
    log::info!("Groq response data: {}", data);

    if let Some(error) = data.get("error") {
        return Err(anyhow::anyhow!("Groq API error: {}", error));
    }

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .context("Resposta inválida da Groq")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn deepseek_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let api_key = request.api_key.context("DeepSeek API key não fornecida")?;
    let model = request.model.unwrap_or_else(|| "deepseek-chat".to_string());

    let mut messages: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": msg.role,
                "content": msg.content
            })
        })
        .collect();

    messages.push(json!({
        "role": "user",
        "content": request.prompt
    }));

    let body = json!({
        "model": model,
        "messages": messages
    });

    let response = client
        .post(DEEPSEEK_CHAT_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para DeepSeek")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .context("Resposta inválida da DeepSeek")?
        .to_string();

    Ok(ChatResponse { content })
}

async fn ollama_chat(client: &Client, request: ChatRequest) -> Result<ChatResponse> {
    let model = request.model.unwrap_or_else(|| "llama3.1".to_string());

    let mut messages: Vec<Value> = request
        .history
        .iter()
        .map(|msg| {
            json!({
                "role": msg.role,
                "content": msg.content
            })
        })
        .collect();

    messages.push(json!({
        "role": "user",
        "content": request.prompt
    }));

    let body = json!({
        "model": model,
        "messages": messages,
        "stream": false
    });

    let response = client
        .post(OLLAMA_CHAT_URL)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .context("Falha ao enviar requisição para Ollama. Verifique se o Ollama está rodando.")?;

    let data: Value = response.json().await.context("Falha ao parsear resposta")?;

    let content = data["message"]["content"]
        .as_str()
        .context("Resposta inválida do Ollama")?
        .to_string();

    Ok(ChatResponse { content })
}
