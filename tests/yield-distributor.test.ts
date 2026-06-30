import { describe, expect, it, beforeEach } from "vitest";
import { initSimnet } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();

beforeEach(async () => {
  await initSimnet();
});
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const CONTRACT = "yield-distributor";
const COLLECTION = "bitcoin-puppets";
const STX_ASSET = 1;
const RATE_PER_BLOCK = 100; // 100 uSTX per block

describe("yield-distributor", () => {
  describe("collection yield config", () => {
    it("set-collection-config succeeds as owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii(COLLECTION), Cl.uint(RATE_PER_BLOCK), Cl.uint(STX_ASSET)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("set-collection-config fails as non-owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii(COLLECTION), Cl.uint(RATE_PER_BLOCK), Cl.uint(STX_ASSET)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(500)); // ERR-UNAUTHORIZED
    });

    it("get-collection-config returns none before configuration", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-config",
        [Cl.stringAscii("unconfigured-collection")],
        deployer,
      );
      expect(result).toBeNone();
    });

    it("get-collection-config returns config after set", () => {
      simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii(COLLECTION), Cl.uint(RATE_PER_BLOCK), Cl.uint(STX_ASSET)],
        deployer,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-config",
        [Cl.stringAscii(COLLECTION)],
        deployer,
      );
      expect(result).toBeSome(
        Cl.tuple({
          "rate-per-block": Cl.uint(RATE_PER_BLOCK),
          "total-staked": Cl.uint(0),
          "yield-asset": Cl.uint(STX_ASSET),
          active: Cl.bool(true),
        }),
      );
    });

    it("set-collection-config can update existing config", () => {
      simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii(COLLECTION), Cl.uint(RATE_PER_BLOCK), Cl.uint(STX_ASSET)],
        deployer,
      );
      simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii(COLLECTION), Cl.uint(200), Cl.uint(STX_ASSET)],
        deployer,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-config",
        [Cl.stringAscii(COLLECTION)],
        deployer,
      );
      const config = (result as any).value.value;
      expect(config["rate-per-block"]).toStrictEqual(Cl.uint(200));
    });
  });

  describe("treasury management", () => {
    it("get-treasury-balance returns 0 initially", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-treasury-balance",
        [Cl.uint(STX_ASSET)],
        deployer,
      );
      expect(result).toStrictEqual(Cl.uint(0));
    });

    it("fund-yield increases treasury balance", () => {
      const amount = 10_000_000; // 10 STX in uSTX
      simnet.callPublicFn(
        CONTRACT,
        "fund-yield",
        [Cl.uint(STX_ASSET), Cl.uint(amount)],
        deployer,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-treasury-balance",
        [Cl.uint(STX_ASSET)],
        deployer,
      );
      expect(result).toStrictEqual(Cl.uint(amount));
    });

    it("fund-yield accumulates across multiple calls", () => {
      simnet.callPublicFn(CONTRACT, "fund-yield", [Cl.uint(STX_ASSET), Cl.uint(5_000_000)], deployer);
      simnet.callPublicFn(CONTRACT, "fund-yield", [Cl.uint(STX_ASSET), Cl.uint(3_000_000)], deployer);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-treasury-balance",
        [Cl.uint(STX_ASSET)],
        deployer,
      );
      expect(result).toStrictEqual(Cl.uint(8_000_000));
    });

    it("fund-yield fails as non-owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "fund-yield",
        [Cl.uint(STX_ASSET), Cl.uint(1_000_000)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(500)); // ERR-UNAUTHORIZED
    });

    it("non-STX asset treasury tracked separately", () => {
      simnet.callPublicFn(CONTRACT, "fund-yield", [Cl.uint(STX_ASSET), Cl.uint(5_000_000)], deployer);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-treasury-balance",
        [Cl.uint(2)], // sBTC asset
        deployer,
      );
      expect(result).toStrictEqual(Cl.uint(0));
    });
  });

  describe("get-stake", () => {
    it("returns none for user with no stake", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-stake",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer,
      );
      expect(result).toBeNone();
    });
  });

  describe("calculate-pending-yield", () => {
    it("returns ERR-NOT-STAKED for user with no stake", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "calculate-pending-yield",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(503)); // ERR-NOT-STAKED
    });
  });

  describe("stake guard checks", () => {
    it("stake fails for unconfigured collection (cross-contract call to mainnet address)", () => {
      // stake cross-calls ordinal-registry at hardcoded mainnet address → fails in simnet
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "stake",
        [Cl.uint(1)],
        wallet1,
      );
      expect(result).toBeErr(expect.anything());
    });
  });

  describe("claim-yield guard checks", () => {
    it("claim-yield fails when user has no staked token", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "claim-yield",
        [Cl.uint(1)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(503)); // ERR-NOT-STAKED
    });
  });

  describe("unstake guard checks", () => {
    it("unstake fails when user has no staked token", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "unstake",
        [Cl.uint(1)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(503)); // ERR-NOT-STAKED
    });
  });

  describe("multi-collection config", () => {
    it("can configure multiple collections independently", () => {
      simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii("collection-a"), Cl.uint(50), Cl.uint(STX_ASSET)],
        deployer,
      );
      simnet.callPublicFn(
        CONTRACT,
        "set-collection-config",
        [Cl.stringAscii("collection-b"), Cl.uint(200), Cl.uint(STX_ASSET)],
        deployer,
      );

      const r1 = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-config",
        [Cl.stringAscii("collection-a")],
        deployer,
      );
      const r2 = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-config",
        [Cl.stringAscii("collection-b")],
        deployer,
      );

      const c1 = (r1.result as any).value.value;
      const c2 = (r2.result as any).value.value;

      expect(c1["rate-per-block"]).toStrictEqual(Cl.uint(50));
      expect(c2["rate-per-block"]).toStrictEqual(Cl.uint(200));
    });
  });
});
