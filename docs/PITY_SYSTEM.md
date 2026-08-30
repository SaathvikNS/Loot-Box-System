# 🎰 Dynamic Field Pity System Mathematical Model

The Pity System guarantees that bad luck streaks are bounded, providing a fair, player-centric incentive structure while maintaining long-term tokenomic balance.

---

## 1. Drop Rate Matrix & Cumulative Ranges

The default game weights sum to 100:

| Tier | Weight ($W_i$) | Nominal Drop Rate ($P_i$) | Power Range | Roll Threshold Range (0-99) |
| :--- | :--- | :--- | :--- | :--- |
| **Common** | 60 | $60.0\%$ | 1 – 10 | $0 \le \text{roll} < 60$ |
| **Rare** | 25 | $25.0\%$ | 11 – 25 | $60 \le \text{roll} < 85$ |
| **Epic** | 12 | $12.0\%$ | 26 – 40 | $85 \le \text{roll} < 97$ |
| **Legendary** | 3 | $3.0\%$ | 41 – 50 | $97 \le \text{roll} \le 99$ |

---

## 2. Probability Without Pity (Pure Geometric Distribution)

Without a pity system, the number of trials $X$ until the first Legendary follows a Geometric Distribution:

$$P(X = k) = (1 - p)^{k-1} \cdot p, \quad \text{where } p = 0.03$$

* **Expected Trials ($E[X]$):** $\frac{1}{p} = \frac{1}{0.03} \approx 33.33 \text{ opens}$
* **Probability of Unlucky Streak ($> 30$ opens without Legendary):**
  $$P(X > 30) = (1 - 0.03)^{30} \approx 0.97^{30} \approx 0.4010 \quad (40.1\%)$$

Without pity, **over $40\%$ of players would fail to receive a Legendary within 30 opens**, leading to high player churn and frustration.

---

## 3. Probability With Truncated Pity ($N = 30$)

With the dynamic field pity system active:
* If a player reaches **30 consecutive non-legendary opens** without hitting a Legendary ($PityCounter = 30$), the 31st open is guaranteed to be Legendary ($p = 1.0$).
* When a Legendary is obtained (either by natural $3\%$ roll or via pity guarantee), the counter resets immediately to $0$.

### Effective Expected Trials ($E[X_{\text{pity}}]$):

$$E[X_{\text{pity}}] = \sum_{k=1}^{30} k \cdot (1 - p)^{k-1} \cdot p + 31 \cdot (1 - p)^{30}$$

Evaluating with $p = 0.03$:
$$E[X_{\text{pity}}] \approx 20.37 \text{ opens}$$

* **Effective Legendary Drop Rate:** $\frac{1}{20.37} \approx 4.91\%$ (up from 3.00% nominal).
* **Worst-Case Cost Ceiling:** Maximum 31 boxes required for a guaranteed top-tier NFT.

---

## 4. On-Chain State Machine Verification

```
[Start Session] ──> Read df::borrow(config.id, sender)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
[counter >= 30]                   [counter < 30]
   (Pity Active)                  (Standard RNG)
        │                                 │
        ▼                                 ▼
Force Legendary (3)               Roll u8 in 0..99
  Power: 41..50                   Common / Rare / Epic / Legendary
        │                                 │
        └────────────────┬────────────────┘
                         ▼
             Did outcome == Legendary?
                /               \
              Yes                No
              /                    \
    [Reset Counter = 0]      [Increment Counter += 1]
              \                    /
               ▼                  ▼
          Save state via df::borrow_mut / df::add
                         │
                         ▼
               Emit LootBoxOpened Event
```
