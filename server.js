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

// 📱 SEND MOBILE OTP API (Fast2SMS)
app.post('/api/send-otp', async (req, res) => {
    const { mobile } = req.body; 
    
    if (!mobile || mobile.length !== 10) {
        return res.json({ success: false, message: "कृपया सही 10-अंकों का मोबाइल नंबर डालें!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    tempOTPs[mobile] = otp; // OTP को मोबाइल नंबर के साथ सेव किया

    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                'authorization': process.env.FAST2SMS_API_KEY, // 👈 रेंडर से Fast2SMS की चाबी लेगा
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'otp',
                variables_values: otp.toString(),
                numbers: mobile
            })
        });

        const data = await response.json();
        
        if (data.return) {
            res.json({ success: true, message: "OTP आपके मोबाइल नंबर पर भेज दिया गया है!" });
        } else {
            console.log("Fast2SMS Error: ", data);
            res.json({ success: false, message: "SMS API Error! Number check करें।" });
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
        
        // अब OTP मोबाइल नंबर से चेक होगा
        if (tempOTPs[mobile] != otp) return res.json({ success: false, message: 'Invalid OTP! गलत OTP' });

        const Model = accountType === 'Agent' ? Agent : Customer;
        const newUser = new Model({ fullName, email, mobile, password, accountType });
        await newUser.save();
        delete tempOTPs[mobile];
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
