;; Glyph - Bridge Vault
;; Multi-sig controlled vault for withdrawing Ordinals back to Bitcoin L1

(define-constant CONTRACT-OWNER tx-sender)
(define-constant WITHDRAWAL-EXPIRY u1440) ;; ~10 days in blocks

(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-NOT-FOUND (err u301))
(define-constant ERR-ALREADY-APPROVED (err u302))
(define-constant ERR-ALREADY-EXECUTED (err u303))
(define-constant ERR-INSUFFICIENT-APPROVALS (err u304))
(define-constant ERR-EXPIRED (err u305))
(define-constant ERR-NOT-EXPIRED (err u306))
(define-constant ERR-INVALID-BTC-ADDRESS (err u307))
(define-constant ERR-TRANSFER-FAILED (err u308))

(define-map signers principal bool)
(define-map pending-withdrawals
  { withdrawal-id: uint }
  { user: principal,
    token-id: uint,
    inscription-id: (string-ascii 80),
    btc-address: (string-ascii 62),
    approvals: uint,
    approved-by: (list 10 principal),
    executed: bool,
    cancelled: bool,
    created-at: uint })

(define-map signer-approvals { withdrawal-id: uint, signer: principal } bool)

(define-data-var required-signatures uint u3)
(define-data-var total-signers uint u0)
(define-data-var withdrawal-nonce uint u0)
(define-data-var owner principal CONTRACT-OWNER)

;; Read-only functions

(define-read-only (get-pending-withdrawal (withdrawal-id uint))
  (map-get? pending-withdrawals { withdrawal-id: withdrawal-id }))

(define-read-only (is-signer (addr principal))
  (default-to false (map-get? signers addr)))

(define-read-only (has-approved (withdrawal-id uint) (signer principal))
  (default-to false (map-get? signer-approvals { withdrawal-id: withdrawal-id, signer: signer })))

(define-read-only (get-required-signatures)
  (var-get required-signatures))

;; Public functions

(define-public (initiate-withdrawal (token-id uint) (btc-address (string-ascii 62)))
  (begin
    (asserts! (> (len btc-address) u25) ERR-INVALID-BTC-ADDRESS)
    (let ((inscription-id (unwrap! (contract-call? 'SP3K07C30N3YCY5JHQAG751KVCF23FY05FD4PP1MR.ordinal-registry get-inscription-id token-id) ERR-NOT-FOUND))
          (withdrawal-id (var-get withdrawal-nonce)))
      ;; Transfer NFT to vault for holding during bridge process
      (try! (contract-call? 'SP3K07C30N3YCY5JHQAG751KVCF23FY05FD4PP1MR.wrapped-ordinal-nft transfer token-id tx-sender (as-contract tx-sender)))
      (map-set pending-withdrawals
        { withdrawal-id: withdrawal-id }
        { user: tx-sender,
          token-id: token-id,
          inscription-id: inscription-id,
          btc-address: btc-address,
          approvals: u0,
          approved-by: (list),
          executed: false,
          cancelled: false,
          created-at: stacks-block-height })
      (var-set withdrawal-nonce (+ withdrawal-id u1))
      (print { event: "withdrawal-initiated",
               withdrawal-id: withdrawal-id,
               user: tx-sender,
               token-id: token-id,
               btc-address: btc-address })
      (ok withdrawal-id))))

(define-public (approve-withdrawal (withdrawal-id uint))
  (begin
    (asserts! (is-signer tx-sender) ERR-UNAUTHORIZED)
    (asserts! (not (has-approved withdrawal-id tx-sender)) ERR-ALREADY-APPROVED)
    (let ((w (unwrap! (map-get? pending-withdrawals { withdrawal-id: withdrawal-id }) ERR-NOT-FOUND)))
      (asserts! (not (get executed w)) ERR-ALREADY-EXECUTED)
      (asserts! (not (get cancelled w)) ERR-ALREADY-EXECUTED)
      (asserts! (< (- stacks-block-height (get created-at w)) WITHDRAWAL-EXPIRY) ERR-EXPIRED)
      (map-set signer-approvals { withdrawal-id: withdrawal-id, signer: tx-sender } true)
      (map-set pending-withdrawals
        { withdrawal-id: withdrawal-id }
        (merge w { approvals: (+ (get approvals w) u1) }))
      (print { event: "withdrawal-approved", withdrawal-id: withdrawal-id, signer: tx-sender })
      (ok (+ (get approvals w) u1)))))

(define-public (execute-withdrawal (withdrawal-id uint))
  (let ((w (unwrap! (map-get? pending-withdrawals { withdrawal-id: withdrawal-id }) ERR-NOT-FOUND)))
    (asserts! (not (get executed w)) ERR-ALREADY-EXECUTED)
    (asserts! (not (get cancelled w)) ERR-ALREADY-EXECUTED)
    (asserts! (>= (get approvals w) (var-get required-signatures)) ERR-INSUFFICIENT-APPROVALS)
    (asserts! (< (- stacks-block-height (get created-at w)) WITHDRAWAL-EXPIRY) ERR-EXPIRED)
    ;; Burn the wrapped NFT - signals off-chain bridge to release the inscription on Bitcoin
    (try! (as-contract (contract-call? 'SP3K07C30N3YCY5JHQAG751KVCF23FY05FD4PP1MR.wrapped-ordinal-nft burn (get token-id w))))
    (map-set pending-withdrawals
      { withdrawal-id: withdrawal-id }
      (merge w { executed: true }))
    (print { event: "withdrawal-executed",
             withdrawal-id: withdrawal-id,
             user: (get user w),
             token-id: (get token-id w),
             inscription-id: (get inscription-id w),
             btc-address: (get btc-address w) })
    (ok true)))

(define-public (cancel-expired-withdrawal (withdrawal-id uint))
  (let ((w (unwrap! (map-get? pending-withdrawals { withdrawal-id: withdrawal-id }) ERR-NOT-FOUND)))
    (asserts! (not (get executed w)) ERR-ALREADY-EXECUTED)
    (asserts! (not (get cancelled w)) ERR-ALREADY-EXECUTED)
    (asserts! (>= (- stacks-block-height (get created-at w)) WITHDRAWAL-EXPIRY) ERR-NOT-EXPIRED)
    ;; Return NFT to user
    (try! (as-contract (contract-call? 'SP3K07C30N3YCY5JHQAG751KVCF23FY05FD4PP1MR.wrapped-ordinal-nft transfer
            (get token-id w) (as-contract tx-sender) (get user w))))
    (map-set pending-withdrawals
      { withdrawal-id: withdrawal-id }
      (merge w { cancelled: true }))
    (print { event: "withdrawal-cancelled", withdrawal-id: withdrawal-id })
    (ok true)))

;; Admin functions

(define-public (add-signer (signer principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (map-set signers signer true)
    (var-set total-signers (+ (var-get total-signers) u1))
    (ok true)))

(define-public (remove-signer (signer principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (map-delete signers signer)
    (var-set total-signers (- (var-get total-signers) u1))
    (ok true)))

(define-public (set-required-signatures (n uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (asserts! (<= n (var-get total-signers)) ERR-UNAUTHORIZED)
    (asserts! (> n u0) ERR-UNAUTHORIZED)
    (var-set required-signatures n)
    (ok true)))

