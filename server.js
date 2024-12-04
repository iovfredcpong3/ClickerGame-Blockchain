require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Web3 } = require('web3'); // ใช้ Web3 เวอร์ชันล่าสุด
const mongoose = require('mongoose');
const app = express();
app.use(bodyParser.json());
const cors = require('cors'); // ใช้งาน CORS

// ตั้งค่า CORS
app.use(cors());

// Configurations
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_CONTRACT_ADDRESS = '0x642001Dd6b290baA40BD177Aaa8669C8126eadf9';
const TOKEN_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // ใส่ ABI ของ Smart Contract
const NFT_CONTRACT_ADDRESS = '0x41c71B4c752FA4a312E16929c56bAe1a4b594199';
const NFT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "tokenURI",
				"type": "string"
			}
		],
		"name": "awardAchievement",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "checkClaimStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];



// สร้าง Web3 Instance
const web3 = new Web3(PROVIDER_URL);

// ดึง Address จาก Private Key
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account); // เพิ่ม Private Key ลงใน Wallet
web3.eth.defaultAccount = account.address; // ตั้ง Default Account

// สร้าง Token Contract Instance
const tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_CONTRACT_ADDRESS);
const nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);

// Endpoint สำหรับ Claim Token
app.post('/claim', async (req, res) => {
    const recipientAddress = req.body.address;

    try {
        if (!recipientAddress) {
            return res.status(400).send({ success: false, error: 'Recipient address is required' });
        }

        const tx = tokenContract.methods.transfer(recipientAddress, web3.utils.toWei('10', 'ether'));

        const gasLimit = await tx.estimateGas({ from: account.address });
        const baseFeePerGas = await web3.eth.getGasPrice();
        const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei');
        const maxFeePerGas = parseInt(baseFeePerGas) + parseInt(maxPriorityFeePerGas);

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: TOKEN_CONTRACT_ADDRESS,
                data: tx.encodeABI(),
                gas: gasLimit,
                maxFeePerGas,
                maxPriorityFeePerGas,
                from: account.address,
            },
            PRIVATE_KEY
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        // แปลง BigInt ใน receipt เป็น string ก่อนส่งกลับ
        const sanitizedReceipt = JSON.parse(JSON.stringify(receipt, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.send({ success: true, receipt: sanitizedReceipt });
    } catch (error) {
        console.error('Transaction Error:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// สร้าง Schema และ Model สำหรับ Leaderboard
const leaderboardSchema = new mongoose.Schema({
    address: { type: String, required: true },
    clicks: { type: Number, required: true },
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// เพิ่มข้อมูลลง Leaderboard
app.post('/leaderboard', async (req, res) => {
    const { address, clicks } = req.body;

    try {
        if (!address || clicks === undefined) {
            return res.status(400).send({ success: false, error: 'Address and clicks are required' });
        }

        const existingEntry = await Leaderboard.findOne({ address });
        if (existingEntry) {
            existingEntry.clicks += clicks; // เพิ่มจำนวนคลิกสะสม
            await existingEntry.save();
        } else {
            const newEntry = new Leaderboard({ address, clicks });
            await newEntry.save();
        }

        res.send({ success: true, message: 'Leaderboard updated' });
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

// ดึงข้อมูล Leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find().sort({ clicks: -1 }).limit(10); // แสดง Top 10
        res.send({ success: true, leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

app.get('/coins', async (req, res) => {
    const address = req.query.address;
    if (!address) {
        return res.status(400).send({ success: false, error: 'Address is required' });
    }

    try {
        const balance = await tokenContract.methods.balanceOf(address).call();
        res.send({ success: true, balance: web3.utils.fromWei(balance, 'ether') });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

app.post('/claimNFT', async (req, res) => {
    const { address } = req.body;

    if (!address) {
        return res.status(400).send({ success: false, error: 'Address is required' });
    }

    try {
        const leaderboard = await Leaderboard.find().sort({ clicks: -1 }).limit(100);
        const isEligible = leaderboard.some((entry) => entry.address === address);

        if (!isEligible) {
            return res.status(403).send({ success: false, error: 'Not eligible for NFT claim' });
        }

        const hasClaimed = await nftContract.methods.checkClaimStatus(address).call();
        if (hasClaimed) {
            return res.status(400).send({ success: false, error: 'NFT already claimed' });
        }

        const tx = nftContract.methods.awardAchievement(address, "ipfs://QmQKYbivFmRjXu2QvaDSheSzqEQz89Ummh32G2pTv5VPy9");
        const gasLimit = await tx.estimateGas({ from: account.address });
        const baseFeePerGas = await web3.eth.getGasPrice();
        const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei');
        const maxFeePerGas = parseInt(baseFeePerGas) + parseInt(maxPriorityFeePerGas);

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: NFT_CONTRACT_ADDRESS,
                data: tx.encodeABI(),
                gas: gasLimit,
                maxFeePerGas,
                maxPriorityFeePerGas,
                from: account.address,
            },
            PRIVATE_KEY
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        // Handle BigInt serialization
        const sanitizedReceipt = JSON.parse(JSON.stringify(receipt, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.send({ success: true, receipt: sanitizedReceipt });
    } catch (error) {
        console.error('Error claiming NFT:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

app.get('/checkNFT', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).send({ success: false, error: 'Address is required' });
    }

    try {
        const hasNFT = await nftContract.methods.checkClaimStatus(address).call();
        res.send({ success: true, hasNFT });
    } catch (error) {
        console.error('Error checking NFT status:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});

app.get('/getNFTs', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).send({ success: false, error: 'Address is required' });
    }

    try {
        const events = await nftContract.getPastEvents('Transfer', {
            filter: { to: address },
            fromBlock: 0,
            toBlock: 'latest',
        });

        const nfts = [];
        for (const event of events) {
            const tokenId = event.returnValues.tokenId;
            let tokenURI = await nftContract.methods.tokenURI(tokenId).call();

            // ตรวจสอบและแปลง tokenURI
            if (tokenURI.startsWith('ipfs://')) {
                tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            } else if (!tokenURI.startsWith('http://') && !tokenURI.startsWith('https://')) {
                throw new Error(`Invalid tokenURI format: ${tokenURI}`);
            }

            // ดึง Metadata
            const metadataResponse = await fetch(tokenURI);
            const metadata = await metadataResponse.json();

            nfts.push({
                tokenId: tokenId.toString(),
                name: metadata.name,
                description: metadata.description,
                image: metadata.image, // URL รูปภาพ
            });
        }

        res.send({ success: true, nfts });
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});









// เริ่มเซิร์ฟเวอร์
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
