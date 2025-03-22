```md
# Pokémon Card Collector - Margelo React Native Challenge

Welcome to my submission for the Margelo React Native Developer Challenge. This app allows users to discover and collect Pokémon cards through an interactive swipeable interface.

## Features

- **Card Swiping Interface**: Tinder-like swipe mechanics to browse through Pokémon
- **Collection Management**: Save your favorite Pokémon to your personal deck
- **Beautiful Animations**: Smooth transitions and visual feedback during interactions
- **Pokémon Stats Visualization**: Dynamic circular progress charts for Pokémon experience

## Tech Stack

- **React Native & Expo**: Core framework
- **Reanimated**: Fluid animations for card swiping and transitions
- **React Native Gesture Handler**: Touch interactions and swipe mechanics
- **React Native Skia**: Rendering experience charts and visual elements
- **React Navigation**: Tab-based navigation between screens
- **Zustand**: State management for the Pokémon collection
- **PokeAPI**: Data source for Pokémon information

## Screens

### 1. All Pokémon (Card Stack)
- Displays Pokémon cards one at a time in a swipeable stack
- Swipe right to add to your deck
- Visual feedback during swipe with rotation effects and color indicators
- Experience stats displayed in an animated circular chart

### 2. My Deck (Collection)
- Grid view of all collected Pokémon
- Tap to view detailed information

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/pokemon-card-collector.git
   cd pokemon-card-collector
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

4. Open the app on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go on your device

## Implementation Details

### Animations
- Card rotation during swipe uses Reanimated's interpolation
- Experience chart animations leveraging Skia for smooth rendering
- Transition effects between screens and card states

### State Management
- Zustand store for managing the collection of Pokémon
- Persistent storage to maintain the deck between app sessions

### API Integration
- Fetches Pokémon data from PokeAPI with proper error handling and caching
- Manages loading states for a smooth user experience

## Demo

A demo video of the application can be found in the root directory (demo.mp4).
```
