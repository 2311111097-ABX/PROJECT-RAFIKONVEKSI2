# Security Specification - Rafi Konveksi Security Model

This document outlines the zero-trust security configuration and access constraints applied to the Firestore database of the Rafi Konveksi application.

## 1. Data Invariants

1. **BrandSettings (`settings/{settingsId}`)**:
   - Anyone can read/retrieve settings to render the website layout and contact configurations.
   - Only the system admin (`2311111097@ittelkom-pwt.ac.id`) can update settings after authentication.
   - The document ID is restricted to standard alphanumeric formats (`isValidId()`).

2. **CatalogProducts (`catalog/{productId}`)**:
   - Anyone can readcatalog entries to view available products and calculate rates.
   - Only the verified system admin (`2311111097@ittelkom-pwt.ac.id`) can modify or insert new catalog entries.

3. **Inquiries (`inquiries/{inquiryId}`)**:
   - Anyone can create an inquiry (anonymous client submitter).
   - Only the authenticated administrator can list, filter, or retrieve client inquiries to prevent Personally Identifiable Information (PII) leakage.
   - Inquiries must contain verified primitive types with size-limited fields to avoid "Denial of Wallet" exploits through jumbo payloads.

---

## 2. The "Dirty Dozen" Threat Vectors (Rejected Payloads)

Here are twelve structural, typing, or authentication payloads designed to violate system rules and must return `PERMISSION_DENIED`.

1. **Identity Overwriting (Settings)**
   - Attempt to overwrite branding settings without an active Auth Context.
2. **Privilege Escalation**
   - Logging in as standard user `attacker@example.com` and writing to `settings/brand`.
3. **Ghost Fields Injection**
   - Overwriting catalog items or settings documents with extra fields like `isVip: true` or `discountCode: "FREE"`.
4. **Incorrect Field Typing (Catalog)**
   - Creating a catalog item with `basePrice` as a string instead of an integer.
5. **Jumbo String Poisoning**
   - Submitting an inquiry with a name or phone string containing 5MB of junk characters.
6. **Zero-Quantity Exploitation**
   - Submitting an inquiry with a quantity of 0 or a negative number.
7. **Cross-Tenant List Scraping**
   - Reading standard inquiries without administrative login privileges.
8. **Document ID Spoofing**
   - Appending a long, unsafe key containing dots and slashes as a document locator.
9. **Creation-Time Spoofing (Inquiries)**
   - Submitting an inquiry with a pre-dated value for `date`.
10. **Admin Password Tampering**
    - Writing to `settings/brand` with an empty admin password slot.
11. **Client Name Spoofing**
    - Anonymous submission payload with missing client name.
12. **Tampering with Catalog Base Prices**
    - Modifying a catalog product item basePrice to `100` as a non-admin.

---

## 3. Security Test Scenarios

The validator verifies these scenarios by asserting error blocks correctly catch and block illegal state transitions.
All data write scenarios will utilize our structured Firestore security validators as described in the `firestore.rules`.
