#!/usr/bin/env node
// API Test-Script - Testen ohne Display

const axios = require('axios');

const STATION_ID = "900009101"; // Amrumer Straße
const API_URL = `https://v6.vbb.transport.rest/stops/${STATION_ID}/departures`;

async function testAPI() {
    console.log("=".repeat(50));
    console.log("U-Bahn API Test");
    console.log("=".repeat(50));
    console.log("");
    console.log(`Station ID: ${STATION_ID}`);
    console.log(`API URL: ${API_URL}`);
    console.log("");
    
    try {
        console.log("Fetching departures...");
        const response = await axios.get(`${API_URL}?duration=60&results=50`, {
            timeout: 10000
        });
        
        const data = response.data;
        let departures = [];
        
        // Handle different API response formats
        if (typeof data === 'object' && data.departures) {
            departures = data.departures;
        } else if (Array.isArray(data)) {
            departures = data;
        }
        
        console.log(`✓ Received ${departures.length} departures`);
        console.log("");
        
        // Filter U9
        const u9 = departures.filter(d => d.line?.name === 'U9');
        console.log(`U9 Departures: ${u9.length}`);
        console.log("");
        
        // Split by direction
        const osloer = u9.filter(d => d.direction?.includes('Osloer'));
        const steglitz = u9.filter(d => 
            d.direction?.includes('Steglitz') || d.direction?.includes('Rathaus')
        );
        
        console.log("─".repeat(50));
        console.log("→ Osloer Str.");
        console.log("─".repeat(50));
        osloer.slice(0, 3).forEach((dep, i) => {
            const when = new Date(dep.when);
            const now = new Date();
            const mins = Math.floor((when - now) / 1000 / 60);
            console.log(`  ${i + 1}. U9 in ${mins} min (${when.toLocaleTimeString('de-DE')})`);
        });
        
        console.log("");
        console.log("─".repeat(50));
        console.log("→ Rathaus Steglitz");
        console.log("─".repeat(50));
        steglitz.slice(0, 3).forEach((dep, i) => {
            const when = new Date(dep.when);
            const now = new Date();
            const mins = Math.floor((when - now) / 1000 / 60);
            console.log(`  ${i + 1}. U9 in ${mins} min (${when.toLocaleTimeString('de-DE')})`);
        });
        
        console.log("");
        console.log("=".repeat(50));
        console.log("✓ API Test erfolgreich!");
        console.log("=".repeat(50));
        
    } catch (error) {
        console.error("");
        console.error("✗ API Test fehlgeschlagen!");
        console.error("");
        
        if (error.code === 'ENOTFOUND') {
            console.error("Fehler: Keine Internetverbindung");
        } else if (error.code === 'ETIMEDOUT') {
            console.error("Fehler: Timeout - API antwortet nicht");
        } else {
            console.error(`Fehler: ${error.message}`);
        }
        
        console.error("");
        process.exit(1);
    }
}

// Run test
testAPI();
