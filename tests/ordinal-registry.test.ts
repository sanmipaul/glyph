import { describe, expect, it, beforeEach } from "vitest";
import { initSimnet } from "@hirosystems/clarinet-sdk";
import { Cl } from "@stacks/transactions";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

beforeEach(async () => {
  await initSimnet();
});;

const CONTRACT = "ordinal-registry";
const INSCRIPTION_ID = "abc123def456abc123def456abc123def456abc123def456abc123def456abc123def456ab";
const COLLECTION = "bitcoin-puppets";
const CONTENT_TYPE = "image/png";
const SAT_NUMBER = 1234567890;

describe("ordinal-registry", () => {

  describe("register-ordinal", () => {
    it("registers a new ordinal and returns the token-id", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [
          Cl.stringAscii(INSCRIPTION_ID),
          Cl.stringAscii(COLLECTION),
          Cl.stringAscii(CONTENT_TYPE),
          Cl.uint(SAT_NUMBER),
        ],
        wallet1,
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("increments token-id for sequential registrations", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [
          Cl.stringAscii("second-inscription-id-padded-to-make-it-valid"),
          Cl.stringAscii(COLLECTION),
          Cl.stringAscii(CONTENT_TYPE),
          Cl.uint(SAT_NUMBER + 1),
        ],
        wallet2,
      );
      expect(result).toBeOk(Cl.uint(2));
    });

    it("rejects duplicate inscription-id", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-ALREADY-REGISTERED
    });

    it("rejects empty inscription-id", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(""), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(105)); // ERR-INVALID-INPUT
    });
  });

  describe("get-ordinal", () => {
    it("returns none for unregistered inscription", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID)],
        deployer,
      );
      expect(result).toBeNone();
    });

    it("returns ordinal data after registration", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID)],
        deployer,
      );
      // Verify all fields except block height, which depends on test execution order
      const data = (result as any).value.value;
      expect(data.owner).toStrictEqual(Cl.principal(wallet1));
      expect(data["token-id"]).toStrictEqual(Cl.uint(1));
      expect(data.collection).toStrictEqual(Cl.stringAscii(COLLECTION));
      expect(data["content-type"]).toStrictEqual(Cl.stringAscii(CONTENT_TYPE));
      expect(data["sat-number"]).toStrictEqual(Cl.uint(SAT_NUMBER));
      expect(data.verified).toStrictEqual(Cl.bool(false));
    });
  });

  describe("is-verified", () => {
    it("returns false for unregistered inscription", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-verified",
        [Cl.stringAscii(INSCRIPTION_ID)],
        deployer,
      );
      expect(result).toBeBool(false);
    });

    it("returns false immediately after registration", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-verified",
        [Cl.stringAscii(INSCRIPTION_ID)],
        deployer,
      );
      expect(result).toBeBool(false);
    });
  });

  describe("get-stats", () => {
    it("returns zero stats initially", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-stats", [], deployer);
      expect(result).toStrictEqual(
        Cl.tuple({
          "total-registered": Cl.uint(0),
          "total-verified": Cl.uint(0),
          "next-token-id": Cl.uint(1),
        }),
      );
    });

    it("increments total-registered after registration", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-stats", [], deployer);
      expect(result).toStrictEqual(
        Cl.tuple({
          "total-registered": Cl.uint(1),
          "total-verified": Cl.uint(0),
          "next-token-id": Cl.uint(2),
        }),
      );
    });
  });

  describe("get-collection-stats", () => {
    it("returns zero stats for unknown collection", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-stats",
        [Cl.stringAscii(COLLECTION)],
        deployer,
      );
      expect(result).toStrictEqual(Cl.tuple({ total: Cl.uint(0), verified: Cl.uint(0) }));
    });

    it("increments collection total after registration", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-collection-stats",
        [Cl.stringAscii(COLLECTION)],
        deployer,
      );
      expect(result).toStrictEqual(Cl.tuple({ total: Cl.uint(1), verified: Cl.uint(0) }));
    });
  });

  describe("verifier management", () => {
    it("is-verifier returns false by default", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-verifier",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(false);
    });

    it("owner can add a verifier", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "add-verifier",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("is-verifier returns true after add-verifier", () => {
      simnet.callPublicFn(CONTRACT, "add-verifier", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-verifier",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(true);
    });

    it("non-owner cannot add a verifier", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "add-verifier",
        [Cl.principal(wallet2)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
    });

    it("owner can remove a verifier", () => {
      simnet.callPublicFn(CONTRACT, "add-verifier", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "remove-verifier",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("is-verifier returns false after remove-verifier", () => {
      simnet.callPublicFn(CONTRACT, "add-verifier", [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn(CONTRACT, "remove-verifier", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-verifier",
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeBool(false);
    });

    it("verify-ordinal fails for non-verifier", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "verify-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-UNAUTHORIZED
    });

    it("verify-ordinal fails for non-existent inscription", () => {
      simnet.callPublicFn(CONTRACT, "add-verifier", [Cl.principal(wallet1)], deployer);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "verify-ordinal",
        [Cl.stringAscii("nonexistent-inscription-id-padded-x")],
        wallet1,
      );
      // ERR-NOT-FOUND from the ordinal-registry itself OR from the cross-contract call
      expect(result).toBeErr(expect.anything());
    });
  });

  describe("get-inscription-id", () => {
    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-inscription-id",
        [Cl.uint(999)],
        deployer,
      );
      expect(result).toBeNone();
    });

    it("returns inscription-id after registration", () => {
      simnet.callPublicFn(
        CONTRACT,
        "register-ordinal",
        [Cl.stringAscii(INSCRIPTION_ID), Cl.stringAscii(COLLECTION), Cl.stringAscii(CONTENT_TYPE), Cl.uint(SAT_NUMBER)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-inscription-id",
        [Cl.uint(1)],
        deployer,
      );
      expect(result).toBeSome(Cl.stringAscii(INSCRIPTION_ID));
    });
  });
});
