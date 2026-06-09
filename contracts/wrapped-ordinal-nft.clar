;; Glyph - Wrapped Ordinal NFT (SIP-009 compliant)
;; Represents a Bitcoin Ordinal inscription as a Stacks NFT

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-NOT-FOUND (err u201))
(define-constant ERR-ALREADY-EXISTS (err u202))
(define-constant ERR-NOT-OWNER (err u203))
(define-constant ERR-NOT-APPROVED (err u204))

(define-non-fungible-token glyph-ordinal uint)
