import React from "react";
import THREE from "three";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: {
        children?: React.ReactNode;
      };
      meshLineMaterial: {
        children?: React.ReactNode;
        color?: string;
        depthTest?: boolean;
        resolution?: [number, number];
        useMap?: boolean;
        map?: THREE.Texture;
        repeat?: [number, number];
        lineWidth?: number;
      };
    }
  }
}
