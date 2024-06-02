const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const ethers = require('ethers');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3002; // Changed default port number

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'none'"],
        fontSrc: ["'self'"],
    },
}));

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017' ;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected successfully to MongoDB server'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_API_URL);
const contractABI = require('./deployments/sepolia/SettlementsAndCrossBorderPayment.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS || '0xbAa72205413fdc573Dc58FB7cB144D21567669C9';
const privateKey = process.env.PRIVATE_KEY || '66d8a2c02d027a53b9e7e41f980c3efd81567107a5daaf19a8bbe387bfa80c8d';

if (!privateKey || privateKey.length !== 64) {
    throw new Error('Invalid private key. Please check your environment variables.');
}

const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// KYC model
const kycSchema = new mongoose.Schema({
    address: String,
    name: String,
    idType: String,
    idNumber: String,
    dayOfBirth: Number,
    monthOfBirth: Number,
    yearOfBirth: Number,
    isVerified: Boolean,
    hash: String,
});

const KYC = mongoose.model('KYC', kycSchema);

// API Routes
app.post('/init', async (req, res) => {
    try {
        await KYC.create(req.body);
        res.status(200).send('Data initialized');
    } catch (error) {
        console.error('Failed to initialize data:', error);
        res.status(500).send('Error initializing data');
    }
});

app.post('/log', async (req, res) => {
    try {
        await KYC.create(req.body);
        res.status(200).send('Transaction logged');
    } catch (error) {
        console.error('Failed to log transaction:', error);
        res.status(500).send('Error logging transaction');
    }
});

app.get('/settlements', async (req, res) => {
    try {
        const settlements = await KYC.find();
        res.json(settlements);
    } catch (error) {
        console.error('Failed to fetch settlements:', error);
        res.status(500).send('Failed to fetch settlements');
    }
});

app.post('/settlement', async (req, res) => {
    try {
        const result = await KYC.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Failed to insert settlement:', error);
        res.status(500).send('Failed to insert settlement');
    }
});

app.post('/contract/verifyKYC', async (req, res) => {
    try {
        const { address, name, idType, idNumber, dayOfBirth, monthOfBirth, yearOfBirth } = req.body;
        
        if (!address || !name || !idType || !idNumber || !dayOfBirth || !monthOfBirth || !yearOfBirth) {
            return res.status(400).send('Invalid input parameters');
        }

        const hash = crypto.createHash('sha256');
        hash.update(`${name}${idType}${idNumber}${dayOfBirth}${monthOfBirth}${yearOfBirth}`);
        await contract.verifyKYC(address, name, idType, idNumber, dayOfBirth, monthOfBirth, yearOfBirth);
        
        const kyc = new KYC({
            address,
            name,
            idType,
            idNumber,
            dayOfBirth,
            monthOfBirth,
            yearOfBirth,
            isVerified: true,
            hash: hash.digest('hex'),
        });

        await kyc.save();
        res.send(`KYC verified for address ${address}`);
    } catch (error) {
        console.error('Failed to verify KYC:', error);
        res.status(500).send('Failed to verify KYC');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port} and connected to MongoDB and Ethereum network`);
});
