const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Purana engine hatao
const marker = '// 🚀 MTEF LIVE REGISTRATION ENGINE';
if(html.includes(marker)) {
    const scriptStart = html.lastIndexOf('<script>', html.indexOf(marker));
    const scriptEnd = html.indexOf('</script>', scriptStart) + 9;
    html = html.substring(0, scriptStart) + html.substring(scriptEnd);
}

// Naya Smart Engine lagao
const newScript = `\n<script>
${marker} (V2 - Smart Scanner)
async function handleRegistration(event) {
    event.preventDefault();
    
    let fullName = '', email = '', mobile = '', password = '';
    
    // Smart Scanner: Box ke naam, type ya placeholder sab jagah check karega
    document.querySelectorAll('input').forEach(inp => {
        const p = (inp.placeholder || '').toLowerCase();
        const n = (inp.name || '').toLowerCase();
        const t = (inp.type || '').toLowerCase();
        
        if(p.includes('name') || n.includes('name') || p.includes('naam')) fullName = inp.value;
        if(p.includes('email') || n.includes('email') || t === 'email') email = inp.value;
        if(p.includes('mobile') || p.includes('phone') || n.includes('number') || t === 'tel') mobile = inp.value;
        if(p.includes('password') || t === 'password') password = inp.value;
    });
    
    let accountType = 'Customer'; 
    const agentRadio = document.querySelector('input[value="Agent"]');
    if (agentRadio && agentRadio.checked) accountType = 'Agent';

    if(!fullName || !email || !password) {
        alert('⚠️ Please fill Name, Email, and Password properly!');
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, mobile, password, accountType })
        });
        const data = await res.json();
        alert(data.message);
        if(data.success) {
            window.location.href = accountType === 'Agent' ? 'agent.html' : 'customer.html';
        }
    } catch(e) {
        alert('❌ DB Connection Error!');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        if(text.includes('create account') || text.includes('sign up') || text.includes('register')) {
            btn.onclick = handleRegistration;
        }
    });
});
</script>\n`;

html = html.replace(/<\/body>/i, newScript + '</body>');
fs.writeFileSync('index.html', html);
console.log("✅ Super-Scanner script fixed in index.html!");
