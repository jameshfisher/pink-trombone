"use client";

import "@fontsource/quicksand/400.css";
import "@fontsource/quicksand/700.css";
import Head from "next/head";
import React from "react";
import { start } from "../../lib/main";
import "../../lib/math";

export default function Home() {
  const tractCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const backCanvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const tractCanvas = tractCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (tractCanvas && backCanvas) {
      start(tractCanvas, backCanvas);
    }
  }, [tractCanvasRef, backCanvasRef]);

  return (
    <main>
      <Head>
        <title>Pink Trombone</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* <script src="vendor/jquery/jquery-3.4.0.min.js"></script>
        <script src="vendor/i18n4js/i18n4js-1.3.0.min.js"></script> */}
      </Head>
      <canvas
        ref={tractCanvasRef}
        id="tractCanvas"
        width="600"
        height="600"
        style={{
          position: "absolute",
          zIndex: 2,
          backgroundColor: "transparent",
          margin: 0,
          padding: 0,
        }}
      ></canvas>
      <canvas
        ref={backCanvasRef}
        id="backCanvas"
        width="600"
        height="600"
        style={{
          position: "absolute",
          zIndex: 0,
          backgroundColor: "transparent",
          margin: 0,
          padding: 0,
        }}
      ></canvas>
    </main>
  );
}
