export function sendSuccess(
  res,
  data,
  meta,
  statusCode = 200
) {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res,
  message,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details
) {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
