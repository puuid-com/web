"use client";

import { useState, useEffect } from "react";

interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  brightness: number;
}

export function useProminentColor(imageUrl: string | null): string | null {
  const [color, setColor] = useState<string | null>(null);

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  };

  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getBrightness = (r: number, g: number, b: number): number => {
    return Math.round((r * 299 + g * 587 + b * 114) / 1000);
  };

  useEffect(() => {
    if (!imageUrl) {
      setColor(null);
      return;
    }

    const extractColor = async (): Promise<void> => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = imageUrl;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        // Resize for performance while maintaining aspect ratio
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const vibrantColors: Array<{
          r: number;
          g: number;
          b: number;
          score: number;
        }> = [];

        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i]!;
          const g = data[i + 1]!;
          const b = data[i + 2]!;
          const a = data[i + 3]!;

          // Skip transparent pixels
          if (a < 128) continue;

          const hsl = rgbToHsl(r, g, b);

          if (hsl.s < 30 || hsl.l < 15 || hsl.l > 85) continue;

          if (hsl.s < 20) continue;

          const vibrancyScore = hsl.s * (1 - Math.abs(hsl.l - 50) / 50);

          vibrantColors.push({ r, g, b, score: vibrancyScore });
        }

        if (vibrantColors.length === 0) {
          setColor(null);
          return;
        }

        vibrantColors.sort((a, b) => b.score - a.score);
        const mostVibrant = vibrantColors[0]!;

        const hex = rgbToHex(mostVibrant.r, mostVibrant.g, mostVibrant.b);
        setColor(hex);
      } catch (err) {
        setColor(null);
      }
    };

    extractColor();
  }, [imageUrl]);

  return color;
}
