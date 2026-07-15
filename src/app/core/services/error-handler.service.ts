import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ErrorType, ParsedError } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Standardizes raw errors into parsed, human-readable error models.
   * @param error The raw error object to analyze.
   */
  parseError(error: any): ParsedError {
    let type = ErrorType.UnknownError;
    let title = 'Something went wrong';
    let message = 'An unexpected error occurred. Please try again.';
    let errors: any = null;

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        type = ErrorType.ConnectionError;
        title = 'Connection Failed';
        message = "We're having trouble reaching our servers. Check your internet connection or try again shortly.";
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

        const isAccessError = error.status === 401 || error.status === 403;

        if (errorBody) {
          title = errorBody.title || title;
          errors = errorBody.errors;

          if (errors && typeof errors.message === 'string') {
            // Treat as UserError if the server explicitly provided a code/message structure, regardless of status code (e.g. 503 WebhookFailed)
            type = ErrorType.UserError;
            message = errors.message;
          } else if (isAccessError) {
            // Treat access errors without a custom code/message block as UserError
            type = ErrorType.UserError;
            title = errorBody.title || (error.status === 401 ? 'Sign In Required' : 'Access Denied');
            
            if (errorBody.detail) {
              message = errorBody.detail;
            } else if (errorBody.message) {
              message = errorBody.message;
            } else if (errorBody.error && typeof errorBody.error === 'string') {
              message = errorBody.error;
            } else if (typeof errorBody === 'string') {
              message = errorBody;
            } else {
              message = error.status === 401
                ? 'Please sign in first so we can verify who you are.'
                : "It looks like you don't have access to do that. Please contact support if you think this is a mistake.";
            }
          } else if (errorBody.errors) {
            // Schema 1: Validation
            type = ErrorType.ValidationError;
            title = errorBody.title || 'Check Form Details';
            
            const errorList: string[] = [];
            Object.keys(errorBody.errors).forEach((key) => {
              const messages = errorBody.errors[key];
              if (Array.isArray(messages)) {
                errorList.push(...messages);
              } else if (typeof messages === 'string') {
                errorList.push(messages);
              }
            });
            
            message = errorList.length > 0 
              ? errorList[0] 
              : 'Some form details are incorrect. Please verify and try again.';
          } else {
            // Schema 3: General HTTP / Server error (500, 503 with no errors block, etc.)
            if (error.status >= 500) {
              type = ErrorType.ServerOrAccessError;
              title = 'Server Busy';
              message = 'Our servers are experiencing issues right now. We are working on it—please try again soon!';
            } else {
              type = ErrorType.UnknownError;
              title = errorBody.title || title;
              message = errorBody.detail || errorBody.message || error.message || message;
            }
          }
        } else {
          // Fallback if server returned no body at all
          if (isAccessError) {
            type = ErrorType.UserError;
            title = error.status === 401 ? 'Sign In Required' : 'Access Denied';
            message = error.status === 401
              ? 'Please sign in first so we can verify who you are.'
              : "It looks like you don't have access to do that. Please contact support if you think this is a mistake.";
          } else {
            message = error.message || message;
          }
        }
      }
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    return { type, title, message, errors, raw: error };
  }

  /**
   * Logs error details to the console and shows a user-friendly toast message.
   * @param error The error object (HttpErrorResponse or standard Error).
   * @param defaultSummary The default title for the toast message if one cannot be resolved.
   */
  handleError(error: any, defaultSummary?: string): void {
    const parsed = this.parseError(error);
    
    // Log details to dev console for debugging as requested
    console.error('[ErrorHandler] Parsed Details:', parsed);

    this.messageService.add({
      severity: parsed.type === ErrorType.ValidationError ? 'warn' : 'error',
      summary: defaultSummary || parsed.title,
      detail: parsed.message,
      life: 6000,
    });
  }
}
