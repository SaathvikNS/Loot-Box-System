/**
 * Programmable Transaction Block (PTB) Interaction Guide
 *
 * Demonstrates how to build and execute transactions against the gaminglootbox contract
 * using @mysten/sui / TypeScript SDK.
 */

export const PTB_SNIPPETS = {
  // 1. Purchase Loot Box
  purchaseLootBox: `
import { Transaction } from '@mysten/sui/transactions';

export function buildPurchaseLootBoxTx(
  packageId: string,
  gameConfigId: string,
  priceMist: number
) {
  const tx = new Transaction();

  // Split coin for box price from gas
  const [paymentCoin] = tx.splitCoins(tx.gas, [priceMist]);

  // Call buy_loot_box_entry
  tx.moveCall({
    target: \`\${packageId}::lootbox::buy_loot_box_entry\`,
    arguments: [
      tx.object(gameConfigId),
      paymentCoin,
    ],
  });

  return tx;
}
`,

  // 2. Open Loot Box with sui::random
  openLootBox: `
import { Transaction } from '@mysten/sui/transactions';

export function buildOpenLootBoxTx(
  packageId: string,
  gameConfigId: string,
  lootboxObjectId: string
) {
  const tx = new Transaction();

  // Immutable Random object at address 0x8
  const SUI_RANDOM_OBJECT_ID = '0x8';

  // Call private entry open_loot_box
  tx.moveCall({
    target: \`\${packageId}::lootbox::open_loot_box\`,
    arguments: [
      tx.object(gameConfigId),
      tx.object(lootboxObjectId),
      tx.object(SUI_RANDOM_OBJECT_ID),
    ],
  });

  return tx;
}
`,

  // 3. Transfer Game Item NFT
  transferItem: `
import { Transaction } from '@mysten/sui/transactions';

export function buildTransferItemTx(
  packageId: string,
  gameItemId: string,
  recipientAddress: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: \`\${packageId}::lootbox::transfer_item\`,
    arguments: [
      tx.object(gameItemId),
      tx.pure.address(recipientAddress),
    ],
  });

  return tx;
}
`,

  // 4. Burn Game Item NFT
  burnItem: `
import { Transaction } from '@mysten/sui/transactions';

export function buildBurnItemTx(
  packageId: string,
  gameItemId: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: \`\${packageId}::lootbox::burn_item\`,
    arguments: [
      tx.object(gameItemId),
    ],
  });

  return tx;
}
`,
};

console.log('PTB Code Snippets loaded.');
