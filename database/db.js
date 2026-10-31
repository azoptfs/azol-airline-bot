// 📁 database/db.js
const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../storage.json');

// Initialize internal memory structures
let manifests = new Map();
let quotas = new Map();
let backups = new Map();

// Save state to disk
function saveToDisk() {
    const data = {
        manifests: Array.from(manifests.entries()),
        quotas: Array.from(quotas.entries()),
        backups: Array.from(backups.entries())
    };
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8');
}

// Load state from disk
function loadFromDisk() {
    if (!fs.existsSync(storagePath)) return;
    try {
        const raw = fs.readFileSync(storagePath, 'utf8');
        const data = JSON.parse(raw);
        if (data.manifests) manifests = new Map(data.manifests);
        if (data.quotas) quotas = new Map(data.quotas);
        if (data.backups) backups = new Map(data.backups);
    } catch (e) {
        console.error("❌ Failed to parse storage.json, starting fresh memory:", e);
    }
}

function getOrCreateUser(userId) {
    if (!quotas.has(userId)) {
        quotas.set(userId, { flightsAttended: 0, strikes: 0, passedThisWeek: false });
        saveToDisk();
    }
    return quotas.get(userId);
}

// Initial load on startup
loadFromDisk();

module.exports = { 
    manifests, 
    quotas, 
    backups, 
    getOrCreateUser,
    saveToDisk // Call this function in your commands whenever you change user data!
};
