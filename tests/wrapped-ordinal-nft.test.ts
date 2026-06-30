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

const CONTRACT = "wrapped-ordinal-nft";
const TOKEN_URI = "https://glyph.btc/ordinal/abc123";

function mintToken(tokenId: number, recipient: string) {
  return simnet.callPublicFn(
    CONTRACT,
    "mint",
    [Cl.principal(recipient), Cl.uint(tokenId), Cl.stringAscii(TOKEN_URI)],
    deployer,
  );
}

describe("wrapped-ordinal-nft", () => {
  describe("SIP-009 get-last-token-id", () => {
    it("returns 0 initially", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-last-token-id", [], deployer);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("updates after mint", () => {
      mintToken(5, wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-last-token-id", [], deployer);
      expect(result).toBeOk(Cl.uint(5));
    });

    it("tracks the highest token-id minted", () => {
      mintToken(3, wallet1);
      mintToken(7, wallet1);
      mintToken(2, wallet2);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-last-token-id", [], deployer);
      expect(result).toBeOk(Cl.uint(7));
    });
  });

  describe("SIP-009 get-owner", () => {
    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-owner", [Cl.uint(999)], deployer);
      expect(result).toBeOk(Cl.none());
    });

    it("returns owner after mint", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-owner", [Cl.uint(1)], deployer);
      expect(result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });
  });

  describe("SIP-009 get-token-uri", () => {
    it("returns none for non-existent token", () => {
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-token-uri", [Cl.uint(999)], deployer);
      expect(result).toBeOk(Cl.none());
    });

    it("returns uri after mint", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-token-uri", [Cl.uint(1)], deployer);
      expect(result).toBeOk(Cl.some(Cl.stringAscii(TOKEN_URI)));
    });
  });

  describe("mint", () => {
    it("owner can mint a token", () => {
      const { result } = mintToken(1, wallet1);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("non-owner cannot mint", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "mint",
        [Cl.principal(wallet2), Cl.uint(1), Cl.stringAscii(TOKEN_URI)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });

    it("minting duplicate token-id fails", () => {
      mintToken(1, wallet1);
      const { result } = mintToken(1, wallet2);
      expect(result).toBeErr(Cl.uint(202)); // ERR-ALREADY-EXISTS
    });
  });

  describe("transfer", () => {
    it("owner can transfer their token", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("transfer updates owner", () => {
      mintToken(1, wallet1);
      simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-owner", [Cl.uint(1)], deployer);
      expect(result).toBeOk(Cl.some(Cl.principal(wallet2)));
    });

    it("non-owner cannot transfer", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(203)); // ERR-NOT-OWNER
    });

    it("transfer as wrong sender fails", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet1)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(203)); // ERR-NOT-OWNER (sender != from)
    });
  });

  describe("set-approved / get-approved", () => {
    it("owner can approve an operator for a specific token", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-approved",
        [Cl.uint(1), Cl.some(Cl.principal(wallet2))],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("get-approved returns approved operator", () => {
      mintToken(1, wallet1);
      simnet.callPublicFn(
        CONTRACT,
        "set-approved",
        [Cl.uint(1), Cl.some(Cl.principal(wallet2))],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "get-approved",
        [Cl.uint(1)],
        deployer,
      );
      expect(result).toBeSome(Cl.principal(wallet2));
    });

    it("get-approved returns none before any approval", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-approved", [Cl.uint(1)], deployer);
      expect(result).toBeNone();
    });

    it("non-owner cannot set approval", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-approved",
        [Cl.uint(1), Cl.some(Cl.principal(wallet2))],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(203)); // ERR-NOT-OWNER
    });

    it("transfer requires tx-sender to equal sender (approved operator must pass self as sender)", () => {
      // The contract enforces tx-sender == sender, so an approved operator calling
      // transfer(id, owner, recipient) will fail even if approved.
      mintToken(1, wallet1);
      simnet.callPublicFn(
        CONTRACT,
        "set-approved",
        [Cl.uint(1), Cl.some(Cl.principal(wallet2))],
        wallet1,
      );
      // wallet2 (approved) cannot call transfer passing wallet1 as sender
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(203)); // ERR-NOT-OWNER: tx-sender != sender
    });

    it("transfer clears the per-token approval", () => {
      mintToken(1, wallet1);
      simnet.callPublicFn(
        CONTRACT,
        "set-approved",
        [Cl.uint(1), Cl.some(Cl.principal(wallet2))],
        wallet1,
      );
      // Owner transfers the token, which should clear the approval
      simnet.callPublicFn(
        CONTRACT,
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-approved", [Cl.uint(1)], deployer);
      expect(result).toBeNone();
    });
  });

  describe("set-approval-for-all / is-approved-for-all", () => {
    it("is-approved-for-all returns false by default", () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-approved-for-all",
        [Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer,
      );
      expect(result).toBeBool(false);
    });

    it("owner can set operator approval for all", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT,
        "set-approval-for-all",
        [Cl.principal(wallet2), Cl.bool(true)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("is-approved-for-all returns true after approval", () => {
      simnet.callPublicFn(
        CONTRACT,
        "set-approval-for-all",
        [Cl.principal(wallet2), Cl.bool(true)],
        wallet1,
      );
      const { result } = simnet.callReadOnlyFn(
        CONTRACT,
        "is-approved-for-all",
        [Cl.principal(wallet1), Cl.principal(wallet2)],
        deployer,
      );
      expect(result).toBeBool(true);
    });
  });

  describe("burn", () => {
    it("deployer (initial vault-contract) can burn a minted token", () => {
      // vault-contract defaults to CONTRACT-OWNER (deployer) at deploy time
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(CONTRACT, "burn", [Cl.uint(1)], deployer);
      expect(result).toBeOk(Cl.bool(true));
    });

    it("burn removes the token", () => {
      mintToken(1, wallet1);
      simnet.callPublicFn(CONTRACT, "burn", [Cl.uint(1)], deployer);
      const { result } = simnet.callReadOnlyFn(CONTRACT, "get-owner", [Cl.uint(1)], deployer);
      expect(result).toBeOk(Cl.none());
    });

    it("random user cannot burn", () => {
      mintToken(1, wallet1);
      const { result } = simnet.callPublicFn(CONTRACT, "burn", [Cl.uint(1)], wallet1);
      expect(result).toBeErr(Cl.uint(200)); // ERR-UNAUTHORIZED
    });
  });
});
