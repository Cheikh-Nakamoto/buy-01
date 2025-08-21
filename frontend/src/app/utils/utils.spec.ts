import { HttpErrorResponse } from '@angular/common/http';
import { handleHttpError, reverseListDoubleLoop } from './utils';

describe('handleHttpError', () => {
  it('should return a client error message for an ErrorEvent', () => {
    const errorEvent = new ErrorEvent('Error', { message: 'Test client error' });
    const errorResponse = new HttpErrorResponse({ error: errorEvent, status: 0, statusText: 'Unknown Error' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Client error: Test client error');
  });

  it('should return a 400 error message for status 400', () => {
    const errorResponse = new HttpErrorResponse({ status: 400, statusText: 'Bad Request', error: { message: 'Invalid input' } });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Please check your input and try again.\n\nDetails: Invalid input');
  });

  it('should return a 401 error message for status 401', () => {
    const errorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('The password you’ve entered is incorrect. Please try again.');
  });

  it('should return a 403 error message for status 403', () => {
    const errorResponse = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe("You don't have permission to perform this action.");
  });

  it('should return a 404 error message for status 404', () => {
    const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Resource not found.');
  });

  it('should return a 409 error message for status 409', () => {
    const errorResponse = new HttpErrorResponse({ status: 409, statusText: 'Conflict' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Your Email is already registered. Please try logging in or use a different email address.');
  });

  it('should return a 413 error message for status 413', () => {
    const errorResponse = new HttpErrorResponse({ status: 413, statusText: 'Payload Too Large' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('File too large. Please select smaller files under 2MB.');
  });

  it('should return a 422 error message for status 422', () => {
    const errorResponse = new HttpErrorResponse({ status: 422, statusText: 'Unprocessable Entity' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Invalid data format. Please check your input.');
  });

  it('should return a 500 error message for status 500', () => {
    const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Server error. Please try again later.');
  });

  it('should return a 503 error message for status 503', () => {
    const errorResponse = new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Server error. Please try again later.');
  });

  it('should return a network error message for status 0', () => {
    const errorResponse = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Network error. Please check your connection.');
  });

  it('should return a default server error message if status is not handled', () => {
    const errorResponse = new HttpErrorResponse({ status: 418, statusText: 'I\'m a teapot', error: { message: 'Custom error' } });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Custom error');
  });

  it('should return a default server error message with status and message if no custom error message', () => {
    const errorResponse = new HttpErrorResponse({ status: 418, statusText: 'I\'m a teapot' });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Server error (418): Http failure response for (unknown url): 418 I\'m a teapot');
  });

  it('should handle error.error.status if error.status is undefined', () => {
    const errorResponse = new HttpErrorResponse({ error: { status: 400, message: 'Bad Request from error.error' } });
    const error = handleHttpError(errorResponse);
    expect(error.message).toBe('Network error. Please check your connection.');
  });
});

describe('reverseListDoubleLoop', () => {
  it('should reverse an empty array', () => {
    expect(reverseListDoubleLoop([])).toEqual([]);
  });

  it('should reverse an array with a single element', () => {
    expect(reverseListDoubleLoop([1])).toEqual([1]);
  });

  it('should reverse an array with multiple elements (numbers)', () => {
    expect(reverseListDoubleLoop([1, 2, 3, 4, 5])).toEqual([5, 4, 3, 2, 1]);
  });

  it('should reverse an array with multiple elements (strings)', () => {
    expect(reverseListDoubleLoop(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']);
  });

  it('should reverse an array with mixed types', () => {
    expect(reverseListDoubleLoop([1, 'b', true, null])).toEqual([null, true, 'b', 1]);
  });

  it('should handle arrays with duplicate elements', () => {
    expect(reverseListDoubleLoop([1, 2, 1, 3])).toEqual([3, 1, 2, 1]);
  });
});