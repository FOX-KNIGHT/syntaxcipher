const fs = require('fs');
const files = [
  'README.md', 'docker-compose.yml', 
  'backend/package.json', 'backend/server.js', 'backend/schema.sql',
  'frontend/package.json', 'frontend/index.html',
  'frontend/src/pages/Login.jsx', 'frontend/src/pages/Projector.jsx',
  'frontend/src/pages/JudgePanel.jsx', 'frontend/src/components/UI.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/ZerOne/g, 'SyntaxCipher');
    content = content.replace(/Zerone/g, 'SyntaxCipher');
    content = content.replace(/zerone/g, 'syntaxcipher');
    content = content.replace(/ZERONE/g, 'SYNTAXCIPHER');
    fs.writeFileSync(f, content);
    console.log(`Updated ${f}`);
  }
});
