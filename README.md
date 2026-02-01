# Tic-Tac-Toe: Emoji Edition

A fun, mobile-responsive Tic-Tac-Toe game featuring multiple emoji themes, AI opponents, visual effects, and sound.

## Play Now

**[https://nkremerx.github.io/Tic-Tac-Toe-with-animal-emojis/](https://nkremerx.github.io/Tic-Tac-Toe-with-animal-emojis/)**

## Features

- **5 Emoji Categories** - Choose your favorite theme:
  - 🐾 **Animals** - 🐱 🐶 🦊 🐰 🐼 🐨 🦁 🐯 🐻 🐷 🐸 🦄
  - 🍎 **Fruits & Veggies** - 🍎 🍊 🍋 🍇 🍓 🍑 🥑 🥕 🌽 🍆 🥦 🍉
  - 👽 **Humans & Aliens** - 👨 👩 👶 🧒 👴 👵 🤖 👽 👻 💀 🧛 🧟
  - 😈 **Adult Only** - Suggestive emoji collection (12 emojis)
  - ⭐ **Free Choice** - 50 popular emojis from all categories
- **1-Player Mode** - Challenge the AI with three difficulty levels
- **2-Player Mode** - Play against a friend on the same device
- **AI Difficulty Levels**:
  - 😊 **Easy** - Random moves
  - 🤔 **Medium** - Sometimes smart (70% optimal, 30% random)
  - 🧠 **Hard** - Unbeatable (minimax algorithm)
- **Visual Effects** - Floating particle background, confetti celebrations, smooth animations
- **Dynamic Themes** - Background particles update to match your selected category
- **Sound Effects** - Procedurally generated audio using Web Audio API
- **Score Tracking** - Scores persist across sessions using LocalStorage
- **Mobile Friendly** - Fully responsive design with touch optimization

## How to Play

1. **Start** - Tap anywhere on the welcome screen to begin
2. **Choose Mode** - Select 1-Player (vs AI) or 2-Player (vs friend)
3. **Pick Your Theme** - Select from 5 emoji categories
4. **Pick Your Emoji** - Select your favorite emoji from the chosen category
5. **Select Difficulty** - (1-Player only) Choose Easy, Medium, or Hard
6. **Play** - Take turns placing your emoji on the 3×3 grid
7. **Win** - Get 3 of your emojis in a row (horizontal, vertical, or diagonal)

## Game Screens

| Screen | Description |
|--------|-------------|
| Welcome | Animated intro with floating particles |
| Menu | Choose game mode, tutorial, or settings |
| Category Select | Pick your emoji theme (5 options) |
| Emoji Select | Pick your emoji avatar |
| Difficulty | Select AI difficulty (1-player only) |
| Game | The main 3×3 game board |
| Summary | Win/Lose/Draw results with play again option |
| Tutorial | How to play instructions |
| Settings | Toggle music/SFX, reset scores |

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Flexbox/Grid layout, animations, responsive design
- **Vanilla JavaScript** - No frameworks or dependencies
- **Web Audio API** - Procedurally generated sounds
- **Canvas API** - Particle effects and confetti
- **LocalStorage** - Score and settings persistence

## Project Structure

```
├── index.html              # Single-page application
├── css/
│   ├── styles.css          # Core layout and styling
│   ├── animations.css      # Keyframe animations
│   └── responsive.css      # Mobile breakpoints
├── js/
│   ├── app.js              # Main entry, screen navigation, emoji categories
│   ├── state.js            # Centralized state management
│   ├── game.js             # Game logic, win detection
│   ├── ai.js               # AI opponent (Easy/Medium/Hard)
│   ├── audio.js            # Web Audio API manager
│   ├── particles.js        # Canvas particle effects
│   └── storage.js          # LocalStorage persistence
└── assets/
    └── audio/              # Placeholder audio files
```

## Run Locally

Simply open `index.html` in any modern web browser. No build step or server required.

```bash
# Clone the repository
git clone https://github.com/NKremerx/Tic-Tac-Toe-with-animal-emojis.git

# Open in browser
open index.html
```

## Browser Support

Works on all modern browsers:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome for Android)

## Accessibility

- Keyboard navigable
- Respects `prefers-reduced-motion` for users sensitive to animations
- High contrast mode support

## License

MIT License - Feel free to use, modify, and distribute.

---

Made with ❤️ and 🎮⭐🎉🏆
