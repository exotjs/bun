import type { Inspector } from '@exotjs/inspector';
import type { Server } from 'bun';

export interface ExotWebSocketServerOptions {
  authorize?: (
    req: Request,
    server: Server
  ) => Promise<string | undefined> | string | undefined;
  inspector: Inspector;
  path?: string;
}
