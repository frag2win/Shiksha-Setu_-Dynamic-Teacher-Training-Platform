/**
 * Shiksha-Setu API Service Layer
 * Centralized API communication with error handling
 */

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  // ================== CLUSTERS ==================
  async getClusters() {
    return this.request('/api/clusters/');
  }

  async getCluster(id) {
    return this.request(`/api/clusters/${id}`);
  }

  async createCluster(clusterData) {
    // Map frontend field names to backend field names
    const backendData = {
      name: clusterData.name,
      region_type: clusterData.region_type,
      language: clusterData.language,
      infrastructure_constraints: clusterData.infrastructure_constraints || null,
      key_issues: clusterData.key_issues || null,
      grade_range: clusterData.grade_range || null
    };
    return this.request('/api/clusters/', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateCluster(id, clusterData) {
    // Map frontend field names to backend field names
    const backendData = {
      name: clusterData.name,
      region_type: clusterData.region_type,
      language: clusterData.language,
      infrastructure_constraints: clusterData.infrastructure_constraints || null,
      key_issues: clusterData.key_issues || null,
      grade_range: clusterData.grade_range || null
    };
    return this.request(`/api/clusters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
  }

  async deleteCluster(id) {
    return this.request(`/api/clusters/${id}`, {
      method: 'DELETE',
    });
  }

  // ================== MANUALS ==================
  async getManuals() {
    return this.request('/api/manuals/');
  }

  async getManual(id) {
    return this.request(`/api/manuals/${id}`);
  }

  async uploadManual(title, file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/manuals/upload?title=${encodeURIComponent(title)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return await response.json();
  }

  async indexManual(id) {
    return this.request(`/api/manuals/${id}/index`, {
      method: 'POST',
    });
  }

  async deleteManual(id) {
    return this.request(`/api/manuals/${id}`, {
      method: 'DELETE',
    });
  }

  // ================== MODULES ==================
  async getModules(filters = {}) {
    const params = new URLSearchParams();
    if (filters.cluster_id) params.append('cluster_id', filters.cluster_id);
    if (filters.manual_id) params.append('manual_id', filters.manual_id);
    
    const queryString = params.toString();
    return this.request(`/api/modules/${queryString ? `?${queryString}` : ''}`);
  }

  async getModule(id) {
    return this.request(`/api/modules/${id}`);
  }

  async generateModule(data) {
    // Map frontend fields to backend expected format
    const backendData = {
      manual_id: parseInt(data.manual_id),
      cluster_id: parseInt(data.cluster_id),
      topic: data.topic,
      target_language: data.target_language || null
    };
    return this.request('/api/modules/generate', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async approveModule(id) {
    return this.request(`/api/modules/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async deleteModule(id) {
    return this.request(`/api/modules/${id}`, {
      method: 'DELETE',
    });
  }

  async submitFeedback(moduleId, rating, comment = null) {
    return this.request(`/api/modules/${moduleId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  // ================== TRANSLATION ==================
  async translate(text, targetLanguage, sourceLanguage = 'english') {
    return this.request('/api/translation/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage,
      }),
    });
  }

  async batchTranslate(texts, targetLanguage, sourceLanguage = 'english') {
    return this.request('/api/translation/translate/batch', {
      method: 'POST',
      body: JSON.stringify({
        texts,
        target_language: targetLanguage,
        source_language: sourceLanguage,
      }),
    });
  }

  async getSupportedLanguages() {
    return this.request('/api/translation/languages');
  }
}

export const api = new ApiService();
export default api;
