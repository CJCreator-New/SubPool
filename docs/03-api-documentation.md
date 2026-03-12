# SubPool API Documentation

## 1. Overview
SubPool operates on a client-direct-to-database model using Supabase. The front-end leverages the `supabase-js` client to interact directly with PostgreSQL via PostgREST.

All endpoints described below represent PostgREST interfaces mapped directly to table schemas.

## 2. Authentication Protocol
SubPool uses JWT-based authentication provided by Supabase Auth.
* **Token passing:** The `supabase-js` client automatically handles storing the session and passing the JWT in the `Authorization: Bearer <token>` header for all requests.
* **Role-Based Access:** Standard authenticated users receive the `authenticated` role. Anonymous users receive `anon`.

## 3. Endpoints (Table Interfaces)

### `GET /pools` (Fetch Pools)
Fetches a list of subscription pools.
* **Query Parameters:** Supports `select`, `eq`, `match`, and Full-Text Search via `.textSearch('search_vector', query)`.
* **RLS Policies:** Publicly readable.

### `POST /pools` (Create Pool)
Creates a new subscription pool.
* **Body Schema:**
  ```json
  {
    "platform": "string",
    "plan_name": "string",
    "category": "string",
    "price_per_slot": "number",
    "total_slots": "integer",
    "description": "string",
    "auto_approve": "boolean"
  }
  ```
* **RLS Policies:** Only authenticated users can insert (owner_id is automatically constrained to the authenticated UID).
* **Rate Limits:** Enforced via DB trigger (Max 10 mutations per minute).

### `GET /messages` (Fetch Pool Messages)
Fetches messages for a specific pool.
* **Query Parameters:** `pool_id=eq.{id}`
* **RLS Policies:** User must be the pool owner or an active member of the pool.

### `POST /messages` (Send Message)
Sends a message to a pool chat.
* **Body Schema:**
  ```json
  {
    "pool_id": "uuid",
    "content": "string",
    "sender_id": "uuid"
  }
  ```
* **RLS Policies:** Caller must be `sender_id`, AND must be an active member or owner of the pool.
* **Realtime:** Triggers a websocket real-time broadcast on the `messages` channel.

### `GET /pool_market_metrics` (Fetch Pricing Intelligence)
Read-only views on the aggregated market metrics for subscriptions.
* **RLS Policies:** Fully public (read-only).

## 4. Error Handling
The API returns standard HTTP status codes:
* `200/201`: Success
* `400`: Bad Request (Invalid data or constraint violation)
* `401`: Unauthorized (Invalid JWT)
* `403`: Forbidden (Custom RLS rule violation or Rate Limit exceeded: `Rate limit exceeded: Max 10 mutations per minute.`)
* `404`: Not Found

Errors are returned in standard Supabase JSON format:
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy"
}
```
