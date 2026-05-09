const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('./'));

const mongoURI = process.env.MONGODB_URI;

// 🛑 SCHEMA UPDATED: Agent tracking & Project tracking added
const UserSchema = new mongoose.Schema({
    fullName: String, mobile: String, password: String, accountType: String, userId: String,
    bankDetails: { bankName: String, accHolder: String, accNumber: String, ifsc: String },
    projectData: {
        progress: { type: Number, default: 0 },
        advancePaid: { type: Number, default: 0 },
        balanceDue: { type: Number, default: 0 },
        dueDate: { type: String, default: 'Under Process' },
        statusText: { type: String, default: 'Pending Initiation' },
        serviceName: { type: String, default: 'Not Assigned' }
    },
    agentData: {
        earnings: { type: Number, default: 0 },
        leadsCount: { type: Number, default: 0 },
        status: { type: String, default: 'Active' }
    }
});
const Customer = mongoose.model('Customer', UserSchema, 'customers');
const Agent = mongoose.model('Agent', UserSchema, 'agents');

mongoose.connect(mongoURI).then(async () => {
    console.log('✅ Connected to MongoDB');
    const exists = await Customer.findOne({ mobile: '7891769227' });
    if (!exists) await new Customer({ fullName: 'Mohit', mobile: '7891769227', password: '0580', accountType: 'Customer', userId: 'MTEF@6866' }).save();
}).catch(e => console.log(e));

app.post('/api/send-otp', async (req, res) => { res.json({ success: true, message: "OTP Bypassed for now" }); });

app.post('/api/register', async (req, res) => {
    const { fullName, mobile, password, accountType } = req.body;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const userId = accountType === 'Agent' ? `MTEF${randomDigits}` : `MTEF@${randomDigits}`;
    const Model = accountType === 'Agent' ? Agent : Customer;
    await new Model({ fullName, mobile, password, accountType, userId }).save();
    res.json({ success: true, message: `Registration Done! ID: ${userId}` });
});

app.post('/api/admin/create-user', async (req, res) => {
    try {
        const { fullName, mobile, password, accountType } = req.body;
        const exists = await Customer.findOne({ mobile }) || await Agent.findOne({ mobile });
        if (exists) return res.json({ success: false, message: 'Mobile already registered!' });
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const userId = accountType === 'Agent' ? `MTEF${randomDigits}` : `MTEF@${randomDigits}`;
        const Model = accountType === 'Agent' ? Agent : Customer;
        await new Model({ fullName, mobile, password, accountType, userId }).save();
        res.json({ success: true, message: `Account Created! ID: ${userId}` });
    } catch (err) { res.json({ success: false, message: 'Server Error' }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "MTEF@0580" && password === "Aarav@divyansh@0580") return res.json({ success: true, redirectUrl: 'admin_dashboard.html', isAdmin: true });
    
    const agent = await Agent.findOne({ mobile: email, password });
    const customer = await Customer.findOne({ mobile: email, password });
    
    if (agent) return res.json({ success: true, redirectUrl: 'agent.html', isAdmin: false, userName: agent.fullName, userId: agent.userId, mobile: agent.mobile });
    if (customer) return res.json({ success: true, redirectUrl: 'customer.html', isAdmin: false, userName: customer.fullName, userId: customer.userId, mobile: customer.mobile });
    res.json({ success: false, message: 'Invalid Credentials!' });
});

// 👑 ADMIN API: Update Customer Project
app.post('/api/admin/update-project', async (req, res) => {
    const { mobile, progress, advancePaid, balanceDue, dueDate, statusText, serviceName } = req.body;
    await Customer.findOneAndUpdate({ mobile }, { projectData: { progress, advancePaid, balanceDue, dueDate, statusText, serviceName } });
    res.json({ success: true, message: "Project Data Updated Live!" });
});

// 👑 ADMIN API: Update Agent Data
app.post('/api/admin/update-agent', async (req, res) => {
    const { mobile, earnings, leadsCount, status } = req.body;
    await Agent.findOneAndUpdate({ mobile }, { agentData: { earnings, leadsCount, status } });
    res.json({ success: true, message: "Agent Data Updated Live!" });
});

app.post('/api/get-user', async (req, res) => {
    const { mobile, type } = req.body;
    const Model = type === 'Agent' ? Agent : Customer;
    const user = await Model.findOne({ mobile });
    if(user) res.json({ success: true, user }); else res.json({ success: false });
});

app.post('/api/change-password', async (req, res) => {
    const { mobile, oldPass, newPass } = req.body;
    const user = await Customer.findOne({ mobile, password: oldPass }) || await Agent.findOne({ mobile, password: oldPass });
    if(!user) return res.json({ success: false, message: "Incorrect Old Password!" });
    user.password = newPass; await user.save();
    res.json({ success: true, message: "Password Changed Successfully!" });
});

app.get('/api/admin/all-data', async (req, res) => {
    const agents = await Agent.find({});
    const customers = await Customer.find({});
    res.json({ agents, customers });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
