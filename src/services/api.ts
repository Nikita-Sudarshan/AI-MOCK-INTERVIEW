export const api = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = 'Failed to upload resume';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON
          const text = await res.text();
          errorMessage = text || `Error ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return res.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Upload timed out. The file might be too large or the server is slow.');
      }
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not reach the server. Please check your connection or try again.');
      }
      throw error;
    }
  },
};
