const { ApiError } = require("../lib/api-error");

/**
 * Terminal 404. Registered after every router, so anything that reached this
 * point matched no route.
 *
 * Without it Express answers with its default HTML error page, which a client
 * expecting JSON parses as a syntax error rather than a missing endpoint.
 */
function notFound(req, res) {
  return res.status(404).json({
    error: `No route for ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Central error handler.
 *
 * Express 5 forwards rejections from async route handlers here automatically,
 * so controllers can throw instead of hand-rolling a try/catch that logs and
 * returns 500. Mongoose's own error shapes are translated into the status the
 * client should actually receive.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error
// middleware by arity; `next` must stay in the signature.
function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let details;

  // Schema validation — report every field at once rather than the first.
  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Validation failed";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
  }

  // A malformed ObjectId is a bad request, not a server fault.
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Unique index violation.
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue ?? {})[0];
    message = field ? `That ${field} is already in use` : "Already exists";
  }

  if (err instanceof ApiError && err.details) {
    details = err.details;
  }

  // Log the ones that are actually our fault, with enough context to find them.
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  const body = { error: message };
  if (details) body.details = details;

  // A stack trace in a response body is a gift to an attacker; only in dev.
  if (process.env.NODE_ENV !== "production" && status >= 500) {
    body.stack = err.stack;
  }

  return res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
