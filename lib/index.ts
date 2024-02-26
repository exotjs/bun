import { Inspector } from '@exotjs/inspector';
import type { ExotWebSocketServerOptions } from './types.js';
import type { WebSocketServeOptions } from 'bun';
import type { Session } from '@exotjs/inspector/session';

export const websocket = (
  options: ExotWebSocketServerOptions
): WebSocketServeOptions<{
  inspectorSession?: Session;
}> => {
  const { authorize, inspector, path = '/_inspector' } = options;
  if (!(inspector instanceof Inspector)) {
    throw new Error(`Invalid inspector instance.`);
  }
  return {
    async fetch(req, server) {
      const url = new URL(req.url);
      let user: string | undefined = void 0;
      if (url.pathname === path) {
        if (authorize) {
          try {
            user = await authorize(req, server);
          } catch (err: any) {
            return new Response(String(err.message || '401'), {
              status: 401,
            });
          }
        }
        const inspectorSession = inspector.createSession({
          remoteAddress: server.requestIP(req)?.address,
          user,
        });
        server.upgrade(req, {
          data: {
            inspectorSession,
          },
        });
        return;
      }
      return new Response('403', {
        status: 403,
      });
    },
    websocket: {
      close(ws) {
        if (ws.data?.inspectorSession) {
          ws.data.inspectorSession.destroy();
          ws.data.inspectorSession = void 0;
        }
      },
      message(ws, message) {
        if (ws.data?.inspectorSession) {
          ws.data.inspectorSession.handleMessage(message);
        }
      },
      open(ws) {
        if (ws.data?.inspectorSession) {
          ws.data.inspectorSession.on('message', (data) => {
            ws.send(data);
          });
        }
      },
    },
  };
};
