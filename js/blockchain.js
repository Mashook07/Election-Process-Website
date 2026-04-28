// ============================================
// VoteGuide AI — Blockchain Ledger Module
// Tamper-proof vote storage with chained hashes
// ============================================

import { sha256 } from './crypto.js';
import { db, collection, addDoc, getDocs, query, orderBy } from './firebase-config.js';

/**
 * SECURITY OVERVIEW:
 * - Each vote is stored as a block with: index, timestamp, data hash, previous hash, nonce
 * - Blocks are chained via SHA-256 hashes — tampering with any block invalidates the chain
 * - Merkle root provides a single hash representing all votes (efficient verification)
 * - Chain is persisted in Firestore `blockchain_ledger` collection (append-only)
 * - Proof-of-work prevents rapid block insertion
 */

const BLOCKCHAIN_COLLECTION = 'blockchain_ledger';
const DIFFICULTY = 2; // Number of leading zeros in hash (low for demo, would be higher in production)

// ── Block Class ──
export class Block {
  constructor(index, timestamp, dataHash, previousHash, nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.dataHash = dataHash; // SHA-256 hash of the encrypted vote (NOT the vote itself)
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = ''; // Will be calculated
  }

  async calculateHash() {
    const blockString = `${this.index}${this.timestamp}${this.dataHash}${this.previousHash}${this.nonce}`;
    return sha256(blockString);
  }

  // Proof of Work — find a hash with required leading zeros
  async mine(difficulty) {
    const target = '0'.repeat(difficulty);
    let attempts = 0;
    const maxAttempts = 100000; // Safety limit

    do {
      this.nonce++;
      this.hash = await this.calculateHash();
      attempts++;
    } while (!this.hash.startsWith(target) && attempts < maxAttempts);

    return this;
  }

  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      dataHash: this.dataHash,
      previousHash: this.previousHash,
      nonce: this.nonce,
      hash: this.hash
    };
  }

  static fromJSON(json) {
    const block = new Block(
      json.index,
      json.timestamp,
      json.dataHash,
      json.previousHash,
      json.nonce
    );
    block.hash = json.hash;
    return block;
  }
}

// ── Blockchain Class ──
export class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = DIFFICULTY;
    this.isInitialized = false;
  }

  // Initialize with genesis block
  async initialize() {
    if (this.isInitialized) return;

    // Try to load existing chain from Firestore
    const existingChain = await this.loadFromFirestore();
    if (existingChain.length > 0) {
      this.chain = existingChain;
    } else {
      // Create genesis block
      const genesisBlock = new Block(0, Date.now(), 'GENESIS_BLOCK', '0');
      genesisBlock.hash = await genesisBlock.calculateHash();
      this.chain = [genesisBlock];

      // Save genesis to Firestore
      await this.saveBlockToFirestore(genesisBlock);
    }

    this.isInitialized = true;
  }

  // Get the latest block
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add a new vote block
  async addVoteBlock(encryptedVoteHash) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      previousBlock.index + 1,
      Date.now(),
      encryptedVoteHash,
      previousBlock.hash
    );

    // Mine the block (proof of work)
    await newBlock.mine(this.difficulty);

    // Validate before adding
    if (await this.isValidNewBlock(newBlock, previousBlock)) {
      this.chain.push(newBlock);
      await this.saveBlockToFirestore(newBlock);
      return newBlock;
    }

    throw new Error('Invalid block — chain integrity compromised');
  }

  // Validate a new block against the previous
  async isValidNewBlock(newBlock, previousBlock) {
    if (newBlock.index !== previousBlock.index + 1) return false;
    if (newBlock.previousHash !== previousBlock.hash) return false;

    const calculatedHash = await newBlock.calculateHash();
    if (newBlock.hash !== calculatedHash) return false;

    // Verify proof of work
    if (!newBlock.hash.startsWith('0'.repeat(this.difficulty))) return false;

    return true;
  }

  // Validate the entire chain
  async validateChain() {
    const results = {
      valid: true,
      totalBlocks: this.chain.length,
      errors: [],
      checkedAt: new Date().toISOString()
    };

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check hash integrity
      const calculatedHash = await currentBlock.calculateHash();
      if (currentBlock.hash !== calculatedHash) {
        results.valid = false;
        results.errors.push({
          block: i,
          error: 'Hash mismatch — block data has been tampered',
          expected: calculatedHash,
          actual: currentBlock.hash
        });
      }

      // Check chain linking
      if (currentBlock.previousHash !== previousBlock.hash) {
        results.valid = false;
        results.errors.push({
          block: i,
          error: 'Chain broken — previousHash does not match',
          expected: previousBlock.hash,
          actual: currentBlock.previousHash
        });
      }
    }

    return results;
  }

  // Calculate Merkle root of all vote hashes
  async getMerkleRoot() {
    const hashes = this.chain
      .filter(b => b.index > 0) // Exclude genesis
      .map(b => b.dataHash);

    if (hashes.length === 0) return 'EMPTY';

    let layer = hashes;
    while (layer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i];
        const right = layer[i + 1] || left; // Duplicate last if odd
        nextLayer.push(await sha256(left + right));
      }
      layer = nextLayer;
    }

    return layer[0];
  }

  // Get chain statistics
  getStats() {
    const voteBlocks = this.chain.filter(b => b.index > 0);
    return {
      totalBlocks: this.chain.length,
      totalVotes: voteBlocks.length,
      genesisTimestamp: this.chain[0]?.timestamp,
      latestTimestamp: this.getLatestBlock()?.timestamp,
      chainHash: this.getLatestBlock()?.hash
    };
  }

  // Check if a vote hash exists in the chain (for receipt verification)
  findVoteByHash(voteHash) {
    const block = this.chain.find(b => b.dataHash === voteHash);
    if (block) {
      return {
        found: true,
        blockIndex: block.index,
        timestamp: block.timestamp,
        blockHash: block.hash
      };
    }
    return { found: false };
  }

  // ── Firestore Persistence ──

  async saveBlockToFirestore(block) {
    try {
      await addDoc(collection(db, BLOCKCHAIN_COLLECTION), {
        ...block.toJSON(),
        savedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save block to Firestore:', error);
    }
  }

  async loadFromFirestore() {
    try {
      const q = query(
        collection(db, BLOCKCHAIN_COLLECTION),
        orderBy('index', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => Block.fromJSON(doc.data()));
    } catch (error) {
      console.error('Failed to load blockchain from Firestore:', error);
      return [];
    }
  }
}

// ── Singleton Instance ──
let blockchainInstance = null;

export async function getBlockchain() {
  if (!blockchainInstance) {
    blockchainInstance = new Blockchain();
    await blockchainInstance.initialize();
  }
  return blockchainInstance;
}

// ── Render Chain Visualization ──
export function renderChainVisualization(chain) {
  if (!chain || chain.length === 0) {
    return '<p style="text-align:center;color:var(--gray-500)">No blocks in the chain.</p>';
  }

  return `
    <div class="blockchain-viz">
      ${chain.slice(-10).map((block, i) => `
        <div class="blockchain-block ${block.index === 0 ? 'genesis-block' : ''}" style="animation-delay: ${i * 0.1}s">
          <div class="block-header">
            <span class="block-index">#${block.index}</span>
            <span class="block-time">${new Date(block.timestamp).toLocaleTimeString('en-IN')}</span>
          </div>
          <div class="block-hash">
            <span class="hash-label">Hash</span>
            <code class="hash-value">${block.hash?.substring(0, 12)}...</code>
          </div>
          <div class="block-hash">
            <span class="hash-label">Prev</span>
            <code class="hash-value">${block.previousHash?.substring(0, 12)}...</code>
          </div>
          ${block.index > 0 ? `<div class="block-data">
            <span class="hash-label">Vote</span>
            <code class="hash-value">${block.dataHash?.substring(0, 12)}...</code>
          </div>` : '<div class="block-data"><span class="genesis-label">🏁 Genesis Block</span></div>'}
          <div class="block-nonce">Nonce: ${block.nonce}</div>
        </div>
        ${i < chain.slice(-10).length - 1 ? '<div class="chain-connector"><div class="chain-arrow">→</div></div>' : ''}
      `).join('')}
    </div>
  `;
}
