import { useEffect, useState, useRef } from 'react';
import * as L from 'leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import { Track } from '../utils/trackGenerator';
import Stats from 'stats.js';
import { getArrowTexture } from '../lib/pixiAssets';

interface TrackVisuals {
  container: PIXI.Container;
  line: PIXI.Graphics;
  icon: PIXI.Sprite;
  labelContainer: PIXI.Container;
}

export const usePixiOverlay = (map: L.Map | null, tracks: Track[], stats: Stats | null) => {
  const [iconTexture, setIconTexture] = useState<PIXI.Texture | null>(null);
  const tracksRef = useRef(tracks);

  const trackVisualsRef = useRef<Map<string, TrackVisuals>>(new Map());
  const pixiContainerRef = useRef<PIXI.Container | null>(null);

  useEffect(() => {
    getArrowTexture().then(setIconTexture);
  }, []);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    if (!iconTexture || !pixiContainerRef.current) return;

    const visuals = trackVisualsRef.current;
    const container = pixiContainerRef.current;
    const newTrackIds = new Set(tracks.map(t => t.id));

    visuals.forEach((_visual, trackId) => {
      if (!newTrackIds.has(trackId)) {
        container.removeChild(_visual.container);
        visuals.delete(trackId);
      }
    });

    tracks.forEach(track => {
      if (!visuals.has(track.id)) {
        const newContainer = new PIXI.Container();
        const line = new PIXI.Graphics();
        const icon = new PIXI.Sprite(iconTexture);
        const labelContainer = new PIXI.Container();
        const labelBackground = new PIXI.Graphics();
        const labelText = new PIXI.Text(track.label, { fontSize: 12, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' });
        const padding = 4, tailSize = 5, cornerRadius = 8, bgColor = 0x2c3e50;
        labelText.position.set(tailSize + padding, padding);
        const bgWidth = labelText.width + (padding * 2) + tailSize;
        const bgHeight = labelText.height + (padding * 2);
        labelBackground.beginFill(bgColor, 0.85);
        labelBackground.moveTo(0, bgHeight / 2);
        labelBackground.lineTo(tailSize, bgHeight / 2 - tailSize);
        labelBackground.lineTo(tailSize, bgHeight / 2 + tailSize);
        labelBackground.drawRoundedRect(tailSize, 0, bgWidth - tailSize, bgHeight, cornerRadius);
        labelBackground.endFill();
        labelContainer.addChild(labelBackground, labelText);
        labelContainer.pivot.set(0, bgHeight / 2);
        icon.anchor.set(0.5, 0.5);
        newContainer.addChild(line, icon, labelContainer);
        
        visuals.set(track.id, { container: newContainer, line, icon, labelContainer });
        container.addChild(newContainer);
      }
    });
  }, [tracks, iconTexture]);

  useEffect(() => {
    if (!map || !stats) return;

    const pixiContainer = new PIXI.Container();
    pixiContainerRef.current = pixiContainer;

    const pixiOverlay = (L as any).pixiOverlay((utils: any) => {
      utils.getRenderer().render(utils.getContainer());
    }, pixiContainer, { doubleBuffering: true });

    pixiOverlay.addTo(map);

    const ticker = PIXI.Ticker.shared;
    const renderLoop = () => {
      stats.begin();

      const currentTracks = tracksRef.current;
      const currentVisuals = trackVisualsRef.current;
      const utils = pixiOverlay.utils;
      const project = utils.latLngToLayerPoint;
      const scale = utils.getScale();
      const zoom = utils.getMap().getZoom();
      const thresholdZoom = 15, shrinkFactor = 0.85;
      let zoomModifier = 1.0;
      if (zoom < thresholdZoom) zoomModifier = Math.pow(shrinkFactor, thresholdZoom - zoom);
      const baseScale = 1 / scale;
      const finalScale = baseScale * zoomModifier;
      const isLabelVisible = zoom > 12;

      const lineSegmentLength = 4;

      currentTracks.forEach(track => {
        const visuals = currentVisuals.get(track.id);
        if (!visuals || track.path.length < 2) return;

        const recentPath = track.path.slice(-lineSegmentLength);

        const projectedSegment = recentPath.map((coords: [number, number]) => project(L.latLng(coords[0], coords[1])));
        
        visuals.line.clear();
        visuals.line.lineStyle(2 / scale, 0xcc5500, 1);
        projectedSegment.forEach((point, index) => {
          if (index === 0) visuals.line.moveTo(point.x, point.y);
          else visuals.line.lineTo(point.x, point.y);
        });

        const headPoint = projectedSegment[projectedSegment.length - 1];
        visuals.icon.position.set(headPoint.x, headPoint.y);
        visuals.labelContainer.position.set(headPoint.x + 15 * baseScale, headPoint.y);
        visuals.icon.scale.set(finalScale);
        visuals.labelContainer.scale.set(finalScale);
        visuals.labelContainer.visible = isLabelVisible;
        visuals.icon.rotation = 0;
      });

      pixiOverlay.redraw();
      stats.end();
    };
    ticker.add(renderLoop);

    return () => {
      ticker.remove(renderLoop);
      pixiOverlay.destroy();
      pixiContainerRef.current = null;
    };
  }, [map, stats, iconTexture]);

  return null;
};