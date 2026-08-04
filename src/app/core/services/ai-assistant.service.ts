import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  ChatRequest,
  ChatResponse,
  DrugInfoResult,
  InteractionCheckResult,
} from '@core/interfaces/ai-assistant.interface';

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl; // Use localUrl to test new local AI endpoints

  /**
   * Send a chat message to the AI assistant (non-streaming).
   */
  chat(message: string, history: { role: string; content: string }[]): Observable<ChatResponse> {
    const body: ChatRequest = { message, history };
    return this.http.post<ChatResponse>(`${this.baseUrl}/assistant/chat`, body);
  }

  /**
   * Stream chat tokens from the AI assistant using SSE (fetch + ReadableStream).
   * Returns an async generator that yields text tokens as they arrive.
   */
  async *chatStream(
    message: string,
    history: { role: string; content: string }[],
    token: string | null,
  ): AsyncGenerator<string> {
    const body: ChatRequest = { message, history };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/assistant/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // SSE format: "data: <json-encoded-token>\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const tokenStr = line.slice(5).trim();
            if (tokenStr && tokenStr !== '[DONE]') {
              try {
                // The backend now sends JSON-serialized strings to preserve spaces and newlines
                const token = JSON.parse(tokenStr);
                yield token;
              } catch (e) {
                // Fallback for raw text if JSON parse fails
                yield tokenStr;
              }
            }
          } else if (line.trim() && !line.startsWith('event:') && !line.startsWith(':')) {
            // Plain text stream fallback
            yield line.trim();
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get detailed information about a specific drug.
   */
  getDrugInfo(drugName: string): Observable<DrugInfoResult> {
    return this.http.get<DrugInfoResult>(
      `${this.baseUrl}/assistant/drug-info`,
      { params: { drugName } }
    );
  }

  /**
   * Check interactions between a list of drug names.
   */
  checkInteractions(drugNames: string[]): Observable<InteractionCheckResult> {
    return this.http.post<InteractionCheckResult>(`${this.baseUrl}/assistant/check-interactions`, {
      drugNames,
    });
  }

  /**
   * Agentic AI Chat - Multi-step reasoning with 9 tools.
   */
  agentChat(userQuery: string, conversationId?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/agent/chat`, {
      userQuery,
      conversationId: conversationId || 'conv-' + Date.now(),
    });
  }

  /**
   * Ingest RAG document.
   */
  ingestRagDocument(title: string, category: string, content: string, sourceUrl: string = ''): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rag/ingest`, { title, category, content, sourceUrl });
  }

  /**
   * Query RAG vector store.
   */
  queryRag(query: string, topK: number = 3): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rag/query`, { query, topK });
  }

  /**
   * Multimodal: Analyze prescription image.
   */
  analyzePrescription(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.baseUrl}/multimodal/analyze-prescription`, formData);
  }

  /**
   * Multimodal: Recognize medicine image.
   */
  recognizeMedicine(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.baseUrl}/multimodal/recognize-medicine`, formData);
  }
}
