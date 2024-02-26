# Bun integration for Exot Inspector

This repository contains the WebSocket server implementation for Bun, enabling direct connection of the Exot Inspector App to your server.

## Install

```sh
bun add @exotjs/inspector @exotjs/bun
```

## Usage

```ts
import { Inspector } from '@exotjs/inspector';
import { MemoryStore } from '@exotjs/inspector/store';
import { websocket } from '@exotjs/bun';

const inspector = new Inspector({
  store: new MemoryStore(),
});

Bun.serve({
  ...websocket({
    inspector,
  }),
  port: 3003,
});
```

## Configuration

The `websocket()` function accepts the following configuration parameters:

### `authorize: (req, server) => Promise<string> | string`

Configure the `authorize` function to inspect the incoming request and authorize the user. It should return the user's name from the function or throw an error if unauthorized.

### `inspector: Inspector` (required)

Provide an instance of `Inspector`.

### `path: string`

Configure the path for the WebSocket server (default is `/_inspector`).

## Contributing

See [Contributing Guide](https://github.com/exotjs/inspector/blob/main/CONTRIBUTING.md) and please follow our [Code of Conduct](https://github.com/exotjs/inspector/blob/main/CODE_OF_CONDUCT.md).


## License

MIT