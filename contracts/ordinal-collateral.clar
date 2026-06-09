;; Glyph - Ordinal Collateral
;; Use wrapped Ordinal NFTs as collateral to borrow STX or sBTC

(define-constant CONTRACT-OWNER tx-sender)
(define-constant STX-ASSET u1)
(define-constant SBTC-ASSET u2)
(define-constant BASIS-POINTS u10000)
(define-constant INTEREST-RATE-ANNUAL u500)       ;; 5% annual in basis points
(define-constant BLOCKS-PER-YEAR u52560)           ;; ~1 year in Stacks blocks
(define-constant LIQUIDATION-THRESHOLD u9000)      ;; 90% LTV triggers liquidation
(define-constant LIQUIDATION-DISCOUNT u1000)       ;; 10% discount for liquidators

(define-constant ERR-UNAUTHORIZED (err u400))
(define-constant ERR-NOT-FOUND (err u401))
(define-constant ERR-POSITION-EXISTS (err u402))
(define-constant ERR-NO-POSITION (err u403))
(define-constant ERR-LTV-EXCEEDED (err u404))
(define-constant ERR-NO-APPRAISAL (err u405))
(define-constant ERR-NOT-LIQUIDATABLE (err u406))
(define-constant ERR-REPAY-TOO-MUCH (err u407))
(define-constant ERR-COLLECTION-NOT-WHITELISTED (err u408))

(define-map loan-positions
  { user: principal, token-id: uint }
  { loan-amount: uint,
    loan-asset: uint,
    ltv-at-open: uint,
    interest-start-block: uint,
    accrued-interest: uint })

(define-map appraisals
  uint
  { value: uint, appraiser: principal, block: uint })

(define-map collection-ltv (string-ascii 40) uint)
(define-map authorized-appraisers principal bool)

(define-data-var owner principal CONTRACT-OWNER)
(define-data-var wrapped-nft-contract principal CONTRACT-OWNER)
(define-data-var registry-contract principal CONTRACT-OWNER)

;; Read-only functions

(define-read-only (get-appraisal (token-id uint))
  (map-get? appraisals token-id))

(define-read-only (get-position (user principal) (token-id uint))
  (map-get? loan-positions { user: user, token-id: token-id }))

(define-read-only (get-collection-ltv (collection (string-ascii 40)))
  (map-get? collection-ltv collection))
