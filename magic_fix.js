const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = "mongodb+srv://Mohitbhai0580:Mohit%400580@cluster0.854fydd.mongodb.net/mtef_db?appName=Cluster0";

async function fixEverything() {
    try {
        console.log("⏳ 1. Database se purana kharab data saaf kar rahe hain...");
        await mongoose.connect(MONGO_URI);
        await mongoose.connection.db.collection('customers').deleteMany({});
        await mongoose.connection.db.collection('agents').deleteMany({});
        console.log("✅ Database ekdum Clean ho gaya!");

        console.log("⏳ 2. index.html me V3 Bulletproof Engine laga rahe hain...");
        let html = fs.readFileSync('index.html', 'utf8');
        
        // Purana engine hatao
        const marker = '// 🚀 MTEF LIVE REGISTRATION ENGINE';
        if(html.includes(marker)) {
            const scriptStart = html.lastIndexOf('<script>', html.indexOf(marker));
            const scriptEnd = html.indexOf('</script>', scriptStart) + 9;
            html = html.substring(0, scriptStart) + html.substring(scriptEnd);
        }

        // Naya V3 Engine lagao
        const newScript = `\n<script>
        ${marker} (V3 - Bulletproof Scanner)
        async function handleRegistration(event) {
            event.preventDefault();
            let fullName = '', email = '', mobile = '', password = '';
            
            document.querySelectorAll('input').forEach(inp => {
                const val = inp.value.trim();
                if (!val) return; 
                const p = (inp.placeholder || '').toLowerCase();
                const n = (inp.name || '').toLowerCase();
                const t = (inp.type || '').toLowerCase();
                const id = (inp.id || '').toLowerCase();
                
                if(p.includes('name') || n.includes('name') || id.includes('name') || p.includes('naam')) fullName = val;
                if(p.includes('email') || n.includes('email') || t === 'email' || id.includes('email')) email = val;
                if(p.includes('mobile') || p.includes('phone') || n.includes('number') || t === 'tel' || id.includes('mobile')) mobile = val;
                if(p.includes('password') || t === 'password' || id.includes('password')) password = val;
            });
            
            let accountType = 'Customer'; 
            const agentRadio = document.querySelector('input[value="Agent"]');
            if (agentRadio && agentRadio.checked) accountType = 'Agent';

            if(!fullName || !email || !password) {
                alert('Please fill Name, Email, and Password properly!');
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
                alert('DB Connection Error!');
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('button').forEach(btn => {
                const text = btn.innerText.toLowerCase();
                if(text.includes('create') || text.includes('sign up') || text.includes('register')) {
                    btn.addEventListener('click', handleRegistration);
                }
            });
        });
        </script>\n`;

        html = html.replace(/<\/body>/i, newScript + '</body>');
        fs.writeFileSync('index.html', html);
        console.log("✅ V3 Engine set ho gaya!");
        console.log("🎉 ALL DONE! Ab aap server chalu kar sakte hain.");
        process.exit(0);
    } catch(e) {
        console.log("❌ Error:", e);
        process.exit(1);
    }
}

fixEverything();
