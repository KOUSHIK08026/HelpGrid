# HelpGrid Security Specification

## 1. Data Invariants

### Collection: `needs`
- **Path**: `/needs/{needId}`
- **Schema**: `Need` entity.
- **Invariants**:
  - `title`: string (1-100 chars)
  - `description`: string (1-1000 chars)
  - `location`: string (1-200 chars)
  - `dateRequired`: string (ISO date)
  - `urgency`: Enum ["Low", "Medium", "High"]
  - `ngoId`: Must match `request.auth.uid` on creation.
  - `status`: Enum ["Open", "Filled", "Closed"]
  - `volunteerCount`: integer >= 0.
  - `maxVolunteers`: integer > 0.
  - `createdAt`: serverTimestamp on creation.
  - `updatedAt`: serverTimestamp on update.
- **Access**:
  - `read/list`: Publicly readable (to attract volunteers).
  - `create`: Signed-in user. `ngoId` must be `uid`.
  - `update`: Only `ngoId` owner.
    - Cannot modify `ngoId`, `createdAt`.
    - Volunteers can increment `volunteerCount` when joining (Action: Join).
    - Owners can modify status, maxVolunteers, etc. (Action: Manage).

### Collection: `volunteers`
- **Path**: `/volunteers/{volunteerId}`
- **Schema**: `Volunteer` entity.
- **Invariants**:
  - `volunteerId`: Must be `request.auth.uid`.
  - `name`: string (1-100 chars).
  - `email`: Valid email format.
  - `status`: Enum ["Available", "Busy"].
- **Access**:
  - `read/get`: Publicly readable (NGOs need to find volunteers).
  - `list`: Signed-in users only (to prevent scraping).
  - `write`: Only the volunteer (owner).

### Collection: `matches`
- **Path**: `/matches/{matchId}`
- **Schema**: `Match` entity.
- **Invariants**:
  - `volunteerId`: Must match `request.auth.uid` (if volunteer joins) or be set by NGO.
  - `needId`: Must point to a valid need.
  - `matchDate`: serverTimestamp.
- **Access**:
  - `read/get`: Only volunteer or need owner.
  - `create`: Signed-in user.
  - `update/delete`: Denied (matches are records of history).

## 2. The "Dirty Dozen" Payloads (Expected to Fail)

1. **Unauthenticated Need Creation**: Attempt to create a need without being signed in.
2. **Identity Spoofing (NGO)**: User A tries to create a need with `ngoId: "UserB"`.
3. **Volunteer Hijacking**: User A tries to update User B's volunteer profile.
4. **Invalid Urgency**: Create a need with `urgency: "Super Urgent"`.
5. **Need Field Poisoning**: Update a need's `ngoId` to someone else.
6. **Immutable Timestamp**: Attempt to overwrite `createdAt` on update.
7. **Negative Volunteer Count**: Set `volunteerCount: -5`.
8. **Resource Exhaustion**: Create a need with a 1MB `title`.
9. **Blanket Volunteer Read**: Unauthenticated user tries to list all volunteers.
10. **Orphaned Match**: Create a match record with a non-existent `needId`.
11. **Shadow Update**: Attempt to add `isAdmin: true` to a user profile.
12. **Status Bypass**: Directly update a need's status to "Filled" without incrementing `volunteerCount` (requires `existsAfter` or similar check).

## 3. Test Runner
A `firestore.rules.test.ts` would use `rules-unit-testing` to verify these.
