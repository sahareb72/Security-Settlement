require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ethers } = require('ethers');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_API_URL);

const contractABI = require('./deployments/sepolia/SettlementsAndCrossBorderPayment.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const port = process.env.PORT;
const privateKey = process.env.PRIVATE_KEY;

let dbConnection;
let contract;

async function connectDB() {
    if (!dbConnection) {
        try {
            await client.connect();
            console.log('Connected successfully to MongoDB server');
            dbConnection = mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (err) {
            console.error('Failed to connect to MongoDB', err);
            await client.close();
            return null;
        }
    }
    return dbConnection;
}

async function setupContract() {
    if (!contract) {
        const wallet = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(contractAddress, contractABI, wallet);
    }
}

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

// Example Ethereum interaction route
app.get('/contract/kycStatus/:address', async (req, res) => {
    try {
        const kycStatus = await contract.kycVerified(req.params.address);
        res.send({ address: req.params.address, kycStatus: kycStatus });
    } catch (error) {
        console.error('Failed to fetch KYC status:', error);
        res.status(500).send('Failed to fetch KYC status');
    }
});

// Function to verify KYC
app.post('/contract/verifyKYC', async (req, res) => {
    try {
        const { address, name, idType, idNumber, dayOfBirth, monthOfBirth, yearOfBirth } = req.body;

        if (!address || !name || !idType || !idNumber || !dayOfBirth || !monthOfBirth || !yearOfBirth) {
            return res.status(400).send('Invalid input parameters');
        }

        const hash = crypto.createHash('sha256');
        hash.update(`${name}${idType}${idNumber}${dayOfBirth}${monthOfBirth}${yearOfBirth}`);
        const kycStatus = await contract.verifyKYC(address, name, idType, idNumber, dayOfBirth, monthOfBirth, yearOfBirth);

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

// Route to initialize data
app.post('/init', async (req, res) => {
    const db = await connectDB();
    if (!db) {
        return res.status(500).send('Failed to connect to MongoDB');
    }
    try {
        const collection = db.collection('SD1');
        await collection.insertOne(req.body);
        res.status(200).send('Data initialized');
    } catch (error) {
        console.error('Failed to initialize data:', error);
        res.status(500).send('Error initializing data');
    }
});

// Route to log transactions
app.post('/log', async (req, res) => {
    const db = await connectDB();
    if (!db) {
        return res.status(500).send('Failed to connect to MongoDB');
    }
    try {
        const collection = db.collection('SD1');
        await collection.insertOne(req.body);
        res.status(200).send('Transaction logged');
    } catch (error) {
        console.error('Failed to log transaction:', error);
        res.status(500).send('Error logging transaction');
    }
});

// Start server
async function startServer() {
    try {
        await connectDB();
        await setupContract();
        app.listen(port, () => {
            console.log(`Server running on port ${port} and connected to MongoDB and Ethereum network`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();
