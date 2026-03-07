# Frontend-Backend Coupling Phase 1

## Understanding Summary
- Backend actual is the source of truth.
- Scope is operational billing flow: authentication, products, customers, create/list invoices.
- Frontend roles align to backend roles: `admin`, `empleado`, `lector`.
- Existing UI look-and-feel remains; only data contracts and logic are adapted.
- Local auth fallback is removed; only real JWT flow is allowed.
- Phase success is functional: login, role navigation, create invoice, list invoices.

## Assumptions
- Frontend base URL points to backend API root (`/api`).
- Auth login payload uses `email` and `password`.
- Legacy endpoints like `/order` and `/orderDetails` are not available.
- Invoices are created with backend-calculated totals and stock updates.
- UX hardening and full automation are out of phase-1 scope.

## Decision Log
1. **Backend as canon**
   - Alternatives: keep legacy frontend contract, hybrid compatibility layer.
   - Reason: lower long-term maintenance and clearer source of truth.
2. **Scope: operational billing flow**
   - Alternatives: auth-only, full-system migration.
   - Reason: enough value to unblock daily usage with controlled effort.
3. **Role migration to backend model**
   - Alternatives: temporary role mapping, dual-role compatibility.
   - Reason: avoid ambiguous permission behavior.
4. **UI preserved**
   - Alternatives: partial redesign, full redesign.
   - Reason: reduce risk and keep phase focused on integration.
5. **Real JWT only**
   - Alternatives: dev fallback auth.
   - Reason: remove environment-dependent behavior and security gaps.
6. **Approach: direct replacement by layers**
   - Alternatives: frontend BFF adapter, large module rewrite.
   - Reason: fastest path to functional goal without adding new debt.

## Final Design

### Architecture
- `httpClient` is the single API client with auth headers and token refresh.
- Feature services consume backend endpoints:
  - `auth`: login/refresh/logout.
  - `products`: list/read products.
  - `customers`: list/read customers.
  - `invoices`: create/list/read invoices.
- Components consume typed service results and stay UI-focused.

### Contracts
- Login: `POST /api/auth/login` with `{ email, password }`.
- Products: `GET /api/products`.
- Customers: `GET /api/customers`.
- Invoices:
  - `GET /api/invoices`
  - `GET /api/invoices/:id`
  - `POST /api/invoices` with `{ customerId, items[{ productId, quantity }], issueDate? }`

### Route-to-role matrix
- `/dashboard`: `admin`
- `/inicio`: `admin`, `empleado`
- `/productsSearch`: `admin`, `empleado`, `lector`
- `/clientsSearch`: `admin`, `empleado`, `lector`
- `/facturas`: `admin`, `empleado`, `lector`

### Error handling
- `401`: attempt refresh once; logout if refresh fails.
- `403`: route to forbidden page.
- `400/409`: show backend business message.

### Functional test checklist
1. Login with valid and invalid credentials.
2. Validate route access by role.
3. Select customer + products and create invoice.
4. Validate low stock error handling on invoice creation.
5. List invoices and view invoice detail.
6. Validate refresh flow after expired access token.