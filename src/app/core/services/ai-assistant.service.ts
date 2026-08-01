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
  private readonly baseUrl = environment.baseUrl;

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
        // SSE format: "data: <token>\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const token = line.slice(5).trim();
            if (token && token !== '[DONE]') {
              yield token;
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
      `${this.baseUrl}/assistant/drug-info/${encodeURIComponent(drugName)}`,
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
}
