;; Glyph - Bridge Vault
;; Multi-sig controlled vault for withdrawing Ordinals back to Bitcoin L1

(define-constant CONTRACT-OWNER tx-sender)
(define-constant WITHDRAWAL-EXPIRY u1440) ;; ~10 days in blocks

(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-NOT-FOUND (err u301))
(define-constant ERR-ALREADY-APPROVED (err u302))
(define-constant ERR-ALREADY-EXECUTED (err u303))
(define-constant ERR-INSUFFICIENT-APPROVALS (err u304))
(define-constant ERR-EXPIRED (err u305))
(define-constant ERR-NOT-EXPIRED (err u306))
(define-constant ERR-INVALID-BTC-ADDRESS (err u307))
(define-constant ERR-TRANSFER-FAILED (err u308))

(define-map signers principal bool)
(define-map pending-withdrawals
  { withdrawal-id: uint }
  { user: principal,
    token-id: uint,
    inscription-id: (string-ascii 80),
    btc-address: (string-ascii 62),
    approvals: uint,
    approved-by: (list 10 principal),
    executed: bool,
    cancelled: bool,
    created-at: uint })

(define-map signer-approvals { withdrawal-id: uint, signer: principal } bool)

(define-data-var required-signatures uint u3)
(define-data-var total-signers uint u0)
(define-data-var withdrawal-nonce uint u0)
(define-data-var owner principal CONTRACT-OWNER)
(define-data-var wrapped-nft-contract principal CONTRACT-OWNER)
(define-data-var registry-contract principal CONTRACT-OWNER)

;; Read-only functions

(define-read-only (get-pending-withdrawal (withdrawal-id uint))
  (map-get? pending-withdrawals { withdrawal-id: withdrawal-id }))

(define-read-only (is-signer (principal principal))
  (default-to false (map-get? signers principal)))

(define-read-only (has-approved (withdrawal-id uint) (signer principal))
  (default-to false (map-get? signer-approvals { withdrawal-id: withdrawal-id, signer: signer })))

(define-read-only (get-required-signatures)
  (var-get required-signatures))
