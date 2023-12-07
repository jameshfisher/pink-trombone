import { makeNoise2D } from "fast-simplex-noise";
export const simplex2 = makeNoise2D();
export const simplex1 = (x: number) => simplex2(x * 1.2, -x * 0.7);
