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
