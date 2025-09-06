export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

export const errorLogger = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  next(err);
};