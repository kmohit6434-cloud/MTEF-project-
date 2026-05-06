const fs = require('fs');

const file = 'index.html';
let html = fs.readFileSync(file, 'utf8');

const scriptToInject = `
<script>
// 🚀 MTEF LIVE REGISTRATION ENGINE
async function handleRegistration(event) {
    event.preventDefault(); // पेज को रिफ्रेश होने से रोकना
    
    // फॉर्म के बॉक्स (Inputs) ढूँढना
    const getVal = (ph) => {
        const el = document.querySelector(\`input[placeholder*="\${ph}"]\`);
        return el ? el.value : '';
    };
    
    const fullName = getVal('Name') || getVal('Full Name');
    const email = getVal('Email');
    const mobile = document.getElementById('mobileNumber') ? document.getElementById('mobileNumber').value : getVal('Mobile');
    const password = getVal('Password');
    
    // अकाउंट टाइप ढूँढना (Agent या Customer)
    let accountType = 'Customer'; 
    const agentRadio = document.querySelector('input[value="Agent"]');
    if (agentRadio && agentRadio.checked) accountType = 'Agent';

    if(!fullName || !email || !password) {
        alert('⚠️ Please fill all details!');
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, mobile, password, accountType })
        });
        const data = await res.json();
        
        alert(data.message); // Success Message
        
        if(data.success) {
            // रजिस्ट्रेशन के बाद सीधे डैशबोर्ड पर भेजें
            window.location.href = accountType === 'Agent' ? 'agent.html' : 'customer.html';
        }
    } catch(e) {
        alert('❌ Database Server se connection nahi ho paya!');
    }
}

// 'Create Account' बटन में इंजन फिट करना
window.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        const text = btn.innerText.toLowerCase();
        if(text.includes('create account') || text.includes('sign up') || text.includes('register')) {
            btn.onclick = handleRegistration;
        }
    });
});
</script>
`;

if (!html.includes('handleRegistration')) {
    html = html.replace('</body>', scriptToInject + '\n</body>');
    fs.writeFileSync(file, html);
    console.log("✅ BOOM! Registration Logic is successfully injected into index.html!");
} else {
    console.log("⚠️ Logic is already there in index.html!");
}
