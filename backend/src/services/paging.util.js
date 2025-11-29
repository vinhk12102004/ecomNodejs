export function getPaging(req, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  let limit = Math.max(1, parseInt(req.query.limit || defaultLimit, 10));
  limit = Math.min(limit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
