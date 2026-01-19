# Changelog

## [2026-01-18] - Endpoint Migration & Security Hardening

### Changed
- **Backend API**:
  - **Removed**: Endpoints `GET /usuarios/me` and `PATCH /usuarios/me`.
  - **Secured**: `GET /usuarios/:id` and `PATCH /usuarios/:id` now strictly enforce `id === user.sub`. Accessing another user's ID throws `403 Forbidden`.
- **Frontend Architecture**:
  - `usuarios.service.ts`: Switched to `getById(id)` and `update(id, payload)`.
  - `ProfileModal.tsx`: Logic updated to decode JWT payload, extract `sub` (UserID), and call the ID-based endpoints.

### Previous Changes (Service Separation)
- **Frontend**: Separated user-related logic into `usuarios.service.ts`.
- **UI**: Refactored `ProfileModal` to fetch fresh data.

### Verification Checklist
- [ ] **Endpoint Security**:
    - [ ] `GET /usuarios/:id` con ID propio -> 200 OK.
    - [ ] `GET /usuarios/:other_id` -> 403 Forbidden.
- [ ] **Frontend Flow**:
    - [ ] ProfileModal opens -> decodes token -> fetches correct ID -> displays name.
    - [ ] Update Name -> sends PATCH to correct ID -> updates successfully.
- [ ] **Legacy Cleanup**:
    - [ ] Verify `/me` calls are gone from Network tab.
