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

(define-read-only (calculate-interest (user principal) (token-id uint))
  (match (map-get? loan-positions { user: user, token-id: token-id })
    pos
    (let* ((blocks-elapsed (- block-height (get interest-start-block pos)))
           (rate-per-block (/ (* (get loan-amount pos) INTEREST-RATE-ANNUAL)
                              (* BLOCKS-PER-YEAR BASIS-POINTS)))
           (interest (* rate-per-block blocks-elapsed)))
      (ok (+ (get accrued-interest pos) interest)))
    ERR-NO-POSITION))

(define-read-only (is-liquidatable (user principal) (token-id uint))
  (match (map-get? loan-positions { user: user, token-id: token-id })
    pos
    (match (map-get? appraisals token-id)
      appraisal
      (let* ((interest (unwrap-panic (calculate-interest user token-id)))
             (total-debt (+ (get loan-amount pos) interest))
             (threshold-value (/ (* (get value appraisal) LIQUIDATION-THRESHOLD) BASIS-POINTS)))
        (>= total-debt threshold-value))
      false)
    false))

;; Public functions

(define-public (appraise-token (token-id uint) (value uint))
  (begin
    (asserts! (default-to false (map-get? authorized-appraisers tx-sender)) ERR-UNAUTHORIZED)
    (map-set appraisals token-id { value: value, appraiser: tx-sender, block: block-height })
    (print { event: "token-appraised", token-id: token-id, value: value, appraiser: tx-sender })
    (ok true)))

(define-public (borrow (token-id uint) (loan-amount uint) (loan-asset uint))
  (begin
    (asserts! (is-none (map-get? loan-positions { user: tx-sender, token-id: token-id })) ERR-POSITION-EXISTS)
    (let ((appraisal (unwrap! (map-get? appraisals token-id) ERR-NO-APPRAISAL))
          (ordinal-data (unwrap! (contract-call? (var-get registry-contract) get-inscription-id token-id) ERR-NOT-FOUND)))
      (let* ((inscription (unwrap! (contract-call? (var-get registry-contract) get-ordinal ordinal-data) ERR-NOT-FOUND))
             (max-ltv (unwrap! (map-get? collection-ltv (get collection inscription)) ERR-COLLECTION-NOT-WHITELISTED))
             (max-loan (/ (* (get value appraisal) max-ltv) BASIS-POINTS))
             (ltv (/ (* loan-amount BASIS-POINTS) (get value appraisal))))
        (asserts! (<= loan-amount max-loan) ERR-LTV-EXCEEDED)
        ;; Transfer NFT from user to this contract as collateral
        (try! (contract-call? (var-get wrapped-nft-contract) transfer token-id tx-sender (as-contract tx-sender)))
        ;; Release loan amount in STX
        (when (is-eq loan-asset STX-ASSET)
          (try! (as-contract (stx-transfer? loan-amount tx-sender tx-sender))))
        (map-set loan-positions
          { user: tx-sender, token-id: token-id }
          { loan-amount: loan-amount,
            loan-asset: loan-asset,
            ltv-at-open: ltv,
            interest-start-block: block-height,
            accrued-interest: u0 })
        (print { event: "borrow", user: tx-sender, token-id: token-id, loan-amount: loan-amount })
        (ok true)))))

(define-public (repay (token-id uint))
  (let ((pos (unwrap! (map-get? loan-positions { user: tx-sender, token-id: token-id }) ERR-NO-POSITION))
        (interest (unwrap! (calculate-interest tx-sender token-id) ERR-NO-POSITION)))
    (let ((total-owed (+ (get loan-amount pos) interest)))
      ;; Accept repayment in STX
      (when (is-eq (get loan-asset pos) STX-ASSET)
        (try! (stx-transfer? total-owed tx-sender (as-contract tx-sender))))
      ;; Return NFT
      (try! (as-contract (contract-call? (var-get wrapped-nft-contract) transfer token-id (as-contract tx-sender) tx-sender)))
      (map-delete loan-positions { user: tx-sender, token-id: token-id })
      (print { event: "repay", user: tx-sender, token-id: token-id, total-paid: total-owed })
      (ok total-owed))))

(define-public (liquidate-position (user principal) (token-id uint))
  (begin
    (asserts! (is-liquidatable user token-id) ERR-NOT-LIQUIDATABLE)
    (let* ((pos (unwrap! (map-get? loan-positions { user: user, token-id: token-id }) ERR-NO-POSITION))
           (appraisal (unwrap! (map-get? appraisals token-id) ERR-NO-APPRAISAL))
           (interest (unwrap! (calculate-interest user token-id) ERR-NO-POSITION))
           (total-debt (+ (get loan-amount pos) interest))
           (discounted-price (/ (* (get value appraisal) (- BASIS-POINTS LIQUIDATION-DISCOUNT)) BASIS-POINTS)))
      ;; Liquidator pays the debt amount (at a discount to appraised value)
      (when (is-eq (get loan-asset pos) STX-ASSET)
        (try! (stx-transfer? total-debt tx-sender (as-contract tx-sender))))
      ;; Transfer NFT to liquidator
      (try! (as-contract (contract-call? (var-get wrapped-nft-contract) transfer token-id (as-contract tx-sender) tx-sender)))
      (map-delete loan-positions { user: user, token-id: token-id })
      (print { event: "liquidation", user: user, token-id: token-id, liquidator: tx-sender, debt: total-debt })
      (ok true))))

;; Admin functions

(define-public (set-collection-ltv (collection (string-ascii 40)) (ltv uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (asserts! (<= ltv BASIS-POINTS) ERR-LTV-EXCEEDED)
    (map-set collection-ltv collection ltv)
    (ok true)))

(define-public (add-appraiser (appraiser principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (map-set authorized-appraisers appraiser true) (ok true)))
(define-public (remove-appraiser (appraiser principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (map-delete authorized-appraisers appraiser) (ok true)))
(define-public (set-wrapped-nft-contract (contract principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (var-set wrapped-nft-contract contract) (ok true)))
(define-public (set-registry-contract (contract principal))
  (begin (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED) (var-set registry-contract contract) (ok true)))
