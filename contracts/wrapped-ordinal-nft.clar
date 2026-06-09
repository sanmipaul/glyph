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
