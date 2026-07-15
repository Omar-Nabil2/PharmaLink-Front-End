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
          errors = errorBody.errors;

          if (errorBody.errors) {
            const errDetails = errorBody.errors;
            if (typeof errDetails.message === 'string') {
              // Schema 2: User mistake/Conflict (e.g. email already exists)
              type = ErrorType.UserError;
              title = errorBody.title || 'Action Blocked';
              message = errDetails.message;
            } else {
              // Schema 1: Validation
              type = ErrorType.ValidationError;
              title = errorBody.title || 'Check Form Details';
              
              const errorList: string[] = [];
              Object.keys(errDetails).forEach((key) => {
                const messages = errDetails[key];
                if (Array.isArray(messages)) {
                  errorList.push(...messages);
                } else if (typeof messages === 'string') {
                  errorList.push(messages);
                }
              });
              
              message = errorList.length > 0 
                ? errorList[0] 
                : 'Some form details are incorrect. Please verify and try again.';
            }
          } else {
            // Schema 3: Server/Access errors
            type = ErrorType.ServerOrAccessError;

            if (error.status >= 500) {
              title = 'Server Busy';
              message = 'Our servers are experiencing issues right now. We are working on it—please try again soon!';
            } else if (error.status === 401) {
              title = 'Unauthorized';
              message = 'You need to be logged in to perform this action. Please sign in and try again.';
            } else if (error.status === 403) {
              title = 'Permission Denied';
              message = 'You do not have permission to access this resource or perform this action.';
            } else {
              title = errorBody.title || title;
              message = errorBody.detail || errorBody.message || error.message || message;
            }
          }
        } else {
          message = error.message || message;
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
