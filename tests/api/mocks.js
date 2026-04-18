const { rest } = require('msw');

// API mocking utilities using MSW
export const handlers = [
  // Example mock handler
  rest.get('/api/example', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'mocked' }));
  }),
];

export const server = setupServer(...handlers);