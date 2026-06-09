;; Glyph - Yield Distributor
;; Stake wrapped Ordinals to earn STX or sBTC yield based on collection tier

(define-constant CONTRACT-OWNER tx-sender)
(define-constant BASIS-POINTS u10000)

(define-constant ERR-UNAUTHORIZED (err u500))
(define-constant ERR-NOT-FOUND (err u501))
(define-constant ERR-ALREADY-STAKED (err u502))
(define-constant ERR-NOT-STAKED (err u503))
(define-constant ERR-COLLECTION-NOT-CONFIGURED (err u504))
(define-constant ERR-INSUFFICIENT-TREASURY (err u505))

(define-map staked-tokens
  { user: principal, token-id: uint }
  { staked-at: uint, collection: (string-ascii 40), claimed-up-to-block: uint })

(define-map collection-yield-config
  (string-ascii 40)
  { rate-per-block: uint, total-staked: uint, yield-asset: uint, active: bool })

(define-map yield-treasury uint uint)   ;; asset-id -> available amount

(define-data-var owner principal CONTRACT-OWNER)
(define-data-var wrapped-nft-contract principal CONTRACT-OWNER)
(define-data-var registry-contract principal CONTRACT-OWNER)
(define-data-var total-staked uint u0)

;; Read-only functions

(define-read-only (get-stake (user principal) (token-id uint))
  (map-get? staked-tokens { user: user, token-id: token-id }))

(define-read-only (get-collection-config (collection (string-ascii 40)))
  (map-get? collection-yield-config collection))

(define-read-only (get-treasury-balance (asset-id uint))
  (default-to u0 (map-get? yield-treasury asset-id)))

(define-read-only (calculate-pending-yield (user principal) (token-id uint))
  (match (map-get? staked-tokens { user: user, token-id: token-id })
    stake
    (match (map-get? collection-yield-config (get collection stake))
      config
      (let* ((blocks-elapsed (- block-height (get claimed-up-to-block stake)))
             (pending (* blocks-elapsed (get rate-per-block config))))
        (ok pending))
      ERR-COLLECTION-NOT-CONFIGURED)
    ERR-NOT-STAKED))

;; Public functions

(define-public (stake (token-id uint))
  (begin
    (asserts! (is-none (map-get? staked-tokens { user: tx-sender, token-id: token-id })) ERR-ALREADY-STAKED)
    (let ((inscription-id (unwrap! (contract-call? (var-get registry-contract) get-inscription-id token-id) ERR-NOT-FOUND))
          (ordinal-data (unwrap! (contract-call? (var-get registry-contract) get-ordinal
                          (unwrap-panic (contract-call? (var-get registry-contract) get-inscription-id token-id))) ERR-NOT-FOUND)))
      (let ((collection (get collection ordinal-data)))
        (asserts! (is-some (map-get? collection-yield-config collection)) ERR-COLLECTION-NOT-CONFIGURED)
        (try! (contract-call? (var-get wrapped-nft-contract) transfer token-id tx-sender (as-contract tx-sender)))
        (map-set staked-tokens
          { user: tx-sender, token-id: token-id }
          { staked-at: block-height, collection: collection, claimed-up-to-block: block-height })
        (match (map-get? collection-yield-config collection)
          config
          (map-set collection-yield-config collection
            (merge config { total-staked: (+ (get total-staked config) u1) }))
          true)
        (var-set total-staked (+ (var-get total-staked) u1))
        (print { event: "stake", user: tx-sender, token-id: token-id, collection: collection })
        (ok true)))))

(define-public (claim-yield (token-id uint))
  (let ((stake (unwrap! (map-get? staked-tokens { user: tx-sender, token-id: token-id }) ERR-NOT-STAKED))
        (pending (unwrap! (calculate-pending-yield tx-sender token-id) ERR-NOT-STAKED)))
    (let ((config (unwrap! (map-get? collection-yield-config (get collection stake)) ERR-COLLECTION-NOT-CONFIGURED))
          (asset-id (get yield-asset (unwrap-panic (map-get? collection-yield-config (get collection stake))))))
      (asserts! (> pending u0) ERR-NOT-FOUND)
      (asserts! (>= (get-treasury-balance asset-id) pending) ERR-INSUFFICIENT-TREASURY)
      (map-set staked-tokens
        { user: tx-sender, token-id: token-id }
        (merge stake { claimed-up-to-block: block-height }))
      (map-set yield-treasury asset-id (- (get-treasury-balance asset-id) pending))
      (when (is-eq asset-id u1) ;; STX
        (try! (as-contract (stx-transfer? pending tx-sender tx-sender))))
      (print { event: "yield-claimed", user: tx-sender, token-id: token-id, amount: pending })
      (ok pending))))
