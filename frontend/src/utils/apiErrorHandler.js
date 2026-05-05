// Centralized API error handling for better user experience

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Error: ${error.response.data?.detail || 'Unknown error occurred'}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    if (error.message.includes('timeout')) {
      return 'Request timed out. Server may be starting up. Please try again.';
    }
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return 'An unexpected error occurred.';
  }
};

export const showApiError = (error, customMessage = null) => {
  const message = customMessage || handleApiError(error);
  
  // You can replace this with your preferred notification system
  console.error(message);
  
  // For React components, you might want to use a toast or alert
  if (typeof window !== 'undefined') {
    // Simple alert for now - replace with better UI
    alert(message);
  }
};
