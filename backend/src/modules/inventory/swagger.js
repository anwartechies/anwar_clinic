// Builds the module's OpenAPI paths from its Express routers, so the docs cannot miss a route.
const GROUPS = {
  auth: { tag: 'Inventory - Auth', prefix: '/api/auth', router: require('./routes/auth') },
  admin: { tag: 'Inventory - Admin', prefix: '/api', router: require('./routes/admin') },
  inventory: { tag: 'Inventory - Stock', prefix: '/api', router: require('./routes/inventory') },
  purchasing: { tag: 'Inventory - Purchasing', prefix: '/api', router: require('./routes/purchasing') },
  counts: { tag: 'Inventory - Stock counts', prefix: '/api', router: require('./routes/counts') },
  dispensing: { tag: 'Inventory - Dispensing', prefix: '/api', router: require('./routes/dispensing') },
  billing: { tag: 'Inventory - Billing', prefix: '/api', router: require('./routes/billing') },
  reports: { tag: 'Inventory - Reports', prefix: '/api', router: require('./routes/reports') },
};

const PUBLIC = new Set(['/api/auth/login', '/api/auth/refresh', '/api/auth/forgot', '/api/auth/forgot/verify', '/api/auth/forgot/reset', '/api/auth/invite/accept']);
const anyJson = { schema: { type: 'object', additionalProperties: true } };
const EXAMPLES = {
  '/api/auth/login': { identifier: 'user@example.com', password: 'your-password', client: 'web' },
  '/api/auth/refresh': { refreshToken: 'token-from-login' },
};

function operation(tag, method, path) {
  const params = [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({ name: m[1], in: 'path', required: true, schema: { type: 'string' } }));
  return {
    tags: [tag],
    summary: `${method.toUpperCase()} ${path}`,
    ...(PUBLIC.has(path) ? {} : { security: [{ InventoryBearerAuth: [] }] }),
    ...(params.length ? { parameters: params } : {}),
    ...(['post', 'put', 'patch'].includes(method) ? {
      requestBody: { content: { 'application/json': { ...anyJson, ...(EXAMPLES[path] ? { example: EXAMPLES[path] } : {}) } } },
    } : {}),
    responses: { 200: { description: 'Success' }, 400: { description: 'Invalid request' }, 401: { description: 'Not signed in' }, 403: { description: 'Not permitted' } },
  };
}

function inventoryPaths() {
  const paths = {};
  for (const { tag, prefix, router } of Object.values(GROUPS)) {
    for (const { route } of router.stack) {
      if (route) {
        const path = prefix + route.path.replace(/:(\w+)/g, '{$1}');
        for (const method of Object.keys(route.methods)) (paths[path] ||= {})[method] = operation(tag, method, path);
      }
    }
  }
  return paths;
}

const inventoryTags = Object.values(GROUPS).map(({ tag }) => ({ name: tag, description: 'Sign in with POST /api/auth/login and authorize with InventoryBearerAuth' }));

module.exports = { inventoryPaths, inventoryTags };
