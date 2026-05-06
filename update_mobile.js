const fs = require('fs');

const files = ['index.html', 'login.html'];
let updated = false;

for (const file of files) {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        
        if (html.includes('placeholder="Mobile Number"')) {
            console.log(`✅ Mobile Number pehle se hi ${file} me add hai!`);
            updated = true;
            continue;
        }

        const passRegex = /<input([^>]*?)placeholder="Create Password"([^>]*?)>/i;
        const match = html.match(passRegex);
        
        if (match) {
            const classMatch = match[0].match(/class="([^"]+)"/);
            const classString = classMatch ? classMatch[0] : 'class="w-full bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-xl mb-3"';
            
            const mobileInput = `<input id="mobileNumber" type="tel" name="mobile" placeholder="Mobile Number" ${classString} required>\n`;
            
            html = html.replace(passRegex, mobileInput + match[0]);
            
            fs.writeFileSync(file, html);
            console.log(`🎉 SUCCESS: ${file} me Mobile Number box perfect design ke sath add ho gaya!`);
            updated = true;
        }
    }
}

if (!updated) {
    console.log("❌ Error: File nahi mili ya 'Create Password' wala box nahi mila.");
}
