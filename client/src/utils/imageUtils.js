/**
 * Convert HTTP image URLs to HTTPS to avoid mixed content errors
 * @param {string} url - Image URL
 * @returns {string} - HTTPS URL or original URL
 */
export const convertToHTTPS = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // If URL starts with http://, convert to https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
};

/**
 * Ensure image URL is valid and convert to HTTPS if needed
 * @param {string} url - Image URL
 * @returns {string} - Valid HTTPS URL
 */
export const ensureValidImageUrl = (url) => {
  if (!url) return '';
  
  // Convert to HTTPS if it's HTTP
  let validUrl = convertToHTTPS(url);
  
  // If URL is relative, ensure it starts with /
  if (!validUrl.startsWith('http') && !validUrl.startsWith('/')) {
    validUrl = '/' + validUrl;
  }
  
  return validUrl;
};

export default { convertToHTTPS, ensureValidImageUrl };

