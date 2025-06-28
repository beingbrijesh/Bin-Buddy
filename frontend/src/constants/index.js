// Roles
export const ROLES = {
  ADMIN: 'admin',
  WORKER: 'worker',
  VOLUNTEER: 'volunteer',
  USER: 'user',
};

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  BINS: {
    LIST: '/bins',
    DETAIL: (id) => `/bins/${id}`,
    CREATE: '/bins',
    UPDATE: (id) => `/bins/${id}`,
    DELETE: (id) => `/bins/${id}`,
  },
  TASKS: {
    LIST: '/tasks',
    DETAIL: (id) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id) => `/tasks/${id}`,
    DELETE: (id) => `/tasks/${id}`,
  },
  WORKERS: {
    LIST: '/workers',
    DETAIL: (id) => `/workers/${id}`,
    CREATE: '/workers',
    UPDATE: (id) => `/workers/${id}`,
    DELETE: (id) => `/workers/${id}`,
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'binbuddy_token',
  USER_DATA: 'binbuddy_user',
  THEME: 'binbuddy_theme',
  DASHBOARD_VISITED: 'binbuddy_dashboard_visited',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  PHONE_REGEX: /^[0-9]{10}$/,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#279e0a',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  SUCCESS: '#10b981',
};

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MANAGEMENT: {
    BINS: '/management/bins',
    TASKS: '/management/tasks',
    WORKERS: '/management/workers',
    ANALYTICS: '/management/analytics',
  },
  QR: {
    GENERATOR: '/qr-generator',
    SCANNER: '/qr-scanner',
  },
  MAP: '/map-view',
}; 