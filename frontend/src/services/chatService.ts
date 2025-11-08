import { ChatRequest, ChatResponse, Conversation, ChatMessage, DebugLogs } from '../types/chat';

// Use REACT_APP_API_URL (recommended) or REACT_APP_API_BASE for backwards compatibility.
// If not set, fall back to relative API paths under /api/v1 so development setups using
// a proxy or same-origin backend continue working.
const RAW_API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || '';
const API_BASE_URL = RAW_API_BASE ? RAW_API_BASE.replace(/\/+$/g, '') : '';
const API_PATH_PREFIX = API_BASE_URL ? '' : '/api/v1';

function buildUrl(endpointPath: string) {
  // endpointPath should start with '/'
  const path = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${API_BASE_URL || ''}${API_PATH_PREFIX}${path}`;
}

class ChatService {
  private async fetchWithErrorHandling(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Keep original message if parsing fails
      }
      throw new Error(errorMessage);
    }

    return response;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.fetchWithErrorHandling(buildUrl('/chat/message'), {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response.json();
  }

  async getConversations(userId: number = 1, limit: number = 50): Promise<{ conversations: Conversation[] }> {
    const response = await this.fetchWithErrorHandling(
      buildUrl(`/chat/conversations?user_id=${userId}&limit=${limit}`)
    );
    return response.json();
  }

  async getConversationMessages(conversationId: number): Promise<{ messages: ChatMessage[] }> {
    const response = await this.fetchWithErrorHandling(
      buildUrl(`/chat/conversations/${conversationId}/messages`)
    );
    return response.json();
  }

  async getDebugLogs(conversationId: number): Promise<DebugLogs> {
    const response = await this.fetchWithErrorHandling(
      buildUrl(`/chat/debug_logs/${conversationId}`)
    );
    return response.json();
  }

  // Helper method to format error messages for display
  formatErrorMessage(error: Error): string {
    let errorMessage = error.message || 'An unknown error occurred';
    
    // If error message looks like JSON, try to parse and format it
    if (errorMessage.includes('{') && errorMessage.includes('}')) {
      try {
        const jsonMatch = errorMessage.match(/\{.*\}/);
        if (jsonMatch) {
          const errorObj = JSON.parse(jsonMatch[0]);
          errorMessage = errorObj.detail || errorObj.message || errorMessage;
        }
      } catch (e) {
        // Keep original message if parsing fails
      }
    }
    
    return errorMessage;
  }
}

export const chatService = new ChatService();