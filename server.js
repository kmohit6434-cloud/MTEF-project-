const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('./'));

// 🌐 MONGODB CONNECTION WITH ERROR LOGGING
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Mohitbhai0580:Mohit%400580@cluster0.854fydd.mongodb.net/mtef_db?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { 
    serverSelectionTimeoutMS: 5000 // Agar 5 sec mein na jude toh error de
}).then(() => {
    console.log('✅ MongoDB Connected Successfully!');
}).catch(err => {
    console.log('❌ MongoDB Connection Error:', err.message);
});

// 📁 MODELS
const UserSchema = new mongoose.Schema({
    fullName: String, email: String, mobile: String, password: String, accountType: String,
    bankDetails: { bankName: String, accHolder: String, accNumber: String, ifsc: String }
});
const Customer = mongoose.model('Customer', UserSchema, 'customers');
const Agent = mongoose.model('Agent', UserSchema, 'agents');

let tempOTPs = {}; 

// 📱 OTP API
app.post('/api/send-otp', async (req, res) => {
    const { mobile } = req.body; 
    const otp = Math.floor(100000 + Math.random() * 900000);
    tempOTPs[mobile] = otp; 
    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { 'authorization': process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'q', message: `MTEF OTP is: ${otp}`, numbers: mobile })
        });
        const data = await response.json();
        res.json({ success: data.return, message: data.return ? "OTP Sent!" : "SMS Error" });
    } catch (e) { res.json({ success: false, message: "Server Error" }); }
});

// 📝 REGISTRATION API
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password, accountType, otp } = req.body;
        if (tempOTPs[mobile] != otp) return res.json({ success: false, message: 'Invalid OTP!' });
        
        const Model = accountType === 'Agent' ? Agent : Customer;
        await new Model({ fullName, email, mobile, password, accountType }).save();
        
        delete tempOTPs[mobile];
        res.json({ success: true, message: 'Account Created Successfully!' });
    } catch (err) {
        console.log("Registration Error:", err.message);
        res.json({ success: false, message: "Database Error: " + err.message });
    }
});

// 🔐 LOGIN API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "mohitkumarolanda@gmail.com" && password === "Mohit@Admin786") return res.json({ success: true, redirectUrl: 'admin.html' });
    const agent = await Agent.findOne({ $or: [{email}, {mobile: email}], password });
    const customer = await Customer.findOne({ $or: [{email}, {mobile: email}], password });
    if (agent) return res.json({ success: true, redirectUrl: 'agent.html' });
    if (customer) return res.json({ success: true, redirectUrl: 'customer.html' });
    res.json({ success: false, message: 'Login Failed!' });
});

// 🏦 ADD BANK API
app.post('/api/add-bank', async (req, res) => {
    const { email, bankName, accHolder, accNumber, ifsc } = req.body;
    try {
        await Agent.findOneAndUpdate({ $or: [{email}, {mobile: email}] }, { bankDetails: { bankName, accHolder, accNumber, ifsc } });
        res.json({ success: true, message: "Bank Account Added Successfully!" });
    } catch (e) { res.json({ success: false, message: "Database Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
