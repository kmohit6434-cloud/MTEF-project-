const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('./'));

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI).then(() => console.log('✅ Connected to MongoDB')).catch(e => console.log(e));

// 🛑 SCHEMA UPDATED: userId added
const UserSchema = new mongoose.Schema({
    fullName: String, mobile: String, password: String, accountType: String,
    userId: String, // Ye nayi ID ke liye hai
    bankDetails: { bankName: String, accHolder: String, accNumber: String, ifsc: String }
});
const Customer = mongoose.model('Customer', UserSchema, 'customers');
const Agent = mongoose.model('Agent', UserSchema, 'agents');

let tempOTPs = {}; 
let otpLimits = {};

app.post('/api/send-otp', async (req, res) => {
    const { mobile } = req.body;
    if (!otpLimits[mobile]) otpLimits[mobile] = 0;
    if (otpLimits[mobile] >= 3) return res.json({ success: false, message: "Limit: Max 3 OTPs allowed" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    tempOTPs[mobile] = otp; 
    
    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: { 'authorization': process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ route: 'q', message: `MTEF OTP: ${otp}`, numbers: mobile })
        });
        const data = await response.json();
        if (data.return) {
            otpLimits[mobile]++;
            res.json({ success: true, message: "OTP Sent!" });
        } else { res.json({ success: false, message: "Fast2SMS Error" }); }
    } catch (e) { res.json({ success: false, message: "Server Error" }); }
});

// 📝 REGISTRATION API (With ID Generator)
app.post('/api/register', async (req, res) => {
    const { fullName, mobile, password, accountType, otp } = req.body;
    if (tempOTPs[mobile] != otp) return res.json({ success: false, message: 'Invalid OTP!' });
    
    // 🛑 GENERATE UNIQUE ID
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const userId = accountType === 'Agent' ? `MTEF${randomDigits}` : `MTEF@${randomDigits}`;

    const Model = accountType === 'Agent' ? Agent : Customer;
    await new Model({ fullName, mobile, password, accountType, userId }).save();
    delete tempOTPs[mobile];
    res.json({ success: true, message: `Registration Done! Your ID is ${userId}` });
});

// 🔐 LOGIN API (Returns Name and ID)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (email === "MTEF@0580" && password === "Aarav@divyansh@0580") {
        return res.json({ success: true, redirectUrl: 'admin_dashboard.html', isAdmin: true });
    }
    
    const agent = await Agent.findOne({ mobile: email, password });
    const customer = await Customer.findOne({ mobile: email, password });
    
    // Yahan hum userName aur userId bhi bhej rahe hain front-end ko
    if (agent) return res.json({ success: true, redirectUrl: 'agent.html', isAdmin: false, userName: agent.fullName, userId: agent.userId || "MTEF0000" });
    if (customer) return res.json({ success: true, redirectUrl: 'customer.html', isAdmin: false, userName: customer.fullName, userId: customer.userId || "MTEF@0000" });
    
    res.json({ success: false, message: 'Invalid Credentials!' });
});

app.get('/api/admin/all-data', async (req, res) => {
    const agents = await Agent.find({});
    const customers = await Customer.find({});
    res.json({ agents, customers });
});

app.post('/api/add-bank', async (req, res) => {
    const { email, bankName, accHolder, accNumber, ifsc } = req.body;
    await Agent.findOneAndUpdate({ mobile: email }, { bankDetails: { bankName, accHolder, accNumber, ifsc } });
    res.json({ success: true, message: "Bank Details Updated!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
