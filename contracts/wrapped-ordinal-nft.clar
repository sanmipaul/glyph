;; Glyph - Wrapped Ordinal NFT (SIP-009 compliant)
;; Represents a Bitcoin Ordinal inscription as a Stacks NFT

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-NOT-FOUND (err u201))
(define-constant ERR-ALREADY-EXISTS (err u202))
(define-constant ERR-NOT-OWNER (err u203))
(define-constant ERR-NOT-APPROVED (err u204))

(define-non-fungible-token glyph-ordinal uint)

(define-map token-uris uint (string-ascii 256))
(define-map token-approvals uint (optional principal))
(define-map operator-approvals { owner: principal, operator: principal } bool)

(define-data-var last-token-id uint u0)
(define-data-var owner principal CONTRACT-OWNER)
(define-data-var registry-contract principal CONTRACT-OWNER)
(define-data-var vault-contract principal CONTRACT-OWNER)

;; SIP-009 read-only functions

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? glyph-ordinal token-id)))

;; Extended read-only functions

(define-read-only (get-approved (token-id uint))
  (default-to none (map-get? token-approvals token-id)))

(define-read-only (is-approved-for-all (owner-addr principal) (operator principal))
  (default-to false (map-get? operator-approvals { owner: owner-addr, operator: operator })))

(define-read-only (is-owner-or-approved (token-id uint) (caller principal))
  (let ((token-owner (unwrap-panic (nft-get-owner? glyph-ordinal token-id))))
    (or (is-eq caller token-owner)
        (match (get-approved token-id)
          approved (is-eq caller approved)
          false)
        (is-approved-for-all token-owner caller))))

;; SIP-009 transfer

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-OWNER)
    (asserts! (is-owner-or-approved token-id sender) ERR-NOT-APPROVED)
    (try! (nft-transfer? glyph-ordinal token-id sender recipient))
    (map-delete token-approvals token-id)
    (print { event: "nft-transfer", token-id: token-id, from: sender, to: recipient })
    (ok true)))

;; Approval functions

(define-public (set-approved (token-id uint) (operator (optional principal)))
  (begin
    (asserts! (is-eq (some tx-sender) (nft-get-owner? glyph-ordinal token-id)) ERR-NOT-OWNER)
    (map-set token-approvals token-id operator)
    (ok true)))

(define-public (set-approval-for-all (operator principal) (approved bool))
  (begin
    (map-set operator-approvals { owner: tx-sender, operator: operator } approved)
    (ok true)))

;; Mint — only callable by ordinal-registry or vault (for re-wrapping)

(define-public (mint (recipient principal) (token-id uint) (uri (string-ascii 256)))
  (begin
    (asserts! (or (is-eq tx-sender (var-get registry-contract))
                  (is-eq tx-sender (var-get vault-contract))
                  (is-eq tx-sender (var-get owner))) ERR-UNAUTHORIZED)
    (asserts! (is-none (nft-get-owner? glyph-ordinal token-id)) ERR-ALREADY-EXISTS)
    (try! (nft-mint? glyph-ordinal token-id recipient))
    (map-set token-uris token-id uri)
    (when (> token-id (var-get last-token-id))
      (var-set last-token-id token-id))
    (print { event: "nft-mint", token-id: token-id, recipient: recipient, uri: uri })
    (ok true)))
