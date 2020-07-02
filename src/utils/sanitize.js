export const sanitize = (body) => {
  delete body.createdAt;
  delete body.updatedAt;
  delete body.__v;
  return body;
};
