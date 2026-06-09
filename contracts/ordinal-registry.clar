;; Glyph - Ordinal Registry
;; Records and verifies Bitcoin Ordinal inscriptions before they can be wrapped on Stacks

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-ALREADY-REGISTERED (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-ALREADY-VERIFIED (err u103))
(define-constant ERR-NOT-VERIFIED (err u104))
(define-constant ERR-INVALID-INPUT (err u105))
