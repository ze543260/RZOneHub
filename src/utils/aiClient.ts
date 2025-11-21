import { invoke } from '@tauri-apps/api/core'
import { isTauri } from './platform'
import type { ChatMessage } from '@/store/chatStore'

export type AiProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'cohere'
  | 'mistral'
  | 'groq'
  | 'deepseek'
  | 'ollama'

export type ChatRequest = {
  provider: AiProvider
  api_key: string
  prompt: string
  history?: ChatMessage[]
}

export type ChatResponse = {
  content: string
}

export type CodeRequest = {
  provider: AiProvider
  api_key: string
  description: string
  language: string
}

export type CodeResponse = {
  code: string
  language: string
}

export type ApiTestResult = {
  success: boolean
  message: string
}

/**
 * Generate a chat response using the configured AI provider
 */
export async function generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
  if (isTauri()) {
    try {
      return await invoke<ChatResponse>('chat_with_ai', { request })
    } catch (error) {
      throw new Error(`Failed to generate chat response: ${error}`)
    }
  }

  // Fallback for web development
  throw new Error('AI client only works in Tauri environment')
}

/**
 * Generate code snippet using the configured AI provider
 */
export async function generateCodeSnippet(request: CodeRequest): Promise<CodeResponse> {
  if (isTauri()) {
    try {
      return await invoke<CodeResponse>('generate_code', { request })
    } catch (error) {
      throw new Error(`Failed to generate code: ${error}`)
    }
  }

  // Fallback for web development
  throw new Error('AI client only works in Tauri environment')
}

/**
 * Test API connection with the given provider and key
 */
export async function testApiConnection(
  provider: AiProvider,
  apiKey: string,
): Promise<ApiTestResult> {
  if (isTauri()) {
    try {
      return await invoke<ApiTestResult>('test_api_connection', { provider, apiKey })
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error}`,
      }
    }
  }

  // Fallback for web development
  return {
    success: false,
    message: 'API testing only works in Tauri environment',
  }
}
