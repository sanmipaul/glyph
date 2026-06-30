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

;; Read-only functions

(define-read-only (get-ordinal (inscription-id (string-ascii 80)))
  (map-get? registered-ordinals { inscription-id: inscription-id }))

(define-read-only (get-inscription-id (token-id uint))
  (map-get? token-to-inscription token-id))

(define-read-only (is-verified (inscription-id (string-ascii 80)))
  (match (map-get? registered-ordinals { inscription-id: inscription-id })
    data (get verified data)
    false))

(define-read-only (is-verifier (verifier principal))
  (default-to false (map-get? authorized-verifiers verifier)))

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
          registered-at: stacks-block-height })
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

(define-public (verify-ordinal (inscription-id (string-ascii 80)))
  (begin
    (asserts! (is-verifier tx-sender) ERR-UNAUTHORIZED)
    (let ((data (unwrap! (map-get? registered-ordinals { inscription-id: inscription-id }) ERR-NOT-FOUND))
          (coll-stats (get-collection-stats (get collection data))))
      (asserts! (not (get verified data)) ERR-ALREADY-VERIFIED)
      (map-set registered-ordinals
        { inscription-id: inscription-id }
        (merge data { verified: true }))
      (map-set collection-stats (get collection data)
        { total: (get total coll-stats), verified: (+ (get verified coll-stats) u1) })
      (var-set total-verified (+ (var-get total-verified) u1))
      ;; Mint the wrapped NFT
      (try! (contract-call? .wrapped-ordinal-nft mint
              (get owner data)
              (get token-id data)
              (concat "https://glyph.btc/ordinal/" inscription-id)))
      (print { event: "ordinal-verified", inscription-id: inscription-id, token-id: (get token-id data) })
      (ok (get token-id data)))))

(define-public (add-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (map-set authorized-verifiers verifier true)
    (ok true)))

(define-public (remove-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (map-delete authorized-verifiers verifier)
    (ok true)))

