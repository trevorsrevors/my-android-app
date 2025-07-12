// Simple error logging utility for the calorie tracking app

export const setupErrorLogging = () => {
  // Global error handler for unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  console.log('Error logging setup complete');
};

export const logError = (message: string, error?: any) => {
  console.error(`[ERROR] ${message}`, error);
};

export const logWarning = (message: string, data?: any) => {
  console.warn(`[WARNING] ${message}`, data);
};

export const logInfo = (message: string, data?: any) => {
  console.log(`[INFO] ${message}`, data);
};