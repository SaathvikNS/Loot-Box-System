# 🛡️ Sui Native Randomness (`sui::random`) Security Analysis

Generating fair, unbiasable, and tamper-proof randomness on public blockchains has historically required complex off-chain oracles (e.g., Chainlink VRF) that incur high latency, gas fees, and multi-transaction callback patterns. 

Sui introduces a native on-chain randomness module (`sui::random`) powered by a distributed threshold cryptography beacon operated directly by validator consensus.

---

## 1. Randomness Mechanics on Sui

When a transaction requests randomness on Sui:
1. The transaction references the immutable `sui::random::Random` shared object located at reserved system address `0x8`.
2. Validators generate threshold BLS signatures during consensus round checkpoint finalization to supply an unbiasable, unpredictable random seed.
3. The seed is made available in the execution phase through `sui::random::new_generator(r, ctx)`.

---

## 2. Critical Security Vulnerability: The "Test-and-Abort" Attack

In standard smart contract execution, if a function is `public`, another contract can invoke it inside a Programmable Transaction Block (PTB) and inspect the return value:

```move
// ⚠️ VULNERABLE PATTERN IF PUBLIC:
public fun malicious_exploit(config: &mut GameConfig, box: LootBox, r: &Random, ctx: &mut TxContext) {
    let item = lootbox::open_loot_box_public(config, box, r, ctx);
    
    // If the random outcome is not Legendary, ABORT the transaction!
    if (lootbox::item_rarity(&item) != 3) {
        abort 1337 // Reverts state, keeping the LootBox safe!
    };
}
```

### The Solution: Non-Public `entry` Functions
To permanently eliminate this vulnerability:
* The `open_loot_box` function **MUST** be defined as a private `entry` function (`entry fun open_loot_box(...)`), **never** `public entry fun` or `public fun`.
* The Sui Move compiler and runtime enforce that non-public `entry` functions cannot be called from other Move modules or composed within PTBs that evaluate post-execution conditions.
* As a result, the transaction must either succeed completely (consuming the box and committing the minted item) or fail without leaking entropy.

```move
// ✅ SECURE PATTERN:
entry fun open_loot_box(
    config: &mut GameConfig,
    lootbox: LootBox,
    r: &Random,
    ctx: &mut TxContext,
) {
    // 1. Box is deleted first
    // 2. Generator created in-place
    let mut gen = random::new_generator(r, ctx);
    // 3. Random roll executed and NFT minted
}
```

---

## 3. In-Place RandomGenerator Instantiation

> **Rule:** Never pass `RandomGenerator` as a function argument across module boundaries.

Always create `RandomGenerator` in the immediate consuming function scope via:
```move
let mut gen = random::new_generator(r, ctx);
let roll = random::generate_u8_in_range(&mut gen, 0, 99);
```

This guarantees that external callers cannot pre-advance or seed the generator state prior to evaluation.
