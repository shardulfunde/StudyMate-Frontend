// Backend API base URL (FastAPI)
// Prefer new env VITE_API_BASE_URL; fallback to legacy VITE_API_URL for compatibility.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

export const STUDYMATE_ANDROID_APK_URL =
  'https://download1591.mediafire.com/pxogs5y4vxkgMujgo_TfQ9GoWJVqg9ld0zzmNAvZPEf_cdwEBJr31fY1QsJhsJEUmnLFTo0zGzqe7HIlNN36ShaLdvBwzGCm-ph-JP_COw1580gbf_cvIoL3XhSIIN_Z-u3Re3WjTiXWhNRrgArKj5ihV2iO9MDFDJnIfAfWJL23ajA/61qxaer5bc4u8o4/StudyMate.apk';

// Chatbot backend URL - do not change
export const CHATBOT_API_URL = 'https://studymateai-q6n3.onrender.com/cognimate/answer';
