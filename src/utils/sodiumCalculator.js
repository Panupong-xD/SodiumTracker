/**
 * Calculate the recommended daily sodium intake based on user profile and kidney disease stage
 * @param {Object} profile User profile data
 * @returns {number} Recommended daily sodium intake in milligrams
 */
export const calculateRecommendedSodium = (profile) => {
  // Base sodium recommendation for general population (in mg)
  const baseSodium = 2300;
  
  // Get kidney stage
  const kidneyStage = profile.kidneyStage;
  
  // Adjust sodium recommendation based on kidney disease stage
  switch (kidneyStage) {
    case '1':
      // Stage 1: Mild reduction (~10% reduction)
      return 2000;
    case '2':
      // Stage 2: Moderate reduction (~20% reduction)
      return 1800;
    case '3a':
      // Stage 3a: Significant reduction (~30% reduction)
      return 1500;
    case '3b':
      // Stage 3b: Further significant reduction (~40% reduction)
      return 1300;
    case '4':
      // Stage 4: Major reduction (~50% reduction)
      return 1000;
    case '5':
      // Stage 5: Severe reduction (~60% reduction)
      return 750;
    default:
      // Default to general recommendation
      return baseSodium;
  }
};

/**
 * Format sodium amount with appropriate unit
 * @param {number} amount Sodium amount in milligrams
 * @returns {string} Formatted sodium amount
 */
export const formatSodiumAmount = (amount) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} กรัม`;
  }
  return `${amount} มก.`;
};

/**
 * Calculate percentage of daily sodium intake
 * @param {number} amount Consumed sodium amount in milligrams
 * @param {number} recommendedAmount Recommended daily sodium intake
 * @returns {number} Percentage of daily intake
 */
export const calculatePercentage = (amount, recommendedAmount) => {
  if (!recommendedAmount) return 0;
  
  const percentage = (amount / recommendedAmount) * 100;
  return Math.min(Math.round(percentage), 100); // Cap at 100%
};
