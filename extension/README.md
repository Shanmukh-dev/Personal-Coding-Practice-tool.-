# ⚡ Omega LeetCode Chrome Extension

An adaptive learning companion for LeetCode that automatically intercepts submissions, locks practice reflections to solidify long-term retention, and displays daily consistency heatmaps directly from your browser toolbar.

---

## ✨ Features

- 🎯 **Automatic LeetCode Submission Interceptor**:
  - Automatically listens for `Accepted` submissions on `leetcode.com` and `leetcode.cn`.
  - Extracts problem title, difficulty slug, and timestamps in real time.

- 🔒 **Unavoidable Practice Reflection Modal**:
  - Triggers immediately after an accepted problem on LeetCode.
  - Locks background scrolling, traps keyboard focus, and requires completing the quick reflection (Confidence, Felt Difficulty, Pattern Intuition, Notes) to build long-term pattern recognition.

- 🏷️ **Dynamic Extension Badge Status**:
  - Displays **`ON`** (Emerald) or **`OFF`** (Slate) badge text on the toolbar icon.
  - One-click toggle switch inside the popup.

- 📅 **Current Month Heatmap & Daily Progress**:
  - Compact, high-contrast calendar grid showing current month problem-solving consistency.
  - Real-time tracker for total problems solved today against your daily target.
  - Streak flame indicator and recent problem reflections log.

- 🎨 **App-Matched Aesthetic**:
  - Matches the exact modern dark zinc theme, typography, and Omega `Ω` badge of the web OS.

---

## 🚀 How to Install in Chrome / Brave / Edge

1. Open your browser and navigate to `chrome://extensions` (or `brave://extensions` / `edge://extensions`).
2. Turn ON **"Developer mode"** in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left.
4. Select the `extension/` folder in this project repository.
5. The **Omega** icon (`Ω`) will appear in your browser extensions toolbar! Pin it for quick access.
6. Open any LeetCode problem (e.g., `https://leetcode.com/problems/two-sum/`) and submit your solution. The unavoidable reflection dialogue will automatically trigger!

---

## 📂 Folder Structure

```
extension/
├── manifest.json         # Manifest V3 configuration
├── background.js         # Service worker & dynamic badge controller
├── content.js            # In-page LeetCode detector & unavoidable modal injector
├── content.css           # Isolated modal stylesheet
├── popup.html            # Extension popup markup
├── popup.css             # Dark theme popup styling
├── popup.js              # Current month heatmap & today's progress calculator
├── icons/                # Omega Ω icon assets (16x16, 32x32, 48x48, 128x128, SVG)
└── README.md             # This guide
```
