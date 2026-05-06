const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

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

// 📝 REGISTRATION API
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password, accountType } = req.body;
        const Model = accountType === 'Agent' ? Agent : Customer;
        const newUser = new Model({ fullName, email, mobile, password, accountType });
        await newUser.save();
        res.json({ success: true, message: 'Account Created Successfully!' });
    } catch (err) { res.json({ success: false, message: 'Error: ' + err.message }); }
});

// 🔐 LOGIN API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const agent = await Agent.findOne({ email, password });
        const customer = await Customer.findOne({ email, password });

        if (agent) return res.json({ success: true, redirectUrl: 'agent.html' });
        if (customer) return res.json({ success: true, redirectUrl: 'customer.html' });

        res.json({ success: false, message: 'Invalid Email or Password!' });
    } catch (err) { res.json({ success: false, message: 'Server Error' }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
