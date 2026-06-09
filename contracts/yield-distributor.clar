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
