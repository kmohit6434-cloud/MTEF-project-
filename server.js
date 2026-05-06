const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 1. ASLI MONGODB CONNECTION
const MONGO_URI = "mongodb+srv://Mohitbhai0580:Mohit%400580@cluster0.854fydd.mongodb.net/mtef_db?appName=Cluster0"; 
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MTEF Mega-Database Connected!'))
    .catch(err => console.log('❌ DB Connection Error:', err));

const agentSchema = new mongoose.Schema({ agentId: String, name: String, email: String, phone: String, password: String, balance: { type: Number, default: 0 }, totalEarnings: { type: Number, default: 0 }, leadsConverted: { type: Number, default: 0 }, status: { type: String, default: 'Active' }, joinedAt: { type: Date, default: Date.now } });
const customerSchema = new mongoose.Schema({ customerId: String, name: String, email: String, phone: String, password: String, assignedAgent: { type: String, default: 'Unassigned' }, status: { type: String, default: 'Active' }, joinedAt: { type: Date, default: Date.now } });
const leadSchema = new mongoose.Schema({ name: String, phone: String, source: String, assignedAgent: { type: String, default: 'Unassigned' }, status: { type: String, default: 'New' }, createdAt: { type: Date, default: Date.now } });
const withdrawSchema = new mongoose.Schema({ agentId: String, amount: Number, method: String, status: { type: String, default: 'Pending' }, requestDate: { type: Date, default: Date.now } });
const messageSchema = new mongoose.Schema({ recipientId: String, title: String, body: String, sentAt: { type: Date, default: Date.now } });

const Agent = mongoose.model('Agent', agentSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Lead = mongoose.model('Lead', leadSchema);
const Withdraw = mongoose.model('Withdraw', withdrawSchema);
const Message = mongoose.model('Message', messageSchema);

app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, mobile, password, accountType } = req.body;
        const agentExists = await Agent.findOne({ email });
        const custExists = await Customer.findOne({ email });
        if(agentExists || custExists) return res.json({ success: false, message: "Email is already registered!" });
        if(accountType === 'Agent') {
            const newAgent = new Agent({ agentId: 'AGT-' + Math.floor(1000 + Math.random() * 9000), name: fullName, email, phone: mobile, password }); await newAgent.save();
        } else {
            const newCustomer = new Customer({ customerId: 'CUST-' + Math.floor(1000 + Math.random() * 9000), name: fullName, email, phone: mobile, password }); await newCustomer.save();
        }
        res.json({ success: true, message: `Welcome ${fullName}! Account created successfully.` });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const totalAgents = await Agent.countDocuments(); const totalCustomers = await Customer.countDocuments();
        const pendingWithdrawals = await Withdraw.countDocuments({ status: 'Pending' });
        const agents = await Agent.find(); const totalEarnings = agents.reduce((sum, agent) => sum + agent.totalEarnings, 0);
        res.json({ success: true, data: { totalAgents, totalCustomers, totalEarnings, pendingWithdrawals } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// 🚀 NEW: GET CUSTOMERS LIST
app.get('/api/customers', async (req, res) => {
    try { const customers = await Customer.find().sort({ joinedAt: -1 }); res.json({ success: true, data: customers }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// 🚀 NEW: GET AGENTS LIST
app.get('/api/agents', async (req, res) => {
    try { const agents = await Agent.find().sort({ joinedAt: -1 }); res.json({ success: true, data: agents }); }
    catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/add-lead', async (req, res) => { try { const newLead = new Lead(req.body); await newLead.save(); res.json({ success: true, message: "New Lead Added Successfully!" }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } });
app.post('/api/approve-withdraw', async (req, res) => { try { const { requestId, action } = req.body; const request = await Withdraw.findById(requestId); if(!request) return res.json({ success: false, message: "Request not found!" }); if (action === 'Approve') { request.status = 'Approved'; await Agent.findOneAndUpdate({ agentId: request.agentId }, { $inc: { balance: -request.amount } }); } else { request.status = 'Rejected'; } await request.save(); res.json({ success: true, message: `Withdrawal ${action}d successfully!` }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } });
app.post('/api/send-message', async (req, res) => { try { const newMessage = new Message(req.body); await newMessage.save(); res.json({ success: true, message: "Message Sent Successfully!" }); } catch (err) { res.status(500).json({ success: false, message: err.message }); } });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MTEF Mega-Backend Live on Port ${PORT}`));
