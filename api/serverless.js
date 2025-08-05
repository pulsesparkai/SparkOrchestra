export default async (req, res) => {
  const { default: app } = await import('../dist/index.js');
  return app(req, res);
};