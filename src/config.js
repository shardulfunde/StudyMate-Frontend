// Backend API base URL (FastAPI)
// Prefer new env VITE_API_BASE_URL; fallback to legacy VITE_API_URL for compatibility.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

// Chatbot backend URL – do not change
export const CHATBOT_API_URL = 'https://studymateai-q6n3.onrender.com/cognimate/answer';
