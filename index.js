const SHA256 = require('crypto-js/sha256');

class Blockchain {
  constructor({ difficulty, genesisTimestamp = Date.now() }) {
    this.chain = [this.createGenesisBlock(genesisTimestamp)];
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.miningReward = 5;
    this.changeDifficultyOnMultiple = 100;
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  handleDifficultyChange() {
    console.log('Difficulty increased');
    this.difficulty += 1;
    this.miningReward -= 1;
  }

  createGenesisBlock(genesisTimestamp) {
    return new Block({
      timestamp: genesisTimestamp,
      transactions: [],
      previousHash: '0',
    });
  }

  isValidChain() {
    for (let index = 1; index < this.chain.length; index++) {
      const currentBlock = this.chain[index];
      const previousBlock = this.chain[index - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      return true;
    }
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block({
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      previousHash: this.lastBlock.hash,
    });

    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');

    this.chain.push(block);

    if (this.chain.length % this.changeDifficultyOnMultiple === 0) {
      this.handleDifficultyChange();
    }

    this.pendingTransactions = [
      new Transaction({
        fromAddress: null,
        toAddress: miningRewardAddress,
        amount: this.miningReward,
      }),
    ];
  }

  getBalanceForAddress(address) {
    return this.chain.reduce((balance, block) => {
      block.transactions.forEach(transaction => {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      });

      return balance;
    }, 0);
  }
}

class Block {
  constructor({ previousHash = '', timestamp, transactions }) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      `${this.previousHash}${this.timestamp}${JSON.stringify(this.transactions)}${this.nonce}`
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log('Block mined');
  }
}

class Transaction {
  constructor({ fromAddress, toAddress, amount }) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

const myCoin = new Blockchain({ difficulty: 1 });

[...Array(300)].forEach(() => {
  myCoin.minePendingTransactions('abc');
});

console.log(myCoin);
console.log(myCoin.isValidChain());
