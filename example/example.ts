import { Inspector } from '@exotjs/inspector';
import { MemoryStore } from '@exotjs/inspector/store';
import { webSocketServer } from '../lib/index.js';

const inspector = new Inspector({
  store: new MemoryStore(),
});

const { trace } = inspector.instruments.traces;

Bun.serve({
  fetch(req) {
    return trace('request', ({ addAttribute }) => {
      addAttribute('method', req.method);
      addAttribute('url', req.url);

      return new Response('Bun!');
    });
  },
  port: 3000,
});

Bun.serve({
  ...webSocketServer({
    inspector,
  }),
  port: 3003,
});
