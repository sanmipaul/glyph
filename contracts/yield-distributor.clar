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
