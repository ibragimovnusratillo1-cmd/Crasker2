// db.js — Simple JSON file database helper
const fs   = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'db.json');

function read() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

module.exports = { read, write, nextId };
