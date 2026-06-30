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
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT = "bridge-vault";

describe("bridge-vault", () => {
  describe("signer management", () => {
    it("is-signer returns false for unknown address", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-signer",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(false);
    });

    it("owner can add a signer", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "add-signer",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("is-signer returns true after add-signer", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-signer",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(true);
    });

    it("non-owner cannot add a signer", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "add-signer",
        [Cl.principal(wallet2)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
    });

    it("owner can remove a signer", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "remove-signer",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("is-signer returns false after remove-signer", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(CONTRACT, "remove-signer", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-signer",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(false);
    });
  });

  describe("required-signatures config", () => {
    it("default required-signatures is 3", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-required-signatures",
        [],
        deployer,
      );
      expect(result).toStrictEqual(Cl.uint(3));
    });

    it("owner can change required-signatures", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet2)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-required-signatures",
        [Cl.uint(2)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("required-signatures updates after set", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet2)], deployer);
      simnet.callPublicFn(CONTRACT, "set-required-signatures", [Cl.uint(2)], deployer);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-required-signatures", [], deployer);
      expect(result).toStrictEqual(Cl.uint(2));
    });

    it("cannot set required-signatures to 0", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-required-signatures",
        [Cl.uint(0)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED (guard: > 0)
    });

    it("cannot set required-signatures above total signers", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-required-signatures",
        [Cl.uint(5)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED (guard: <= total-signers)
    });

    it("non-owner cannot change required-signatures", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-required-signatures",
        [Cl.uint(1)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
    });
  });

  describe("has-approved", () => {
    it("returns false for non-existent withdrawal", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "has-approved",
        [Cl.uint(0), Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(false);
    });
  });

  describe("get-pending-withdrawal", () => {
    it("returns none for non-existent withdrawal", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-pending-withdrawal",
        [Cl.uint(999)],
        deployer,
      );
      expect(result).toBeNone();
    });
  });

  describe("approve-withdrawal", () => {
    it("non-signer cannot approve withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "approve-withdrawal",
        [Cl.uint(0)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-UNAUTHORIZED
    });

    it("signer cannot approve non-existent withdrawal", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "approve-withdrawal",
        [Cl.uint(999)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(301)); // ERR-NOT-FOUND
    });
  });

  describe("execute-withdrawal", () => {
    it("fails for non-existent withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "execute-withdrawal",
        [Cl.uint(999)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(301)); // ERR-NOT-FOUND
    });
  });

  describe("cancel-expired-withdrawal", () => {
    it("fails for non-existent withdrawal", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "cancel-expired-withdrawal",
        [Cl.uint(999)],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(301)); // ERR-NOT-FOUND
    });
  });

  describe("multi-signer approval flow", () => {
    it("adding three signers reflects in is-signer checks", () => {
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet2)], deployer);
      simnet.callPublicFn(CONTRACT, "add-signer", [Cl.principal(wallet3)], deployer);

      const r1 = simnet.callReadOnlyFn(CONTRACT, "is-signer", [Cl.principal(wallet1)], deployer);
      const r2 = simnet.callReadOnlyFn(CONTRACT, "is-signer", [Cl.principal(wallet2)], deployer);
      const r3 = simnet.callReadOnlyFn(CONTRACT, "is-signer", [Cl.principal(wallet3)], deployer);

      expect(r1.result).toBeBool(true);
      expect(r2.result).toBeBool(true);
      expect(r3.result).toBeBool(true);
    });
  });
});
