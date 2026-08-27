import api from './api';

export const uploadService = {
  /**
   * Check if upload service is configured on backend
   */
  async getStatus() {
    const response = await api.get('/upload/status');
    return response.data;
  },

  /**
   * Upload a single image file
   * @param {File} file
   * @param {string} folder
   */
  async uploadImage(file, folder = 'slipper-store/products') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Upload multiple image files
   * @param {FileList|File[]} files
   * @param {string} folder
   */
  async uploadImages(files, folder = 'slipper-store/products') {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete an uploaded image by URL or publicId
   * @param {string} url
   * @param {string} publicId
   */
  async deleteImage(url, publicId) {
    const response = await api.delete('/upload/image', {
      data: { url, publicId },
    });
    return response.data;
  },
};

export default uploadService;
