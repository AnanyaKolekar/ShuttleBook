const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === 'function') {
      return next(err);
    }
    // Fallback if Express did not supply next (should not happen, but protects against crashes)
    // eslint-disable-next-line no-console
    console.error('Async handler fallback:', err);
    return res.status(500).json({ message: err.message || 'Server Error' });
  });
};

module.exports = asyncHandler;

