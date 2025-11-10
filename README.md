# 🚇 Berliner U-Bahn Anzeige für Raspberry Pi

Eine authentische Berliner U-Bahn Bahnsteiganzeige für den **Raspberry Pi 3B** mit **joy-it RB-TFT3.2V2** Display (480x360). Zeigt Echtzeit-Abfahrten der **U9** an der Station **Amrumer Straße**.

![U-Bahn Anzeige](https://img.shields.io/badge/U--Bahn-U9-orange?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNTBBMCIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5VPC90ZXh0Pgo8L3N2Zz4K)
![Station](https://img.shields.io/badge/Station-Amrumer_Straße-yellow?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Raspberry_Pi_3B-c51a4a?style=for-the-badge&logo=raspberry-pi)

---

## 📸 Screenshot

```
┌─────────────────────────────────────────────────────┐
│ 🔵 U  Amrumer Straße                   14:23       │ ← Gelber Header
├─────────────────────────────────────────────────────┤
│                                                     │
│ → Osloer Straße                                     │
│  🟧 U9                   5  min                     │ ← Orange U9-Badge
│                          8  min                     │
│                                                     │
│ ─────────────────────────────────────────────────── │
│                                                     │
│ → Rathaus Steglitz                                  │
│  🟧 U9                   3  min                     │
│                         12  min                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Features

- ✅ **Echtzeit-Daten** über VBB REST API
- ✅ **U9-spezifisch** für Amrumer Straße
- ✅ **Beide Richtungen**: Osloer Straße ↔ Rathaus Steglitz
- ✅ **Authentisches BVG-Design** mit U-Bahn Symbol
- ✅ **Autostart** via systemd Service
- ✅ **Dynamische Display-Konfiguration** mit `display_config.json`
- ✅ **480x360 Auflösung** optimiert für joy-it TFT Display
- ✅ **Node.js basiert** - schnell und ressourcenschonend

---

## 🔧 Hardware-Anforderungen

| Komponente | Beschreibung |
|------------|--------------|
| **Raspberry Pi** | Raspberry Pi 3B (oder neuer) |
| **Display** | joy-it RB-TFT3.2V2 (480x360, BGRA8888) |
| **OS** | Raspberry Pi OS (Lite oder Desktop) |
| **Internet** | WLAN/Ethernet für API-Zugriff |

---

## 📦 Installation

### 1️⃣ System vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js und npm installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Git installieren
sudo apt install -y git

# Projekt klonen
git clone https://github.com/Serverlele30/rpi-ubahn.git
cd rpi-ubahn
```

### 2️⃣ Dependencies installieren

```bash
npm install
```

**Wichtig:** Falls `canvas` Build-Fehler auftreten:

```bash
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas --build-from-source
```

### 3️⃣ Display konfigurieren

Das Projekt enthält bereits eine `display_config.json`:

```json
{
  "device": "/dev/fb0",
  "format": "BGRA8888",
  "width": 480,
  "height": 360
}
```

**Display-Berechtigungen setzen:**

```bash
sudo chmod 666 /dev/fb0
```

---

## 🚀 Verwendung

### Manueller Start (Test)

```bash
node ubahn_anzeige.js
```

**Erwartete Ausgabe:**

```
╔═══════════════════════════════════════════╗
║      U-BAHN ANZEIGE AMRUMER STR.        ║
╚═══════════════════════════════════════════╝

Device: /dev/fb0
Format: BGRA8888
Auflösung: 480x360

✓ Display-Konfiguration geladen
2024-11-10T... INFO: Display init gestartet
2024-11-10T... INFO: Font geladen
2024-11-10T... INFO: Framebuffer geöffnet: /dev/fb0
2024-11-10T... INFO: Display bereit
2024-11-10T... INFO: API-Update: 12 U9-Bahnen
```

### API testen (ohne Display)

```bash
node test_api.js
```

Zeigt die nächsten U9-Abfahrten in der Konsole an.

---

## 🔄 Autostart einrichten

### systemd Service installieren

```bash
# Service-Datei kopieren
sudo cp ubahn-anzeige.service /etc/systemd/system/

# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable ubahn-anzeige.service
sudo systemctl start ubahn-anzeige.service
```

### Service verwalten

```bash
# Status prüfen
sudo systemctl status ubahn-anzeige

# Logs anzeigen
sudo journalctl -u ubahn-anzeige -f

# Neustarten
sudo systemctl restart ubahn-anzeige

# Stoppen
sudo systemctl stop ubahn-anzeige
```

---

## 📁 Projektstruktur

```
rpi-ubahn/
├── ubahn_anzeige.js           # Hauptprogramm
├── test_api.js                # API-Test-Script
├── package.json               # npm Dependencies
├── display_config.json        # Display-Konfiguration
├── ubahn-anzeige.service      # systemd Service-Datei
└── README.md                  # Diese Datei
```

### Datei-Beschreibungen

| Datei | Beschreibung |
|-------|--------------|
| `ubahn_anzeige.js` | Hauptprogramm - holt API-Daten und zeichnet Display |
| `test_api.js` | Test-Tool für VBB API ohne Display |
| `display_config.json` | Display-Einstellungen (Auflösung, Format, Device) |
| `ubahn-anzeige.service` | Systemd Service für Autostart |
| `package.json` | Node.js Abhängigkeiten (axios, canvas) |

---

## ⚙️ Konfiguration

### Station ändern

Im Code `ubahn_anzeige.js` die `STATION_ID` ändern:

```javascript
const STATION_ID = "900009101";  // Amrumer Straße
```

**Andere Stationen finden:**

```bash
# Beispiel: Alexanderplatz suchen
curl "https://v6.vbb.transport.rest/locations?query=Alexanderplatz&results=5"
```

### Display-Auflösung anpassen

In `display_config.json`:

```json
{
  "device": "/dev/fb0",
  "format": "BGRA8888",
  "width": 320,     ← Anpassen
  "height": 240     ← Anpassen
}
```

### Update-Intervall ändern

In `ubahn_anzeige.js` Zeile ~107:

```javascript
setInterval(fetchData, 20000);  // 20 Sekunden (20000ms)
```

---

## 🎨 Design-Details

### Farben (BVG-konform)

| Element | Farbe | RGB |
|---------|-------|-----|
| Hintergrund | Dunkelblau-Grau | `rgb(45, 55, 70)` |
| Header | BVG Gelb | `rgb(255, 220, 0)` |
| U9 Badge | Orange | `rgb(255, 110, 0)` |
| U-Symbol | Blau | `rgb(0, 80, 160)` |
| Text | Weiß | `rgb(255, 255, 255)` |

### Layout

- **Header (70px)**: U-Bahn Symbol + Stationsname + Uhrzeit
- **Richtung 1**: → Osloer Straße (2 Abfahrten)
- **Trennlinie**: Gelbe Linie
- **Richtung 2**: → Rathaus Steglitz (2 Abfahrten)

---

## 🌐 API-Details

### VBB REST API

- **Base URL**: `https://v6.vbb.transport.rest/`
- **Dokumentation**: [v6.vbb.transport.rest](https://v6.vbb.transport.rest/)
- **Endpoint**: `/stops/{id}/departures`
- **Parameter**:
  - `duration=60` - Abfahrten in nächsten 60 Minuten
  - `results=50` - Max. 50 Ergebnisse

**Beispiel-Request:**

```bash
curl "https://v6.vbb.transport.rest/stops/900009101/departures?duration=60"
```

---

## 🐛 Troubleshooting

### Problem: Display bleibt schwarz

**Lösung:**

```bash
# Framebuffer-Berechtigungen prüfen
ls -l /dev/fb0

# Berechtigungen setzen
sudo chmod 666 /dev/fb0

# Oder dauerhaft mit udev-Regel:
echo 'SUBSYSTEM=="graphics", KERNEL=="fb0", MODE="0666"' | sudo tee /etc/udev/rules.d/99-fbdev.rules
sudo udevadm control --reload-rules
```

### Problem: Canvas Build-Fehler

**Lösung:**

```bash
# Build-Tools installieren
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev

# Canvas neu kompilieren
npm rebuild canvas --build-from-source
```

### Problem: "Font nicht gefunden"

**Lösung:**

```bash
# DejaVu Fonts installieren
sudo apt install -y fonts-dejavu-core

# Font-Cache aktualisieren
fc-cache -fv
```

### Problem: API liefert keine Daten

**Prüfen:**

```bash
# Test-Script ausführen
node test_api.js

# Netzwerk prüfen
ping -c 4 v6.vbb.transport.rest

# API manuell testen
curl "https://v6.vbb.transport.rest/stops/900009101/departures?duration=60"
```

---

## 🔍 Logs analysieren

```bash
# Service-Logs (Live)
sudo journalctl -u ubahn-anzeige -f

# Letzte 50 Zeilen
sudo journalctl -u ubahn-anzeige -n 50

# Fehler filtern
sudo journalctl -u ubahn-anzeige -p err
```

---

## 📊 Performance

- **CPU-Nutzung**: ~5-10% (Raspberry Pi 3B)
- **RAM**: ~50-80 MB
- **API-Requests**: Alle 20 Sekunden
- **Display-Refresh**: Jede Sekunde

---

## 🤝 Beitragen

Beiträge sind herzlich willkommen! 🎉

1. **Fork** das Repository
2. **Clone** deinen Fork: `git clone https://github.com/DEIN-NAME/rpi-ubahn.git`
3. **Branch** erstellen: `git checkout -b feature/neue-funktion`
4. **Commit** Änderungen: `git commit -m "Neue Funktion hinzugefügt"`
5. **Push**: `git push origin feature/neue-funktion`
6. **Pull Request** öffnen

---

## 📝 TODO / Roadmap

- [ ] **Mehrere Linien** unterstützen (U1, U2, U3, etc.)
- [ ] **Stationswechsel** per GPIO-Button
- [ ] **Web-Interface** für Konfiguration
- [ ] **Störungsmeldungen** anzeigen
- [ ] **Nacht-Modus** (Display aus 23:00-05:00)
- [ ] **Warnung** bei Verspätungen
- [ ] **Historische Daten** / Statistiken
- [ ] **Docker-Support**

---

## 🏆 Features in Arbeit

### Geplante Updates

- **Multi-Station Support**: Wechsel zwischen mehreren Stationen
- **Touch-Support**: Touch-Bedienung auf dem Display
- **API-Caching**: Offline-Fallback bei API-Ausfall
- **Custom Themes**: Verschiedene Farbschemata

---

## 📜 Lizenz

**MIT License**

```
Copyright (c) 2024 Serverlele30

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Credits & Danksagungen

- **VBB API**: [v6.vbb.transport.rest](https://v6.vbb.transport.rest/) - Öffentliche Verkehrsdaten Berlin
- **Node Canvas**: [node-canvas](https://github.com/Automattic/node-canvas) - HTML5 Canvas für Node.js
- **joy-it**: [RB-TFT3.2V2](https://joy-it.net/en/products/RB-TFT3.2V2) - TFT Display Hardware
- **BVG**: Design inspiriert von echten Berliner U-Bahn Anzeigen

---

## 📞 Support & Kontakt

- **GitHub Issues**: [github.com/Serverlele30/rpi-ubahn/issues](https://github.com/Serverlele30/rpi-ubahn/issues)
- **Diskussionen**: [github.com/Serverlele30/rpi-ubahn/discussions](https://github.com/Serverlele30/rpi-ubahn/discussions)

---

## 🔗 Nützliche Links

| Link | Beschreibung |
|------|--------------|
| [VBB API Docs](https://v6.vbb.transport.rest/) | API-Dokumentation |
| [joy-it Display](https://joy-it.net/en/products/RB-TFT3.2V2) | Display-Dokumentation |
| [Raspberry Pi](https://www.raspberrypi.com/) | Offizielle Raspberry Pi Seite |
| [BVG](https://www.bvg.de/) | Berliner Verkehrsbetriebe |

---

## 🌟 Star History

Wenn dir dieses Projekt gefällt, gib ihm einen ⭐ auf GitHub!

---

## 📸 Galerie

### Real-Life Setup

*Füge hier Fotos von deinem Setup hinzu!*

### Display-Ansicht

```
╔════════════════════════════════════════════════╗
║  🔵 U  Amrumer Straße            14:23        ║
╠════════════════════════════════════════════════╣
║                                                ║
║  → Osloer Straße                               ║
║   🟧 U9              5 min                     ║
║                      8 min                     ║
║                                                ║
║  ────────────────────────────────────────────  ║
║                                                ║
║  → Rathaus Steglitz                            ║
║   🟧 U9              3 min                     ║
║                     12 min                     ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

<div align="center">

**Made with ❤️ in Berlin** 🐻

[![GitHub](https://img.shields.io/badge/GitHub-Serverlele30-181717?style=for-the-badge&logo=github)](https://github.com/Serverlele30/rpi-ubahn)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

**Bei Fragen oder Problemen:** [Issues](https://github.com/Serverlele30/rpi-ubahn/issues) öffnen! 🚀

</div>
