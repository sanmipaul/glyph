// Normalises @stacks/connect exports across CJS and ESM builds.
//
// The CJS bundle (dist/index.js) has a variable-ordering bug: `showConnect`
// is exported as `zt = ze` before `ze` receives its function value, so
// `showConnect` ends up `undefined` in the CJS output.  `authenticate` is
// the same underlying function and is correctly exported.  The ESM build
// (dist/index.mjs) is fine, but webpack may resolve CJS first when there
// is no `exports` field in the package.json.
//
// Strategy: load the ESM entry directly; fall back to `authenticate` if
// `showConnect` still resolves to undefined.

type ConnectMod = typeof import('@stacks/connect');

async function load(): Promise<ConnectMod> {
  // Explicitly target the ESM build to bypass the CJS ordering bug.
  const mod = await import('@stacks/connect/dist/index.mjs' as any) as ConnectMod;
  return mod;
}

export async function getShowConnect() {
  try {
    const mod = await load();
    // showConnect and authenticate are the same function; use whichever is defined.
    return (mod.showConnect ?? (mod as any).authenticate) as typeof mod.showConnect;
  } catch {
    // Fall back to main entry if the ESM path isn't resolvable
    const mod = await import('@stacks/connect') as any;
    const m = mod.default ?? mod;
    return (m.showConnect ?? m.authenticate) as NonNullable<ConnectMod['showConnect']>;
  }
}

export async function getOpenContractCall() {
  try {
    const mod = await load();
    return mod.openContractCall;
  } catch {
    const mod = await import('@stacks/connect') as any;
    const m = mod.default ?? mod;
    return m.openContractCall as ConnectMod['openContractCall'];
  }
}

export async function getRequest() {
  try {
    const mod = await load();
    return mod.request;
  } catch {
    const mod = await import('@stacks/connect') as any;
    const m = mod.default ?? mod;
    return m.request as ConnectMod['request'];
  }
}

export async function getDisconnect() {
  try {
    const mod = await load();
    return mod.disconnect;
  } catch {
    const mod = await import('@stacks/connect') as any;
    const m = mod.default ?? mod;
    return m.disconnect as ConnectMod['disconnect'];
  }
}

export async function getSession() {
  try {
    const mod = await load();
    const { AppConfig, UserSession } = mod;
    return new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data']) });
  } catch {
    const mod = await import('@stacks/connect') as any;
    const m = mod.default ?? mod;
    return new m.UserSession({ appConfig: new m.AppConfig(['store_write', 'publish_data']) });
  }
}
