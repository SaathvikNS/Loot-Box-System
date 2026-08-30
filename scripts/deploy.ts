/**
 * Deployment Script for Sui Gaming Loot Box & NFT Contract
 *
 * Usage:
 *   npx ts-node scripts/deploy.ts --network testnet
 */

import { execSync } from 'child_process';
import * as path from 'path';

interface DeploymentResult {
  packageId: string;
  gameConfigId: string;
  adminCapId: string;
  digest: string;
}

export async function deployContract(): Promise<DeploymentResult> {
  console.log('🚀 Deploying gaminglootbox package to Sui Network...');

  const contractsPath = path.resolve(__dirname, '../contracts');
  const suiBinary = path.resolve(__dirname, '../bin/sui.exe');

  try {
    const buildOutput = execSync(`"${suiBinary}" client publish --gas-budget 100000000 --json`, {
      cwd: contractsPath,
      encoding: 'utf-8',
    });

    const parsed = JSON.parse(buildOutput);
    console.log('✅ Publish Transaction Succeeded! Digest:', parsed.digest);

    // Extract published package ID, shared GameConfig, and AdminCap
    let packageId = '';
    let gameConfigId = '';
    let adminCapId = '';

    for (const change of parsed.objectChanges || []) {
      if (change.type === 'published') {
        packageId = change.packageId;
      } else if (change.type === 'created') {
        if (change.objectType?.includes('::lootbox::GameConfig')) {
          gameConfigId = change.objectId;
        } else if (change.objectType?.includes('::lootbox::AdminCap')) {
          adminCapId = change.objectId;
        }
      }
    }

    console.log('\n📦 Deployment Summary:');
    console.log(`- Package ID:   ${packageId}`);
    console.log(`- GameConfig:   ${gameConfigId}`);
    console.log(`- AdminCap ID:  ${adminCapId}`);

    return { packageId, gameConfigId, adminCapId, digest: parsed.digest };
  } catch (err: any) {
    console.error('❌ Deployment failed:', err.message);
    throw err;
  }
}

if (require.main === module) {
  deployContract().catch(console.error);
}
