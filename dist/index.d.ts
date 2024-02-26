/// <reference types="bun-types" />
/// <reference types="bun-types" />
import type { ExotWebSocketServerOptions } from './types.js';
import type { WebSocketServeOptions } from 'bun';
import type { Session } from '@exotjs/inspector/session';
export declare const webSocketServer: (options: ExotWebSocketServerOptions) => WebSocketServeOptions<{
    inspectorSession?: Session;
}>;
