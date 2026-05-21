// Centralized API error handling for better user experience

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 400:
        return error.response.data?.detail || 'Bad request.';
      case 404:
        return error.response.data?.detail || 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Server may be starting up. Please try again.';
      default:
        return `Error: ${error.response.data?.detail || 'Unknown error occurred'}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    if (error.message && error.message.includes('timeout')) {
      return 'Request timed out. Server may be starting up (cold start). Please try again in a few seconds.';
    }
    return 'Network error. Please check your connection or wait for the server to start.';
  } else {
    // Something else happened
    return 'An unexpected error occurred.';
  }
};

export const showApiError = (error, customMessage = null) => {
  const message = customMessage || handleApiError(error);
  
  // Log all errors to console
  console.error('[API]', message);
  
  // Only show alert for server errors (not network/timeout which are expected during cold starts)
  if (error.response && error.response.status >= 400) {
    // Don't alert on 404 for search queries (expected behavior)
    if (error.response.status === 404 && error.config?.url?.includes('search')) {
      return;
    }
    // Don't alert on export 404 (no data found)
    if (error.response.status === 404 && error.config?.url?.includes('export')) {
      return;
    }
  }
};
