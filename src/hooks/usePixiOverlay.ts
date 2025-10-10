import { useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import * as PIXI from 'pixi.js';
import 'leaflet-pixi-overlay';
import { Track } from '../utils/trackGenerator';
import Stats from 'stats.js';

export const usePixiOverlay = (map: L.Map | null, tracks: Track[], stats: Stats | null) => {
  const trackGraphics = useMemo(() => {
    const graphicsMap = new Map<string, PIXI.Graphics>();
    tracks.forEach(track => {
      graphicsMap.set(track.id, new PIXI.Graphics());
    });
    return graphicsMap;
  }, [tracks]);

  const overlayRef = useRef<{
    pixiOverlay: any;
    renderer: PIXI.Renderer | null;
    container: PIXI.Container | null;
  } | null>(null);

  useEffect(() => {
    if (!map) return;

    const pixiContainer = new PIXI.Container();
    trackGraphics.forEach(graphic => pixiContainer.addChild(graphic));

    let firstDraw = true;
    let prevZoom: number;

    const pixiOverlay = (L as any).pixiOverlay((utils: any) => {
      if (!overlayRef.current?.renderer) {
        if (overlayRef.current) {
          overlayRef.current.renderer = utils.getRenderer();
          overlayRef.current.container = utils.getContainer();
          console.log("Renderer and Container captured.");
        }
      }

      const zoom = utils.getMap().getZoom();
      const project = utils.latLngToLayerPoint;
      const scale = utils.getScale();

      if (firstDraw || prevZoom !== zoom) {
        console.log("Redrawing tracks due to zoom/pan.");
        tracks.forEach(track => {
          const graphic = trackGraphics.get(track.id);
          if (!graphic) return;
          const projectedPath = track.path.map(coords => project(L.latLng(coords[0], coords[1])));
          graphic.clear();
          graphic.lineStyle(2 / scale, 0xffa500, 1);
          projectedPath.forEach((point, index) => {
            if (index === 0) graphic.moveTo(point.x, point.y);
            else graphic.lineTo(point.x, point.y);
          });
        });
      }
      firstDraw = false;
      prevZoom = zoom;
      utils.getRenderer().render(utils.getContainer());
    }, pixiContainer);

    pixiOverlay.addTo(map);
    
    overlayRef.current = { pixiOverlay, renderer: null, container: null };

    return () => {
      console.log("Destroying overlay.");
      pixiOverlay.destroy();
      overlayRef.current = null;
    };
  }, [map, tracks, trackGraphics]);

useEffect(() => {
    if (!stats) return;

    const ticker = PIXI.Ticker.shared;
    let frameCount = 0;
    const renderLoop = () => {
      if (overlayRef.current?.renderer && overlayRef.current?.container) {
        if (frameCount < 5) {
          console.log(`Frame ${frameCount}: Ticker is running, calling stats.begin/end`);
          frameCount++;
        }
        stats.begin();
        overlayRef.current.renderer.render(overlayRef.current.container);
        stats.end();
      }
    };

    ticker.add(renderLoop);
    console.log("Ticker added.");

    return () => {
      ticker.remove(renderLoop);
      console.log("Ticker removed.");
    };
  }, [stats]);

  return null;
};