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
