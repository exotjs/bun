import {
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
} from 'bun:test';
import { Inspector } from '@exotjs/inspector';
import { MemoryStore } from '@exotjs/inspector/store';
import { webSocketServer } from '../lib/index.js';
import type { Server } from 'bun';

describe('webSocketServer()', () => {
  let inspector: Inspector;

  afterAll(() => {
    if (inspector) {
      inspector.destroy();
    }
  });

  beforeAll(() => {
    inspector = new Inspector({
      store: new MemoryStore(),
    });
  });

  it('should throw an error if inspector is not provided', () => {
    expect(() => webSocketServer({} as any)).toThrow();
  });

  it('should throw an error if inspector is invalid', () => {
    expect(() =>
      webSocketServer({
        inspector: {} as any,
      })
    ).toThrow();
  });

  it('should return Bun.serve options for websockets', () => {
    const result = webSocketServer({
      inspector,
    });
    expect(result).toEqual({
      fetch: expect.any(Function),
      websocket: {
        close: expect.any(Function),
        message: expect.any(Function),
        open: expect.any(Function),
      },
    });
  });

  describe('connection', () => {
    let server: Server;

    afterEach(() => {
      if (server) {
        server.stop(true);
      }
    });

    beforeEach(() => {
      server = Bun.serve({
        ...webSocketServer({
          inspector,
        }),
      });
    });

    it('should fail if the path does not match', async () => {
      await new Promise((resolve) => {
        const ws = new WebSocket(`ws://127.0.0.1:${server.port}/wrong_path`);
        let opened = false;
        ws.addEventListener('open', () => {
          opened = true;
        });
        ws.addEventListener('close', () => {
          expect(opened).toBeFalse();
          resolve(void 0);
        });
      });
    });

    it('should connect and receive response to hello', async () => {
      await new Promise((resolve) => {
        const ws = new WebSocket(`ws://127.0.0.1:${server.port}/_inspector`);
        ws.addEventListener('open', () => {
          ws.addEventListener('message', (ev) => {
            const json = JSON.parse(String(ev.data));
            expect(json.id).toEqual(1);
            expect(json.type).toEqual('ok');
            expect(json.data).toBeDefined();
            resolve(void 0);
          });
          ws.send(
            JSON.stringify({
              id: 1,
              type: 'hello',
            })
          );
        });
      });
    });
  });

  describe('authorization', () => {
    let server: Server;

    afterEach(() => {
      if (server) {
        server.stop(true);
      }
    });

    it('should fail if the authorization throws', async () => {
      server = Bun.serve({
        ...webSocketServer({
          authorize(req, server) {
            throw new Error('test');
          },
          inspector,
        }),
      });
      await new Promise((resolve) => {
        const ws = new WebSocket(`ws://127.0.0.1:${server.port}/_inspector`);
        let opened = false;
        ws.addEventListener('open', () => {
          opened = true;
        });
        ws.addEventListener('close', () => {
          expect(opened).toBeFalse();
          resolve(void 0);
        });
      });
    });

    it('should connect and set user', async () => {
      server = Bun.serve({
        ...webSocketServer({
          authorize(req, server) {
            return 'test user';
          },
          inspector,
        }),
      });
      await new Promise((resolve) => {
        const ws = new WebSocket(`ws://127.0.0.1:${server.port}/_inspector`);
        ws.addEventListener('open', () => {
          ws.addEventListener('message', (ev) => {
            const json = JSON.parse(String(ev.data));
            expect(json.id).toEqual(1);
            expect(json.type).toEqual('ok');
            expect(json.data).toBeDefined();
            expect(inspector.sessions.size).toEqual(1);
            expect(inspector.sessions.values().next().value.user).toEqual(
              'test user'
            );
            resolve(void 0);
          });
          ws.send(
            JSON.stringify({
              id: 1,
              type: 'hello',
            })
          );
        });
      });
    });
  });
});
