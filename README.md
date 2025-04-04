# FSO Benefits Calculator (Progressive Web App)

A Progressive Web App (PWA) that helps Foreign Service Officers estimate retirement benefits. The app works fully **offline** once installed and provides a native app-like experience on both mobile and desktop devices.

## Features

- Calculate retirement benefits based on:
  - Grade and step
  - Years of service
  - V/TERA eligibility
  - Health insurance options
  - Service Computation Date
  - Leave balances
  - High-Three salary information
- Works offline after initial installation
- Native app-like experience
- Dark mode support
- Responsive design for all devices
- Detailed calculation breakdowns
- Save calculations for later reference

## Installation

### On iPhone (Safari):

1. Visit [https://rjgeiser.github.io/FSO-Calculator](https://rjgeiser.github.io/FSO-Calculator) in **Safari**
2. Tap the **Share icon** (square with up arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**

### On Android (Chrome):

1. Visit [https://rjgeiser.github.io/FSO-Calculator](https://rjgeiser.github.io/FSO-Calculator) in **Chrome**
2. Tap the **three-dot menu** (top right)
3. Tap **"Add to Home screen"**
4. Follow the prompts

### On Desktop (Chrome/Edge):

1. Visit [https://rjgeiser.github.io/FSO-Calculator](https://rjgeiser.github.io/FSO-Calculator)
2. Click the **install icon** in the address bar
3. Follow the prompts to install

## Development

This project is built as a Progressive Web App using:
- HTML5
- CSS3
- JavaScript (ES Modules)
- Service Workers for offline functionality
- Web App Manifest for installation

### Project Structure

```
/
├── index.html          # Main application file
├── manifest.json       # PWA configuration
├── js/                 # JavaScript modules
│   ├── calculator.js   # Core calculation logic
│   ├── ui.js          # User interface handling
│   └── validation.js   # Form validation
├── css/
│   └── styles.css     # Application styles
├── img/               # Application icons
└── splash/            # Splash screen images
```

## Disclaimer

This calculator provides estimates based on publicly available information and should be used for planning purposes only. The actual benefits may vary based on individual circumstances, policy changes, and other factors. Please consult with HR or a benefits counselor for official calculations and guidance.

## Support

If you have feedback or run into any issues:
1. Open an issue on this GitHub repository
2. Contact Roy Geiser directly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
