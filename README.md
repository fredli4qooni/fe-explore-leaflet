# Simple Map Engine Exploration with Leaflet.PixiOverlay

This project is an exploration and performance analysis of a WebGL-based map engine, using the `Leaflet.PixiOverlay` library as a case study. The primary objective is to determine the rendering engine's limits when handling a large number of dynamic, real-time tracks.

The project evaluates the following functional and performance requirements:
- Creating and styling a track layer (CMS).
- Gathering map engine performance metrics (FPS, memory usage, GPU, CPU).
- Testing with rendering scenarios of 10 up to 10,000 tracks.
- Finding the maximum number of track features the engine can handle when each track moves every 1 second.

## Implemented Features

- **Interactive Base Map**: Utilizes Leaflet.js to display a standard, pannable, and zoomable base map.
- **WebGL Rendering Layer**: Integrates Pixi.js v6 via `Leaflet.PixiOverlay` to draw objects on the map using hardware acceleration (WebGL).
- **Dynamic Track Layer Rendering**: Capable of rendering a large number of tracks (polylines) based on dynamically generated data.
- **Real-time Performance Monitoring**: Integrated with `stats.js` to display an on-screen panel for real-time FPS and memory usage.
- **Performance Test Control UI**: A simple user interface to dynamically change the number of rendered tracks (from 10 to 10,000) for live testing.
- **Moving Track Simulation**: An animation loop that simulates the movement of all tracks every second, creating a realistic stress-test scenario.

## Technology Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Bundler**: Rspack
- **Package Manager**: PNPM
- **Map Libraries**:
  - Leaflet.js
  - Pixi.js v6
  - Leaflet.PixiOverlay
- **Styling**: Tailwind CSS
- **Performance Utility**: stats.js

## Project Structure

This project follows a strict set of naming and structuring conventions to maintain consistency and scalability.
- **Folders**: `kebab-case` (e.g., `map-view/`)
- **Components & Classes**: `PascalCase.tsx` (e.g., `MapView.tsx`)
- **Hooks & Utility Files**: `camelCase.ts` (e.g., `useMap.ts`)

The core architecture is based on the **Container/Presentational** pattern, implemented through React **Custom Hooks**. Complex logic (such as map initialization and overlay management) is encapsulated within hooks (`src/hooks`), while components (`src/components`) remain focused on rendering the UI.

## Getting Started

To run this project in your local environment, follow these steps:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/fredli4qooni/fe-explore-leaflet.git
    cd fe-explore-leaflet
    ```

2.  **Install Dependencies**
    This project uses `pnpm` as its package manager.
    ```bash
    pnpm install
    ```

3.  **Run the Development Server**
    This command will start the Rspack development server.
    ```bash
    pnpm dev
    ```

4.  **Open in Browser**
    Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Next Steps: Performance Testing and Analysis

**Status: To Be Done**

The infrastructure for testing is complete. The next phase involves systematically running test scenarios and documenting the results. The test plan includes:

1.  **Static Load Testing**:
    - [ ] Run rendering scenarios for 10, 50, 100, 500, 1,000, 5,000, and 10,000 static tracks.
    - [ ] Record FPS (idle and panning), CPU usage, and GPU memory usage for each scenario.

2.  **Dynamic Load Testing (Animation)**:
    - [ ] Run the simulation scenario where all tracks move every 1 second.
    - [ ] Find the **maximum** number of moving tracks the engine can handle while maintaining an acceptable performance threshold (e.g., a stable 30+ FPS).

3.  **Analysis and Conclusion**:
    - [ ] Analyze the collected data to identify performance bottlenecks.
    - [ ] Write a conclusion on the effectiveness and limitations of `Leaflet.PixiOverlay` for this use case.

The results of these tests will be added to this document in the future.