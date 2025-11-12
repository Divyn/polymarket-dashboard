# Initial Sync API Calls

During initial sync, the application makes **4 sequential Bitquery GraphQL API calls** to populate the database. These calls execute one at a time (queued) to avoid rate limiting.

## API Endpoint

**Base URL:** `https://streaming.bitquery.io/graphql`  
**Authentication:** `Authorization: Bearer {BITQUERY_OAUTH_TOKEN}`  
**Method:** POST (GraphQL)

## API Calls (Executed Sequentially)

### 1. TokenRegistered Events

**Function:** `fetchTokenRegisteredEvents(10000)`

**Query:**
```graphql
{
  EVM(dataset: combined, network: matic) {
    Events(
      where: {
        Block: {Time: {since_relative: {hours_ago: 72}}},
        Log: {Signature: {Name: {in: ["TokenRegistered"]}}},
        LogHeader: {Address: {is: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E"}}
      }
      limit: {count: 10000}
    ) {
      Block { Time Number Hash }
      Transaction { Hash From To }
      TransactionStatus { Success }
      Arguments {
        Name
        Value {
          ... on EVM_ABI_Integer_Value_Arg { integer }
          ... on EVM_ABI_Address_Value_Arg { address }
          ... on EVM_ABI_String_Value_Arg { string }
          ... on EVM_ABI_BigInt_Value_Arg { bigInteger }
          ... on EVM_ABI_Bytes_Value_Arg { hex }
          ... on EVM_ABI_Boolean_Value_Arg { bool }
        }
      }
    }
  }
}
```

**Parameters:**
- **Time Range:** Last 72 hours
- **Limit:** 10,000 events
- **Contract:** CTF Exchange (`0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E`)
- **Event:** `TokenRegistered`

**Stored Data:**
- `condition_id`
- `token0`
- `token1`
- `block_time`, `block_number`, `transaction_hash`

---

### 2. OrderFilled Events

**Function:** `fetchOrderFilledEvents(10000)`

**Query:**
```graphql
{
  EVM(dataset: combined, network: matic) {
    Events(
      where: {
        Block: {Time: {since_relative: {hours_ago: 72}}},
        Log: {Signature: {Name: {in: ["OrderFilled"]}}},
        LogHeader: {Address: {is: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E"}}
      }
      limit: {count: 10000}
    ) {
      Block { Time Number Hash }
      Transaction { Hash From To }
      TransactionStatus { Success }
      Arguments {
        Name
        Value {
          ... on EVM_ABI_Integer_Value_Arg { integer }
          ... on EVM_ABI_Address_Value_Arg { address }
          ... on EVM_ABI_String_Value_Arg { string }
          ... on EVM_ABI_BigInt_Value_Arg { bigInteger }
          ... on EVM_ABI_Bytes_Value_Arg { hex }
          ... on EVM_ABI_Boolean_Value_Arg { bool }
        }
      }
    }
  }
}
```

**Parameters:**
- **Time Range:** Last 72 hours
- **Limit:** 10,000 events
- **Contract:** CTF Exchange (`0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E`)
- **Event:** `OrderFilled`

**Stored Data:**
- `order_hash`
- `maker`, `taker`
- `maker_asset_id`, `taker_asset_id`
- `maker_amount_filled`, `taker_amount_filled`
- `fee`
- `block_time`, `block_number`, `transaction_hash`

---

### 3. ConditionPreparation Events

**Function:** `fetchConditionPreparationEvents(10000)`

**Query:**
```graphql
{
  EVM(dataset: combined, network: matic) {
    Events(
      where: {
        Block: {Time: {since_relative: {hours_ago: 72}}},
        Log: {Signature: {Name: {in: ["ConditionPreparation"]}}},
        LogHeader: {Address: {is: "0x4d97dcd97ec945f40cf65f87097ace5ea0476045"}}
      }
      limit: {count: 10000}
    ) {
      Block { Time Number Hash }
      Transaction { Hash From To }
      TransactionStatus { Success }
      Arguments {
        Name
        Value {
          ... on EVM_ABI_Integer_Value_Arg { integer }
          ... on EVM_ABI_Address_Value_Arg { address }
          ... on EVM_ABI_String_Value_Arg { string }
          ... on EVM_ABI_BigInt_Value_Arg { bigInteger }
          ... on EVM_ABI_Bytes_Value_Arg { hex }
          ... on EVM_ABI_Boolean_Value_Arg { bool }
        }
      }
    }
  }
}
```

**Parameters:**
- **Time Range:** Last 72 hours
- **Limit:** 10,000 events
- **Contract:** Main Polymarket (`0x4d97dcd97ec945f40cf65f87097ace5ea0476045`)
- **Event:** `ConditionPreparation`

**Stored Data:**
- `condition_id`
- `question_id`
- `outcome_slot_count`
- `oracle`
- `block_time`, `block_number`, `transaction_hash`

---

### 4. QuestionInitialized Events

**Function:** `fetchQuestionInitializedEvents(10000)`

**Query:**
```graphql
{
  EVM(dataset: combined, network: matic) {
    Events(
      where: {
        Block: {Time: {since_relative: {hours_ago: 72}}},
        Log: {Signature: {Name: {in: ["QuestionInitialized"]}}},
        LogHeader: {Address: {is: "0x65070BE91477460D8A7AeEb94ef92fe056C2f2A7"}}
      }
      limit: {count: 10000}
    ) {
      Block { Time Number Hash }
      Transaction { Hash From To }
      TransactionStatus { Success }
      Arguments {
        Name
        Value {
          ... on EVM_ABI_Integer_Value_Arg { integer }
          ... on EVM_ABI_Address_Value_Arg { address }
          ... on EVM_ABI_String_Value_Arg { string }
          ... on EVM_ABI_BigInt_Value_Arg { bigInteger }
          ... on EVM_ABI_Bytes_Value_Arg { hex }
          ... on EVM_ABI_Boolean_Value_Arg { bool }
        }
      }
    }
  }
}
```

**Parameters:**
- **Time Range:** Last 72 hours
- **Limit:** 10,000 events
- **Contract:** UMA Adapter (`0x65070BE91477460D8A7AeEb94ef92fe056C2f2A7`)
- **Event:** `QuestionInitialized`

**Stored Data:**
- `question_id`
- `request_timestamp`
- `creator`
- `ancillary_data` (raw hex)
- `ancillary_data_decoded` (parsed JSON with title, description, etc.)
- `reward_token`, `reward`, `proposal_bond`
- `block_time`, `block_number`, `transaction_hash`

---

## Execution Flow

1. **Check if sync is needed:** Only runs if any table is empty
2. **Queue queries:** All 4 queries are queued for sequential execution
3. **Execute sequentially:** Each query waits for the previous one to complete
4. **Retry logic:** Each query has up to 3 retries with exponential backoff (1s, 2s, 4s)
5. **Store results:** Events are stored in SQLite database using `INSERT OR IGNORE` (prevents duplicates)

## Time Range

All queries fetch events from the **last 72 hours** (`hours_ago: 72`).

## Limits

Each query has a limit of **10,000 events** per call.

## Network

All queries target the **Polygon (matic) network**.

## Contract Addresses

- **CTF Exchange:** `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` (TokenRegistered, OrderFilled)
- **Main Polymarket:** `0x4d97dcd97ec945f40cf65f87097ace5ea0476045` (ConditionPreparation)
- **UMA Adapter:** `0x65070BE91477460D8A7AeEb94ef92fe056C2f2A7` (QuestionInitialized)

