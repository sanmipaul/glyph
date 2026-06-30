// Thin wrapper that normalises @stacks/connect exports.
// webpack may bundle the package as CJS and place everything under `.default`;
// this helper handles both ESM (named exports at top level) and CJS (.default wrapping).

type ConnectModule = typeof import('@stacks/connect');

async function load(): Promise<ConnectModule> {
  const mod = await import('@stacks/connect');
  // If webpack wrapped as CJS, all named exports live under mod.default
  return ((mod as any).default ?? mod) as ConnectModule;
}

export async function getShowConnect() {
  const { showConnect } = await load();
  return showConnect;
}

export async function getOpenContractCall() {
  const { openContractCall } = await load();
  return openContractCall;
}

export async function getDisconnect() {
  const { disconnect } = await load();
  return disconnect;
}

export async function getSession() {
  const { AppConfig, UserSession } = await load();
  const cfg = new AppConfig(['store_write', 'publish_data']);
  return new UserSession({ appConfig: cfg });
}
