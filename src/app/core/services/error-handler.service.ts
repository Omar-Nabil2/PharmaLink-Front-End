import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Logs error details to the console and shows a toast message.
   * @param error The error object (HttpErrorResponse or standard Error).
   * @param defaultSummary The default title for the toast message.
   */
  handleError(error: any, defaultSummary: string = 'Error'): void {
    // 1. Log error to the console as requested
    console.error('[AppErrorHandler]', error);

    let title = defaultSummary;
    let detail = 'An unexpected error occurred. Please try again.';

    if (error instanceof HttpErrorResponse) {
      // Handle status 0 network/CORS errors
      if (error.status === 0) {
        title = 'Connection Failed';
        detail = 'Failed to connect to the server. This may be due to CORS blocking the response or a network disconnect.';
      } else {
        // Attempt to parse string errors (in case headers or interceptors didn't parse JSON)
        let errorBody = error.error;
        if (typeof errorBody === 'string') {
          try {
            errorBody = JSON.parse(errorBody);
          } catch (e) {
            // Not a JSON string
          }
        }

        if (errorBody) {
          title = errorBody.title || title;

          // Parse based on Schema type
          if (errorBody.errors) {
            const errors = errorBody.errors;

            if (typeof errors.message === 'string') {
              // Schema 2: Mistake / Conflict / Bad Request (e.g. { errors: { code: "...", message: "..." } })
              detail = errors.message;
            } else {
              // Schema 1: Field validation lists (e.g. { errors: { Email: ["..."], ... } })
              const errorList: string[] = [];
              Object.keys(errors).forEach((key) => {
                const messages = errors[key];
                if (Array.isArray(messages)) {
                  errorList.push(...messages);
                } else if (typeof messages === 'string') {
                  errorList.push(messages);
                }
              });
              detail = errorList.length > 0 ? errorList[0] : 'Validation failed.';
            }
          } else {
            // Schema 3: General HTTP / Server error (500, 403, 401, etc.)
            detail = errorBody.detail || errorBody.message || error.message || detail;
          }
        } else {
          detail = error.message || detail;
        }
      }
    } else if (error instanceof Error) {
      detail = error.message;
    } else if (typeof error === 'string') {
      detail = error;
    }

    // Display the toast message
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: detail,
      life: 6000,
    });
  }
}
