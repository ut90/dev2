const fs = require('fs');
const path = require('path');

const testFiles = [
  'book.test.js',
  'user.test.js',
  'lending.test.js',
  'auth.test.js'
];

const pattern = /'Bearer valid_token'/g;
const replacement = '`Bearer ${validToken}`';

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('const { validToken }')) {
    content = content.replace(
      /const request = require\('supertest'\);/,
      "const request = require('supertest');\nconst { validToken } = require('./setup');"
    );
  }
  
  content = content.replace(pattern, replacement);
  
  fs.writeFileSync(filePath, content);
  
  console.log(`Updated ${file}`);
});

console.log('All test files updated successfully!');
