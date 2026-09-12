const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateRewardId(id) {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    return {
      isValid: false,
      message: 'Invalid reward ID format.'
    };
  }
  return { isValid: true };
}

function validateInventoryId(id) {
  if (!id || typeof id !== 'string' || !UUID_REGEX.test(id)) {
    return {
      isValid: false,
      message: 'Invalid inventory ID format.'
    };
  }
  return { isValid: true };
}

module.exports = {
  validateRewardId,
  validateInventoryId
};
