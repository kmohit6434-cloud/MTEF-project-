const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('./'));

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI).then(() => console.log('✅ Connected to MongoDB')).catch(e => console.log(e));

const UserSchema = new mongoose.Schema({
    fullName: String, email: String, mobile: String, password: String, accountType: String,
    bankDetails: { bankName: String, accHolder: String, accNumber: String, ifsc: String }
});
const Customer = mongoose.model('Customer', UserSchema, 'customers');
const Agent = mongoose.model('Agent', UserSchema, 'agents');

app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password, accountType } = req.body;
        const Model = accountType === 'Agent' ? Agent : Customer;
        await new Model({ fullName, email: email || "", mobile, password, accountType }).save();
        res.json({ success: true, message: 'Registration Successful! Data Saved.' });
    } catch (err) {
        res.json({ success: false, message: "Database Error: " + err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "mohitkumarolanda@gmail.com" && password === "Mohit@Admin786") return res.json({ success: true, redirectUrl: 'admin_dashboard.html' });
    const agent = await Agent.findOne({ $or: [{email}, {mobile: email}], password });
    const customer = await Customer.findOne({ $or: [{email}, {mobile: email}], password });
    if (agent) return res.json({ success: true, redirectUrl: 'agent.html' });
    if (customer) return res.json({ success: true, redirectUrl: 'customer.html' });
    res.json({ success: false, message: 'Invalid Credentials!' });
});

app.get('/api/admin/all-data', async (req, res) => {
    const agents = await Agent.find({});
    const customers = await Customer.find({});
    res.json({ agents, customers });
});

app.post('/api/add-bank', async (req, res) => {
    const { email, bankName, accHolder, accNumber, ifsc } = req.body;
    await Agent.findOneAndUpdate({ $or: [{email}, {mobile: email}] }, { bankDetails: { bankName, accHolder, accNumber, ifsc } });
    res.json({ success: true, message: "Bank Details Updated!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
