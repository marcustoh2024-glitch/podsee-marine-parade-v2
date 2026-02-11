/**
 * Generate stable centerId from postal code
 * Uses postal code as the unique identifier for each centre
 * This ensures comments persist across deployments and CSV reseeding
 */
export function generateCentreId(centre) {
  if (!centre || !centre.postalCode) {
    throw new Error('Centre must have a postal code to generate centerId');
  }
  
  // Use postal code directly as centerId
  // Normalize to string and trim whitespace
  return String(centre.postalCode).trim();
}

/**
 * Validate centerId format
 */
export function isValidCentreId(centreId) {
  return centreId && typeof centreId === 'string' && centreId.trim().length > 0;
}
