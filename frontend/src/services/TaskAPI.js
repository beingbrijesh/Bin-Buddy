import api from '../utils/axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class TaskAPI {
  static async getBinDetails(binId) {
    try {
      const response = await api.get(`/bins/${binId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch bin details');
    }
  }

  static async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  }

  static async completeTask(taskData) {
    try {
      const response = await api.post(`/tasks/complete`, taskData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to complete task');
    }
  }

  static async verifyTask(verificationData) {
    try {
      const response = await api.post(
        `/tasks/${verificationData.taskId}/verify`,
        verificationData
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify task');
    }
  }

  static async getPendingTasks() {
    try {
      const response = await api.get(`/tasks/pending`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch pending tasks');
    }
  }

  static async getWorkerTasks(workerId) {
    try {
      const response = await api.get(`/tasks/worker/${workerId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch worker tasks');
    }
  }

  static async getTaskHistory(filters = {}) {
    try {
      const response = await api.get(`/tasks/history`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch task history');
    }
  }
}

export default TaskAPI; 