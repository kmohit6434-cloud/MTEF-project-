const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('./'));

// 🌐 MONGODB CONNECTION
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://Mohitbhai0580:Mohit%400580@cluster0.854fydd.mongodb.net/mtef_db?appName=Cluster0';
mongoose.connect(mongoURI).then(() => console.log('✅ MongoDB Connected')).catch(err => console.log(err));

// 📁 MODELS
const UserSchema = new mongoose.Schema({
    fullName: String, email: String, mobile: String, password: String, accountType: String
});
const Customer = mongoose.model('Customer', UserSchema, 'customers');
const Agent = mongoose.model('Agent', UserSchema, 'agents');

let tempOTPs = {}; 

// 📩 SEND OTP API (🔥 THE PROFESSIONAL API WAY)
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    tempOTPs[email] = otp;

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // 👈 यह तिजोरी से API Key लेगा
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { email: "mohitkumarolanda@gmail.com", name: "MTEF Portal" }, // 👈 यहाँ से ईमेल जाएगा
                to: [{ email: email }],
                subject: 'MTEF Verification OTP',
                textContent: `आपका MTEF रजिस्ट्रेशन OTP है: ${otp}`
            })
        });

        if (response.ok) {
            res.json({ success: true, message: "OTP sent to your email!" });
        } else {
            const errorData = await response.json();
            console.log("Brevo API Error: ", errorData);
            res.json({ success: false, message: "API Error! Check Render Logs." });
        }
    } catch (error) {
        console.log("Network Error: ", error);
        res.json({ success: false, message: "Server Connection Error" });
    }
});

// 📝 REGISTRATION API
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password, accountType, otp } = req.body;
        if (tempOTPs[email] != otp) return res.json({ success: false, message: 'Invalid OTP!' });

        const Model = accountType === 'Agent' ? Agent : Customer;
        const newUser = new Model({ fullName, email, mobile, password, accountType });
        await newUser.save();
        delete tempOTPs[email];
        res.json({ success: true, message: 'Account Created Successfully!' });
    } catch (err) { res.json({ success: false, message: err.message }); }
});

// 🔐 LOGIN API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (email === "mohitkumarolanda@gmail.com" && password === "Mohit@Admin786") {
        return res.json({ success: true, redirectUrl: 'admin.html' });
    }

    try {
        const agent = await Agent.findOne({ email, password });
        const customer = await Customer.findOne({ email, password });
        if (agent) return res.json({ success: true, redirectUrl: 'agent.html' });
        if (customer) return res.json({ success: true, redirectUrl: 'customer.html' });
        res.json({ success: false, message: 'Invalid Credentials!' });
    } catch (err) { res.json({ success: false, message: 'Server Error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
