import { HttpErrorResponse } from "@angular/common/http";

/**
 * Handles HTTP errors by generating a user-friendly error message based on the HTTP status code.
 * @param error The HttpErrorResponse object received from an HTTP request.
 * @returns An Error object containing a descriptive error message.
 */
export function handleHttpError(error: HttpErrorResponse): Error {
    let errorMessage = 'An unexpected error occurred';
    if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Client error: ${error.error.message}`;
    } else {
        // Erreur côté serveur
        const serverMessage = error.error?.message ? `\n\nDetails: ${error.error.message}` : `\n\nDetails: ${error.message}`;
        const status = error.status == undefined ? error.error?.status : error.status;
        console.log("status received :", status , serverMessage);
        switch (status) {
            case 400:
                errorMessage = `Bad request. Please check your data.${serverMessage}`;
                break;
            case 401:
                errorMessage = `Unauthorized. Please log in again.${serverMessage}`;
                break;
            case 403:
                errorMessage = `Forbidden. You don't have permission to perform this action.${serverMessage}`;
                break;
            case 404:
                errorMessage = `Resource not found.${serverMessage}`;
                break;
            case 409:
                errorMessage = `Conflict. The resource already exists.${serverMessage}`;
                break;
            case 413:
                errorMessage = `File too large. Please select smaller files.${serverMessage}`;
                break;
            case 422:
                errorMessage = `Invalid data format. Please check your inputs.${serverMessage}`;
                break;
            case 500:
                errorMessage = `Server error. Please try again later.${serverMessage}`;
                break;
            case 0:
                errorMessage = `Network error. Please check your connection.${serverMessage}`;
                break;
            default:
                errorMessage = error.error?.message || `Server error (${error.status})${serverMessage}`;
        }
    }

    return new Error(errorMessage);
}


/**
 * Inverse un tableau en utilisant une double boucle.
 * @param list Le tableau à inverser.
 * @returns Un nouveau tableau inversé.
 */
export function reverseListDoubleLoop<T>(list: T[]): T[] {
  const reversed: T[] = [];
  for (let i = 0; i < list.length; i++) {
    // Deuxième boucle pour trouver la position inverse
    for (let j = 0; j < list.length; j++) {
      if (j === list.length - 1 - i) {
        reversed.push(list[j]);
      }
    }
  }
  return reversed;
}