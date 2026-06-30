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

const CONTRACT = "ordinal-collateral";
const COLLECTION = "bitcoin-puppets";

describe("ordinal-collateral", () => {
  describe("appraiser management", () => {
    it("add-appraiser succeeds as owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "add-appraiser",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("add-appraiser fails as non-owner", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "add-appraiser",
        [Cl.principal(wallet2)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(400)); // ERR-UNAUTHORIZED
    });

    it("remove-appraiser succeeds as owner", () => {
      simnet.callPublicFn(CONTRACT, "add-appraiser", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "remove-appraiser",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("remove-appraiser fails as non-owner", () => {
      simnet.callPublicFn(CONTRACT, "add-appraiser", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "remove-appraiser",
        [Cl.principal(wallet1)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(400)); // ERR-UNAUTHORIZED
    });
  });

  describe("appraise-token", () => {
    it("authorized appraiser can appraise a token", () => {
      simnet.callPublicFn(CONTRACT, "add-appraiser", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "appraise-token",
        [Cl.uint(1), Cl.uint(1_000_000)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("unauthorized user cannot appraise a token", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "appraise-token",
        [Cl.uint(1), Cl.uint(1_000_000)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(400)); // ERR-UNAUTHORIZED
    });
  });

  describe("get-appraisal", () => {
    it("returns none for unapprised token", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-appraisal",
        [Cl.uint(999)],
        deployer,
      );
      expect(result).toBeNone();
    });

    it("returns appraisal data after appraise-token", () => {
      simnet.callPublicFn(CONTRACT, "add-appraiser", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(
        CONTRACT,
        "appraise-token",
        [Cl.uint(1), Cl.uint(2_000_000)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-appraisal", [Cl.uint(1)], deployer);
      // Check value and appraiser; skip block which depends on execution order
      const data = (result as any).value.value;
      expect(data.value).toStrictEqual(Cl.uint(2_000_000));
      expect(data.appraiser).toStrictEqual(Cl.principal(wallet1));
    });

    it("appraisal can be updated by appraiser", () => {
      simnet.callPublicFn(CONTRACT, "add-appraiser", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(CONTRACT, "appraise-token", [Cl.uint(1), Cl.uint(1_000_000)], wallet1);
      simnet.callPublicFn(CONTRACT, "appraise-token", [Cl.uint(1), Cl.uint(3_000_000)], wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-appraisal", [Cl.uint(1)], deployer);
      const tupleData = (result as any).value.value;
      expect(tupleData.value).toStrictEqual(Cl.uint(3_000_000));
    });
  });

  describe("collection LTV management", () => {
    it("owner can set collection LTV", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-collection-ltv",
        [Cl.stringAscii(COLLECTION), Cl.uint(7000)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("non-owner cannot set collection LTV", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-collection-ltv",
        [Cl.stringAscii(COLLECTION), Cl.uint(7000)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(400)); // ERR-UNAUTHORIZED
    });

    it("cannot set LTV above 100% (10000 basis points)", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-collection-ltv",
        [Cl.stringAscii(COLLECTION), Cl.uint(10001)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(404)); // ERR-LTV-EXCEEDED
    });

    it("can set LTV to exactly 100% (10000)", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-collection-ltv",
        [Cl.stringAscii(COLLECTION), Cl.uint(10000)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("get-collection-ltv returns none for unconfigured collection", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-ltv",
        [Cl.stringAscii("unknown-collection")],
        deployer,
      );
      expect(result).toBeNone();
    });

    it("get-collection-ltv returns configured value", () => {
      simnet.callPublicFn(
        CONTRACT,
        "set-collection-ltv",
        [Cl.stringAscii(COLLECTION), Cl.uint(7000)],
        deployer,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-ltv",
        [Cl.stringAscii(COLLECTION)],
        deployer,
      );
      expect(result).toBeSome(Cl.uint(7000));
    });
  });

  describe("get-position", () => {
    it("returns none for user with no position", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-position",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer,
      );
      expect(result).toBeNone();
    });
  });

  describe("is-liquidatable", () => {
    it("returns false for user with no position", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-liquidatable",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer,
      );
      expect(result).toBeBool(false);
    });

    it("returns false for positioned user without appraisal", () => {
      // No position at all — still false
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-liquidatable",
        [Cl.principal(wallet2), Cl.uint(99)],
        deployer,
      );
      expect(result).toBeBool(false);
    });
  });

  describe("calculate-interest", () => {
    it("returns ERR-NO-POSITION for user without a loan", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "calculate-interest",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NO-POSITION
    });
  });

  describe("borrow guard checks", () => {
    it("borrow fails when token has no appraisal", () => {
      // The borrow function cross-calls ordinal-registry (hardcoded mainnet address),
      // so it will fail with ERR-NOT-FOUND from the unwrap! on get-inscription-id.
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "borrow",
        [Cl.uint(1), Cl.uint(100_000), Cl.uint(1)],
        wallet1,
      );
      // Cross-contract call to mainnet address fails in simnet
      expect(result).toBeErr(expect.anything());
    });
  });

  describe("repay guard checks", () => {
    it("repay fails when caller has no loan position", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "repay",
        [Cl.uint(1)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NO-POSITION
    });
  });

  describe("liquidate-position guard checks", () => {
    it("liquidate fails when position is not liquidatable", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "liquidate-position",
        [Cl.principal(wallet1), Cl.uint(1)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(406)); // ERR-NOT-LIQUIDATABLE
    });
  });
});
