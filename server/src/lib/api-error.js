/**
 * A thrown error that carries an HTTP status.
 *
 * Controllers can `throw new ApiError(404, "Product not found")` instead of
 * returning a response from three levels of nesting. Express 5 forwards a
 * rejected promise from an async handler straight to the error middleware, so
 * no asyncHandler wrapper is needed.
 */
class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (details) this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Please login with your email and password") {
    return new ApiError(401, message);
  }

  static forbidden(message = "You do not have access to this resource") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message, details) {
    return new ApiError(409, message, details);
  }
}

module.exports = { ApiError };
