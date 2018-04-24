import EthCrypto, { Encrypted } from 'eth-crypto';
import { createHmac } from 'crypto-browserify';
import { Eth } from 'web3/types';

const web3 = EthCrypto.util.web3;

interface Block {
    publicKey: string;
    challenge: string;
    timestamp: number;
    order: number;
    proof: string;
}

const generateChallenge = (secret: string, data: string) => {
    const sig = createHmac('sha256', secret).update(data).digest('hex');
    return sig;
}

const createBlock = (publicKey: string, privateKey: string, random: string, prev?: Block, prevRandom?: string): Block => {
    return {
        publicKey,
        challenge: generateChallenge(random, publicKey),
        timestamp: Date.now(),
        order: prev != null ? prev.order + 1 : 0,
        proof: prevRandom != null ? prevRandom : '',
    }
}

const isValidBlock = (block: Block, prevBlock: Block): boolean => {
    if (block.proof === '' && block.order > 0) {
        return false;
    }
    if (block.order !== prevBlock.order + 1) {
        return false;
    }
    if (prevBlock.challenge !== generateChallenge(block.proof, prevBlock.publicKey)) {
        return false;
    }
    return true;
}

const GenesisPrivateKey = '0x45e1805a7b6eee384820ac97c90b39c51265ac8e39715fa8d76a4f71fdb90def';
const GenesisPublicKey = 'e8869123ec894bfb8bce8dc3b083ecde6ba16abe3ea7ff2b32ca62eaded164bdf3aae44766c1431477d570378e81cb3fb674ae7dcdcb4257abdd1491f12641b8';
const GenesisRandom = web3.utils.randomHex(64);

const createAndValidate = () => {
    const GenesisBlock = createBlock(GenesisPublicKey, GenesisPrivateKey, GenesisRandom);
    console.log(GenesisBlock);

    const newId = EthCrypto.createIdentity();
    const newRandom = web3.utils.randomHex(64);
    const nextBlock = createBlock(newId.publicKey, newId.privateKey, newRandom, GenesisBlock, GenesisRandom);
    console.log(nextBlock);

    console.log(isValidBlock(nextBlock, GenesisBlock));
}

createAndValidate()
