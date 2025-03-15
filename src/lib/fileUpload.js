/**
 * Handles file upload to server
 * @param {File} file - The file to upload
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} - Uploaded file details
 */
export const uploadFile = async (file, projectId) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
