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

;; Read-only functions

(define-read-only (get-ordinal (inscription-id (string-ascii 80)))
  (map-get? registered-ordinals { inscription-id: inscription-id }))

(define-read-only (get-inscription-id (token-id uint))
  (map-get? token-to-inscription token-id))

(define-read-only (is-verified (inscription-id (string-ascii 80)))
  (match (map-get? registered-ordinals { inscription-id: inscription-id })
    data (get verified data)
    false))

(define-read-only (is-verifier (principal principal))
  (default-to false (map-get? authorized-verifiers principal)))

(define-read-only (get-stats)
  { total-registered: (var-get total-registered),
    total-verified: (var-get total-verified),
    next-token-id: (var-get next-token-id) })

(define-read-only (get-collection-stats (collection (string-ascii 40)))
  (default-to { total: u0, verified: u0 }
    (map-get? collection-stats collection)))

;; Public functions

(define-public (register-ordinal
    (inscription-id (string-ascii 80))
    (collection (string-ascii 40))
    (content-type (string-ascii 40))
    (sat-number uint))
  (begin
    (asserts! (is-none (map-get? registered-ordinals { inscription-id: inscription-id })) ERR-ALREADY-REGISTERED)
    (asserts! (> (len inscription-id) u0) ERR-INVALID-INPUT)
    (let ((token-id (var-get next-token-id))
          (coll-stats (get-collection-stats collection)))
      (map-set registered-ordinals
        { inscription-id: inscription-id }
        { owner: tx-sender,
          token-id: token-id,
          collection: collection,
          content-type: content-type,
          sat-number: sat-number,
          verified: false,
          registered-at: block-height })
      (map-set token-to-inscription token-id inscription-id)
      (map-set collection-stats collection
        { total: (+ (get total coll-stats) u1), verified: (get verified coll-stats) })
      (var-set next-token-id (+ token-id u1))
      (var-set total-registered (+ (var-get total-registered) u1))
      (print { event: "ordinal-registered",
               inscription-id: inscription-id,
               owner: tx-sender,
               token-id: token-id,
               collection: collection })
      (ok token-id))))
