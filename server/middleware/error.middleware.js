export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}
export function errorHandler(error, req, res, next) {
  let status = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error';
  if (error.name === 'ValidationError') { status = 400; message = Object.values(error.errors).map((item) => item.message).join(', '); }
  if (error.name === 'ZodError') { status = 400; message = error.issues.map((issue) => issue.message).join(', '); }
  if (error.name === 'CastError') { status = 400; message = 'Invalid resource identifier'; }
  if (error.code === 11000) { status = 409; message = 'An account with this email already exists'; }
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') { status = 401; message = 'Invalid or expired token'; }
  if (process.env.NODE_ENV !== 'production') console.error(error);
  res.status(status).json({ message });
}
