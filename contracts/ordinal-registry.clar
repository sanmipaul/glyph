;; Glyph - Ordinal Registry
;; Records and verifies Bitcoin Ordinal inscriptions before they can be wrapped on Stacks

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-ALREADY-REGISTERED (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-ALREADY-VERIFIED (err u103))
(define-constant ERR-NOT-VERIFIED (err u104))
(define-constant ERR-INVALID-INPUT (err u105))

(define-map registered-ordinals
  { inscription-id: (string-ascii 80) }
  { owner: principal,
    token-id: uint,
    collection: (string-ascii 40),
    content-type: (string-ascii 40),
    sat-number: uint,
    verified: bool,
    registered-at: uint })

(define-map token-to-inscription uint (string-ascii 80))
(define-map authorized-verifiers principal bool)
(define-map collection-stats (string-ascii 40) { total: uint, verified: uint })

(define-data-var next-token-id uint u1)
(define-data-var total-registered uint u0)
(define-data-var total-verified uint u0)
(define-data-var owner principal CONTRACT-OWNER)
(define-data-var wrapped-nft-contract principal CONTRACT-OWNER)
