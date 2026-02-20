import { API_BASE } from '../config';
import { getFreshIdToken } from './auth';
import axios from 'axios';

/**
 * @typedef {Object} CapabilityPayload
 * @property {boolean} isPlatformSuperadmin
 * @property {string[] | "ALL"} managedColleges
 * @property {string[] | "ALL"} managedPrograms
 * @property {string[] | "ALL"} managedYears
 * @property {string[] | "ALL"} managedSubjects
 */

/**
 * @typedef {"pending"|"processing"|"completed"|"failed"} EmbeddingStatus
 */

/**
 * @typedef {Object} ResourceItem
 * @property {string} id
 * @property {string} title
 * @property {string} uploaded_by
 * @property {string} created_at
 * @property {EmbeddingStatus} embedding_status
 */

/**
 * @typedef {"random_resource"|"random_subject"|"relevant_resource"|"relevant_subject"} TestScopeType
 */

/**
 * @typedef {Object} TestGenerationRequest
 * @property {TestScopeType} scope_type
 * @property {string} scope_id
 * @property {number=} number_of_questions
 * @property {string=} language
 * @property {"easy"|"medium"|"hard"=} difficulty
 * @property {string=} query
 */

/**
 * @typedef {Object} TestQuestion
 * @property {string} question_text
 * @property {string[]} options
 * @property {number} correct_answer
 * @property {string} explanation
 */

/**
 * @typedef {Object} TestGenerationResponse
 * @property {string} topic
 * @property {string} language
 * @property {string} difficulty
 * @property {TestQuestion[]} questions
 */

/**
 * @typedef {Object} TheoryQuestion
 * @property {number} marks
 * @property {string} question
 * @property {string} answer
 * @property {string} concept
 */

/**
 * @typedef {Object} TheoryTestGenerationResponse
 * @property {{difficulty: string, language: string, questions: TheoryQuestion[]}} theory_test
 * @property {string[]} random_chunks
 */

/**
 * @typedef {Object} TestAnalysisResponse
 * @property {string} topic
 * @property {string} language
 * @property {string} difficulty
 * @property {string=} detailed_desciption
 * @property {string=} detailed_description
 * @property {string[]} topics_to_focus
 * @property {string[]} detailed_plan_to_improve
 */

/**
 * @typedef {Object} TheoryQuestionEvaluation
 * @property {number} question_index
 * @property {string} feedback
 * @property {number} marks_awarded
 */

/**
 * @typedef {Object} TheoryTestAnalysisResponse
 * @property {TheoryQuestionEvaluation[]} question_evaluations
 * @property {string} overall_analysis
 */

let handlers = {
  onUnauthorized: null,
  onForbidden: null,
  onRateLimit: null
};

export function setApiHandlers(newHandlers = {}) {
  handlers = { ...handlers, ...newHandlers };
}

async function parseError(res, path) {
  let detail;
  try {
    const data = await res.json();
    detail = data?.detail ?? data;
  } catch {
    try {
      detail = await res.text();
    } catch {
      detail = res.statusText || 'Request failed';
    }
  }

  const message =
    (typeof detail === 'string' ? detail : detail?.message || detail?.detail) ||
    res.statusText ||
    'Request failed';

  const err = new Error(message);
  err.status = res.status;
  err.detail = typeof detail === 'string' ? { detail } : detail;
  err.path = path;
  return err;
}

async function request(path, options = {}, meta = {}) {
  const { adminAction = false } = meta;
  const headers = { ...(options.headers || {}) };

  // Always attach a fresh token; fail fast if missing (all protected requests require auth)
  const token = await getFreshIdToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.status = 401;
    if (handlers.onUnauthorized) await handlers.onUnauthorized(err, meta);
    throw err;
  }
  headers.Authorization = `Bearer ${token}`;

  let body = options.body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let didRetryAfterRefresh = false;

  while (true) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: options.credentials ?? 'omit',
      headers,
      body
    });

    if (!res.ok) {
      // Retry once on 401 with forced token refresh (silent refresh flow).
      if (res.status === 401 && !didRetryAfterRefresh) {
        const refreshed = await getFreshIdToken(true);
        if (refreshed) {
          headers.Authorization = `Bearer ${refreshed}`;
          didRetryAfterRefresh = true;
          continue;
        }
      }

      const err = await parseError(res, path);
      err.adminAction = adminAction;

      if (res.status === 401 && handlers.onUnauthorized) {
        await handlers.onUnauthorized(err, meta);
      }
      if (res.status === 403 && handlers.onForbidden) {
        await handlers.onForbidden(err, meta);
      }
      if (res.status === 429 && handlers.onRateLimit) {
        const retryAfterHeader = res.headers.get('retry-after');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
        await handlers.onRateLimit(err, { ...meta, retryAfterSeconds });
      }

      throw err;
    }

    if (res.status === 204) return null;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  }
}

export const api = {
  get: (path, meta) => request(path, { method: 'GET' }, meta),
  post: (path, body, meta) =>
    request(path, { method: 'POST', body: body ?? {} }, meta),
  delete: (path, meta) => request(path, { method: 'DELETE' }, meta),
  request
};

// Form-data for confirm-upload (backend expects query params)
export async function confirmUpload(
  subjectId,
  title,
  resourceType,
  fileKey,
  meta = {}
) {
  const params = new URLSearchParams({
    subject_id: subjectId,
    title,
    resource_type: resourceType,
    file_key: fileKey
  });
  return request(`/confirm-upload?${params.toString()}`, { method: 'POST' }, { ...meta, adminAction: true });
}

export async function getPresignedPost(subjectId, meta = {}) {
  return api.post(`/generate-upload-url/${subjectId}`, {}, meta);
}

export async function getViewUrl(resourceId, meta = {}) {
  return api.get(`/view/${resourceId}`, meta);
}

export async function generateEmbeddings(resourceId, meta = {}) {
  return api.post(`/resources/${resourceId}/generate_embeddings`, {}, meta);
}

/**
 * @param {TestGenerationRequest} payload
 * @param {Object=} meta
 * @returns {Promise<TestGenerationResponse>}
 */
export async function generateTest(payload, meta = {}) {
  const scopeType = payload?.scope_type;
  const requestBody = {
    scope_type: scopeType,
    scope_id: payload?.scope_id,
    number_of_questions: payload?.number_of_questions,
    language: payload?.language,
    difficulty: payload?.difficulty
  };

  if (typeof scopeType === 'string' && scopeType.startsWith('relevant')) {
    requestBody.query = payload?.query;
  }

  return api.post('/tests/generate', requestBody, meta);
}

/**
 * @param {TestGenerationRequest} payload
 * @param {Object=} meta
 * @returns {Promise<TheoryTestGenerationResponse>}
 */
export async function generateTheoryTest(payload, meta = {}) {
  const scopeType = payload?.scope_type;
  const requestBody = {
    scope_type: scopeType,
    scope_id: payload?.scope_id,
    number_of_questions: payload?.number_of_questions,
    language: payload?.language,
    difficulty: payload?.difficulty
  };

  if (typeof scopeType === 'string' && scopeType.startsWith('relevant')) {
    requestBody.query = payload?.query;
  }

  return api.post('/tests/theorytest/generate', requestBody, meta);
}

function normalizeMcqStudentAnswers(studentAnswer) {
  if (Array.isArray(studentAnswer)) return studentAnswer;
  if (studentAnswer && typeof studentAnswer === 'object') return [studentAnswer];
  return [];
}

function normalizeMcqAnalysisPayload(payload) {
  return {
    test: payload?.test,
    student_answer: normalizeMcqStudentAnswers(payload?.student_answer)
  };
}

/**
 * @param {{ test: TestGenerationResponse, student_answer: { question_index: number, selected_option: number }[] | { question_index: number, selected_option: number } }} payload
 * @param {Object=} meta
 * @returns {Promise<TestAnalysisResponse>}
 */
export async function analyzeTest(payload, meta = {}) {
  return api.post('/tests/analyze', normalizeMcqAnalysisPayload(payload), meta);
}

/**
 * @param {{ theory_test: TheoryTestGenerationResponse, student_answer: { question_index: number, student_answer: string }[] }} payload
 * @param {Object=} meta
 * @returns {Promise<TheoryTestAnalysisResponse>}
 */
export async function analyzeTheoryTest(payload, meta = {}) {
  return api.post('/tests/theorytest/analyze', payload, meta);
}

async function buildAuthHeaders() {
  const token = await getFreshIdToken();
  if (!token) {
    const err = new Error('Not authenticated');
    err.status = 401;
    throw err;
  }

  return { Authorization: `Bearer ${token}` };
}

function normalizeAxiosError(error, path) {
  if (!error?.response) return error;

  const detail = error.response.data?.detail ?? error.response.data;
  const message =
    (typeof detail === 'string' ? detail : detail?.message || detail?.detail) ||
    error.response.statusText ||
    'Request failed';

  const err = new Error(message);
  err.status = error.response.status;
  err.detail = typeof detail === 'string' ? { detail } : detail;
  err.path = path;
  return err;
}

/**
 * Axios-based test generation helper.
 * @param {TestGenerationRequest} payload
 * @returns {Promise<TestGenerationResponse>}
 */
export async function generateTestAxios(payload) {
  const scopeType = payload?.scope_type;
  const requestBody = {
    scope_type: scopeType,
    scope_id: payload?.scope_id,
    number_of_questions: payload?.number_of_questions,
    language: payload?.language,
    difficulty: payload?.difficulty
  };

  if (typeof scopeType === 'string' && scopeType.startsWith('relevant')) {
    requestBody.query = payload?.query;
  }

  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post(`${API_BASE}/tests/generate`, requestBody, {
      headers,
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    throw normalizeAxiosError(error, '/tests/generate');
  }
}

/**
 * Axios-based theory test generation helper.
 * @param {TestGenerationRequest} payload
 * @returns {Promise<TheoryTestGenerationResponse>}
 */
export async function generateTheoryTestAxios(payload) {
  const scopeType = payload?.scope_type;
  const requestBody = {
    scope_type: scopeType,
    scope_id: payload?.scope_id,
    number_of_questions: payload?.number_of_questions,
    language: payload?.language,
    difficulty: payload?.difficulty
  };

  if (typeof scopeType === 'string' && scopeType.startsWith('relevant')) {
    requestBody.query = payload?.query;
  }

  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post(`${API_BASE}/tests/theorytest/generate`, requestBody, {
      headers,
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    throw normalizeAxiosError(error, '/tests/theorytest/generate');
  }
}

/**
 * Axios-based test analysis helper.
 * @param {{ test: TestGenerationResponse, student_answer: { question_index: number, selected_option: number }[] | { question_index: number, selected_option: number } }} payload
 * @returns {Promise<TestAnalysisResponse>}
 */
export async function analyzeTestAxios(payload) {
  const headers = await buildAuthHeaders();
  const requestBody = normalizeMcqAnalysisPayload(payload);

  try {
    const response = await axios.post(`${API_BASE}/tests/analyze`, requestBody, {
      headers,
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    throw normalizeAxiosError(error, '/tests/analyze');
  }
}

/**
 * Axios-based theory test analysis helper.
 * @param {{ theory_test: TheoryTestGenerationResponse, student_answer: { question_index: number, student_answer: string }[] }} payload
 * @returns {Promise<TheoryTestAnalysisResponse>}
 */
export async function analyzeTheoryTestAxios(payload) {
  const headers = await buildAuthHeaders();

  try {
    const response = await axios.post(`${API_BASE}/tests/theorytest/analyze`, payload, {
      headers,
      withCredentials: false
    });
    return response.data;
  } catch (error) {
    throw normalizeAxiosError(error, '/tests/theorytest/analyze');
  }
}
