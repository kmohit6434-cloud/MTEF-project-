const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

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

// 📧 EMAIL SETUP (Nodemailer)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mohitkumarolanda@gmail.com', 
        pass: 'cpqr fnnz pmut topw' // 👈 पेस्ट करने से पहले इसे अपने असली पासवर्ड से बदल लें!
    }
});

let tempOTPs = {}; 

// 📩 SEND OTP API
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    tempOTPs[email] = otp;

    const mailOptions = {
        from: 'MTEF Portal',
        to: email,
        subject: 'MTEF Verification OTP',
        text: `आपका MTEF रजिस्ट्रेशन OTP है: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.json({ success: false, message: "Email send failed!" });
        res.json({ success: true, message: "OTP sent to your email!" });
    });
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

// 🔐 LOGIN API (With Admin Security)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // 🛡️ ADMIN CHECK (सिर्फ आपके लिए)
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
