#!/usr/bin/env node
// -*- coding: utf-8 -*-
// U-Bahn Anzeige – angepasst für 480x360 (BGRA8888)

const axios = require("axios");
const fs = require("fs");
const { createCanvas, registerFont } = require("canvas");

// ---- Konfiguration ----
let config = {
	device: "/dev/fb0",
	format: "BGRA8888",
	width: 480,
	height: 360
};

try {
	if (fs.existsSync("display_config.json")) {
		const savedConfig = JSON.parse(fs.readFileSync("display_config.json", "utf8"));
		config = { ...config, ...savedConfig };
		console.log("✓ Display-Konfiguration geladen");
	} else {
		console.log("! Keine display_config.json gefunden, nutze Defaults");
	}
} catch (e) {
	console.log("! Fehler beim Laden der Config:", e.message);
}

// Die Stations ID findest du unter
// "https://v6.vbb.transport.rest/locations?query=U_amrummer_stra%C3%9Fe&results=1"
// Das ist für die Amrumer Straße. Siehe hier:      ^^^^^^^^^^^^^
const STATION_ID = "900009101";

const API_URL = `https://v6.vbb.transport.rest/stops/${STATION_ID}/departures`;

const FB_DEVICE = config.device;
const WIDTH = config.width;
const HEIGHT = config.height;
const FORMAT = config.format;

// Farben
const BG = { r: 45, g: 55, b: 70 };
const YELLOW = { r: 255, g: 220, b: 0 };
const U9_ORANGE = { r: 255, g: 110, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };
const GRAY = { r: 130, g: 130, b: 130 };

console.log("\n╔═══════════════════════════════════════════╗");
console.log("║      U-BAHN ANZEIGE AMRUMER STR.        ║");
console.log("╚═══════════════════════════════════════════╝\n");

console.log(`Device: ${FB_DEVICE}`);
console.log(`Format: ${FORMAT}`);
console.log(`Auflösung: ${WIDTH}x${HEIGHT}\n`);

function log(level, message) {
	const timestamp = new Date().toISOString();
	console.log(`${timestamp} ${level}: ${message}`);
}

class Display {
	constructor() {
		log("INFO", "Display init gestartet");
		this.departures_cache = [];
		this.running = true;
		this.fb = null;
		this.draw_count = 0;

		process.stdout.write("\x1B[?25l"); // Cursor ausblenden

		try {
			registerFont("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", { family: "DejaVuSans" });
			log("INFO", "Font geladen");
		} catch (e) {
			log("WARNING", `Font-Fehler: ${e.message}`);
		}

		this.openFramebuffer();

		process.on("SIGTERM", () => this.onSignal("SIGTERM"));
		process.on("SIGINT", () => this.onSignal("SIGINT"));

		this.startApiLoop();
	}

	openFramebuffer() {
		try {
			if (!fs.existsSync(FB_DEVICE)) {
				log("ERROR", `${FB_DEVICE} existiert nicht!`);
				return;
			}
			this.fb = fs.openSync(FB_DEVICE, "r+");
			log("INFO", `Framebuffer geöffnet: ${FB_DEVICE}`);

			const clearBuf = Buffer.alloc(WIDTH * HEIGHT * 4);
			for (let i = 0; i < WIDTH * HEIGHT; i++) {
				const offset = i * 4;
				clearBuf[offset] = BG.b;
				clearBuf[offset + 1] = BG.g;
				clearBuf[offset + 2] = BG.r;
				clearBuf[offset + 3] = 255;
			}
			fs.writeSync(this.fb, clearBuf, 0, clearBuf.length, 0);
			log("INFO", "Display bereit");
		} catch (e) {
			log("ERROR", `Framebuffer-Fehler: ${e.message}`);
			if (e.code === "EACCES") log("ERROR", `Lösung: sudo chmod 666 ${FB_DEVICE}`);
		}
	}

	onSignal(signum) {
		log("INFO", `Signal ${signum} empfangen, beende...`);
		this.running = false;
		process.stdout.write("\x1B[?25h");
		if (this.fb !== null) fs.closeSync(this.fb);
		process.exit(0);
	}

	startApiLoop() {
		const fetchData = async () => {
			if (!this.running) return;
			try {
				const response = await axios.get(`${API_URL}?duration=60&results=50`, { timeout: 10000 });
				const data = response.data;
				let u9 = [];

				if (data?.departures) u9 = data.departures.filter(d => d.line?.name === "U9");
				else if (Array.isArray(data)) u9 = data.filter(d => d.line?.name === "U9");

				this.departures_cache = u9;
				log("INFO", `API-Update: ${u9.length} U9-Bahnen`);
			} catch (e) {
				log("WARNING", `API-Fehler: ${e.message}`);
			}
		};

		fetchData();
		setInterval(fetchData, 20000);
	}

	mins(when) {
		try {
			let whenStr = when;
			if (whenStr.endsWith("Z")) whenStr = whenStr.slice(0, -1) + "+00:00";
			const dep = new Date(whenStr);
			const diff = (dep - new Date()) / 60000;
			return diff >= 0.5 ? String(Math.floor(diff)) : "0";
		} catch {
			return "--";
		}
	}

	roundRect(ctx, x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
		ctx.fill();
	}

draw() {
    if (!this.fb) return;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Hintergrund
    ctx.fillStyle = `rgb(${BG.r},${BG.g},${BG.b})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header
    ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
    ctx.fillRect(0, 0, WIDTH, 70);

    // --- U-Bahn Symbol (blau mit weißem U) ---
    const uBoxX = 15;
    const uBoxY = 10;
    const uBoxSize = 50;

    // Hintergrund des Symbols (blau)
    ctx.fillStyle = "rgb(0, 80, 160)";
    this.roundRect(ctx, uBoxX, uBoxY, uBoxSize, uBoxSize, 6);

    // Buchstabe „U“ mittig & weiß
    ctx.fillStyle = "white";
    ctx.font = "bold 38px DejaVuSans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("U", uBoxX + uBoxSize / 2, uBoxY + uBoxSize / 2 + 2);

    // Stationsname rechts neben dem Symbol
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = `rgb(${BG.r},${BG.g},${BG.b})`;
    ctx.font = "bold 28px DejaVuSans";
    ctx.fillText("Amrumer Straße", uBoxX + uBoxSize + 25, 50);

    // Uhrzeit
    const now = new Date().toTimeString().slice(0, 5);
    ctx.font = "bold 26px DejaVuSans";
    ctx.fillText(now, WIDTH - 90, 50);

    // --- Abfahrten ---
    const deps = [...this.departures_cache];
    const osloer = deps.filter(x => x.direction?.includes("Osloer")).slice(0, 2);
    const steglitz = deps.filter(x => x.direction?.includes("Steglitz") || x.direction?.includes("Rathaus")).slice(0, 2);

    // Verschiebung nach unten
    const offsetY = 120;

    // Abschnitt Osloer
    ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
    ctx.font = "bold 26px DejaVuSans";
    ctx.fillText("→ Osloer Straße", 15, offsetY);

    if (osloer.length) {
        const mins = this.mins(osloer[0].when);
        ctx.fillStyle = `rgb(${WHITE.r},${WHITE.g},${WHITE.b})`;
        this.roundRect(ctx, 15, offsetY + 10, 75, 45, 6);
        ctx.fillStyle = `rgb(${U9_ORANGE.r},${U9_ORANGE.g},${U9_ORANGE.b})`;
        this.roundRect(ctx, 18, offsetY + 13, 69, 39, 5);
        ctx.fillStyle = `rgb(${WHITE.r},${WHITE.g},${WHITE.b})`;
        ctx.font = "bold 32px DejaVuSans";
        ctx.fillText("U9", 25, offsetY + 45);

        ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
        ctx.font = "bold 52px DejaVuSans";
        ctx.fillText(mins, WIDTH - 145, offsetY + 45);
        ctx.fillStyle = `rgb(${WHITE.r},${WHITE.g},${WHITE.b})`;
        ctx.font = "bold 36px DejaVuSans";
        ctx.fillText("min", WIDTH - 85, offsetY + 45);
    }

    if (osloer.length >= 2) {
        const mins2 = this.mins(osloer[1].when);
        ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
        ctx.font = "bold 36px DejaVuSans";
        ctx.fillText(mins2, WIDTH - 125, offsetY + 80);
        ctx.fillStyle = `rgb(${GRAY.r},${GRAY.g},${GRAY.b})`;
        ctx.font = "bold 24px DejaVuSans";
        ctx.fillText("min", WIDTH - 85, offsetY + 80);
    }

    // Trennlinie
    ctx.strokeStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, offsetY + 100);
    ctx.lineTo(WIDTH - 10, offsetY + 100);
    ctx.stroke();

    // Abschnitt Steglitz
    ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
    ctx.font = "bold 26px DejaVuSans";
    ctx.fillText("→ Rathaus Steglitz", 15, offsetY + 130);

    if (steglitz.length) {
        const mins = this.mins(steglitz[0].when);
        ctx.fillStyle = `rgb(${WHITE.r},${WHITE.g},${WHITE.b})`;
        this.roundRect(ctx, 15, offsetY + 140, 75, 45, 6);
        ctx.fillStyle = `rgb(${U9_ORANGE.r},${U9_ORANGE.g},${U9_ORANGE.b})`;
        this.roundRect(ctx, 18, offsetY + 143, 69, 39, 5);
        ctx.fillStyle = `rgb(${WHITE.r},${WHITE.g},${WHITE.b})`;
        ctx.font = "bold 32px DejaVuSans";
        ctx.fillText("U9", 25, offsetY + 175);

        ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
        ctx.font = "bold 52px DejaVuSans";
        ctx.fillText(mins, WIDTH - 145, offsetY + 175);
        ctx.fillStyle = `rgb(${WHITE.r},${WHITE.g},${WHITE.b})`;
        ctx.font = "bold 36px DejaVuSans";
        ctx.fillText("min", WIDTH - 85, offsetY + 175);
    }

    if (steglitz.length >= 2) {
        const mins2 = this.mins(steglitz[1].when);
        ctx.fillStyle = `rgb(${YELLOW.r},${YELLOW.g},${YELLOW.b})`;
        ctx.font = "bold 36px DejaVuSans";
        ctx.fillText(mins2, WIDTH - 125, offsetY + 210);
        ctx.fillStyle = `rgb(${GRAY.r},${GRAY.g},${GRAY.b})`;
        ctx.font = "bold 24px DejaVuSans";
        ctx.fillText("min", WIDTH - 85, offsetY + 210);
    }

    this.write(canvas);
}

	write(canvas) {
		if (!this.fb) return;
		const ctx = canvas.getContext("2d");
		const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
		const buffer = Buffer.alloc(WIDTH * HEIGHT * 4);
		for (let i = 0; i < WIDTH * HEIGHT; i++) {
			const s = i * 4;
			buffer[s] = img.data[s + 2]; // BGRA
			buffer[s + 1] = img.data[s + 1];
			buffer[s + 2] = img.data[s];
			buffer[s + 3] = img.data[s + 3];
		}
		fs.writeSync(this.fb, buffer, 0, buffer.length, 0);
	}

	run() {
		const loop = () => {
			if (!this.running) return;
			this.draw();
			setTimeout(loop, 1000);
		};
		loop();
	}
}

// Main
if (require.main === module) {
	const disp = new Display();
	disp.run();
}
