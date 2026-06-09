;; Glyph - Wrapped Ordinal NFT (SIP-009 compliant)
;; Represents a Bitcoin Ordinal inscription as a Stacks NFT

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-NOT-FOUND (err u201))
(define-constant ERR-ALREADY-EXISTS (err u202))
(define-constant ERR-NOT-OWNER (err u203))
(define-constant ERR-NOT-APPROVED (err u204))

(define-non-fungible-token glyph-ordinal uint)

(define-map token-uris uint (string-ascii 256))
(define-map token-approvals uint (optional principal))
(define-map operator-approvals { owner: principal, operator: principal } bool)

(define-data-var last-token-id uint u0)
(define-data-var owner principal CONTRACT-OWNER)
(define-data-var registry-contract principal CONTRACT-OWNER)
(define-data-var vault-contract principal CONTRACT-OWNER)

;; SIP-009 read-only functions

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? glyph-ordinal token-id)))

;; Extended read-only functions

(define-read-only (get-approved (token-id uint))
  (default-to none (map-get? token-approvals token-id)))

(define-read-only (is-approved-for-all (owner-addr principal) (operator principal))
  (default-to false (map-get? operator-approvals { owner: owner-addr, operator: operator })))

(define-read-only (is-owner-or-approved (token-id uint) (caller principal))
  (let ((token-owner (unwrap-panic (nft-get-owner? glyph-ordinal token-id))))
    (or (is-eq caller token-owner)
        (match (get-approved token-id)
          approved (is-eq caller approved)
          false)
        (is-approved-for-all token-owner caller))))
