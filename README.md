# Map Engine Exploration: A Performance Analysis of Leaflet.PixiOverlay

This project is a case study and testing harness designed to analyze the performance of a WebGL-based map engine, using the `Leaflet.PixiOverlay` library. Its primary objective is to measure and understand the rendering engine's limits when handling a large number of dynamic *tracks* whose positions are updated in real-time.

This project evaluates the following functional and performance requirements:
- Create and style a complex track layer (course line, icon, and label).
- Collect map engine performance metrics (FPS, memory usage).
- Test with scenarios rendering from 10 to 10,000 tracks, each moving every second.
- Analyze the results and compare them against another high-performance map engine, Maptalks.js.

## ✨ Key Features

- **Interactive Base Map**: Utilizes Leaflet.js to display a standard, pannable, and zoomable base map.
- **WebGL Rendering Layer**: Integrates Pixi.js v6 via `Leaflet.PixiOverlay` to draw objects on the map using hardware acceleration (WebGL).
- **Complex Track Visualization**: Renders each track with three components: a course line ("tail"), a custom icon, and a styled label with a background.
- **Real-time Performance Monitoring**: Integrates `stats.js` to display an on-screen panel for real-time FPS and memory usage.
- **Performance Recorder Tool**: A feature to start/stop metric recording and calculate the average FPS and memory usage over a test period.
- **Moving Track Simulation**: Implements an animation loop to simulate the movement of all tracks every second, creating a realistic stress-test scenario.
- **Visual Optimizations**: Implements dynamic scaling for icons/labels (shrinking on zoom-out) and uses short "tails" for course lines to maintain a clean visualization.
- **Anti-Flicker Architecture**: Utilizes a persistent rendering pattern to update visuals without recreating the overlay, eliminating flicker and significantly improving FPS.

## 🛠️ Tech Stack

- **Framework**: React & TypeScript
- **Bundler**: Rspack
- **Package Manager**: PNPM
- **Map Libraries**:
  - Leaflet.js
  - Pixi.js v6
  - Leaflet.PixiOverlay
- **Styling**: Tailwind CSS
- **Performance Utility**: stats.js

## 🚀 Getting Started

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

## 📊 Performance Test Results

The test was conducted with a scenario where all tracks move every 1 second. Metrics were recorded for approximately 30 seconds for each scenario.

*Test Machine Specifications: [Enter Your PC Specs Here, e.g., MacBook Pro M1, 16GB RAM, Google Chrome]*

| Track Count | Duration (s) | Avg FPS | Avg Memory (MB) |
| :---------- | :----------- | :------ | :-------------- |
| 10          | 30.40        | **60.54**   | 24.34           |
| 50          | 30.42        | **60.47**   | 24.84           |
| 100         | 30.38        | **60.42**   | 31.94           |
| 500         | 30.41        | **56.93**   | 51.46           |
| 1,000       | 30.49        | **36.57**   | 65.95           |
| 5,000       | 30.42        | **8.38**    | 209.58          |
| 10,000      | 30.80        | **4.14**    | 532.45          |

### Performance Analysis

Based on the data above, several conclusions can be drawn:

- **Excellent Performance up to 500 Tracks**: The application maintains a near-60 FPS up to ~500 tracks, indicating this approach is highly effective for small to medium-scale use cases.
- **Performance Cliff around 1,000 Tracks**: At 1,000 tracks, the FPS drops to ~36. This is the point where performance begins to degrade significantly. While still usable, it marks the upper limit for a smooth user experience.
- **Does Not Scale for Large Datasets**: Beyond 1,000 tracks, performance drops dramatically. At 5,000 tracks, the application becomes very unresponsive (<10 FPS), and at 10,000 tracks, it is nearly unusable.
- **Linear Memory Usage**: Memory consumption increases linearly with the number of tracks, which is expected behavior.

### Why Isn't Performance as Good as the 1M Feature Example?

The massive performance difference between this implementation and high-performance demos (like the 1 million markers example) is due to fundamental architectural differences in rendering:

1.  **Use of `PIXI.Graphics`**: Our implementation uses `PIXI.Graphics` to draw course lines. This method is highly flexible but is **CPU-bound** and inefficient for thousands of objects, as each shape requires significant CPU calculation. In contrast, high-performance examples use `PIXI.particles.ParticleContainer`, a **GPU-optimized** container that uses batch rendering to drastically reduce the number of draw calls.

2.  **High Object Complexity**: Each of our tracks consists of 5 PIXI objects (a main container, a line, an icon, a label container, and a text object). This creates significant overhead per feature. The 1M feature example uses only a single, simple sprite per feature.

3.  **Per-Frame Logic on the CPU**: Our render loop performs many calculations (projection, scaling, positioning) in JavaScript for every track on every frame. This heavily burdens the CPU, whereas a more optimal approach would offload more work to the GPU via shaders or data buffers.

---

## 📈 In-Depth Comparison: Leaflet.PixiOverlay vs. Maptalks.js

Based on the exploration results from both projects, here is a more in-depth comparison between the two approaches.

| Aspect                | Leaflet.PixiOverlay (Our Solution)                                   | Maptalks.js (Optimal: `setCoordinates`)                                  |
| :-------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Performance (10k Tracks)** | **Con:** Very low (~4 FPS). Unusable at this scale.                  | **Pro:** Much better (~10 FPS with complex visuals). Still slow, but fundamentally faster. |
| **Optimization Pattern**  | **Con:** **Manual & Advanced.** Requires deep PIXI/WebGL knowledge (e.g., `ParticleContainer`, batching) to achieve high performance. It's easy to write slow code. | **Pro:** **API-Driven & Guided.** Maptalks provides a high-level API like `.setCoordinates()` that is internally optimized. The developer doesn't need to know WebGL details. |
| **Learning Curve**      | **Pro:** Low if already familiar with Leaflet & PIXI. Fast for prototyping. | **Con:** Moderate. Requires learning the specific Maptalks API and concepts. |
| **Rendering Flexibility** | **Pro:** **Total.** You have full access to the entire PIXI.js feature set. You can implement custom shaders, filters, etc. The sky is the limit. | **Con:** Limited to what the Maptalks API exposes. While powerful, you don't have the same low-level control over the renderer as with PIXI. |
| **Ecosystem**           | **Pro:** The Leaflet ecosystem is massive. Easy to integrate into existing Leaflet projects. | **Con:** Smaller, more focused ecosystem. Better suited for building new applications from scratch. |
| **Memory Management**   | **Pro:** Lower memory usage in our tests (532 MB vs. ~250 MB in Maptalks for 10k tracks). This is because `PIXI.Graphics` redraws shapes rather than holding all vertices in GPU memory. | **Con:** Higher memory usage. With `.setCoordinates()`, Maptalks keeps all geometries in memory for fast updates, trading RAM for CPU/GPU speed. |

### ✅ Final Conclusion

- **Leaflet.PixiOverlay** shines as a **"scalpel"**. It is the perfect tool when you need **maximum rendering flexibility** to add a highly custom, GPU-accelerated visual layer on top of an existing Leaflet map. However, this power requires the developer to implement performance optimizations manually. This approach is well-suited for small to medium-scale data visualizations (< 1,000 complex dynamic objects) or for teams with deep WebGL/PIXI expertise.

- **Maptalks.js** acts as a **"workhorse"**. It is a complete map engine **optimized for performance from the ground up**. It provides a high-level API that abstracts away rendering complexities, allowing developers to handle large datasets more easily. It is the superior choice for building new, high-performance map applications from scratch where data scalability is a higher priority than the lowest-level rendering flexibility.

**Practical Recommendations:**
- Use **Leaflet.PixiOverlay** if you need to add a few hundred custom tracks to a mature Leaflet application.
- Use **Maptalks.js** if you are starting a new project that you know will handle thousands or more dynamic map entities.