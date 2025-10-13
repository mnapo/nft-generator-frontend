import React, { useState, useEffect } from "react";
import UploadSection from "./components/UploadSection";
import "./App.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="app-container">
      <h1 className={`title ${animate ? "animate" : ""}`}>
        QR → NFT
      </h1>

      <p className="text">
        Subí una imagen del QR o insertá la URL del mismo para generar tu NFT
      </p>

      <div className="upload-wrapper">
        <UploadSection />
      </div>

      {result && (
        <div className="result-container">
          <h3>Resultado</h3>
          <pre className="pre">{JSON.stringify(result, null, 2)}</pre>

          {result.opensea && (
            <p>
              <a href={result.opensea} target="_blank" rel="noopener noreferrer">
                Ver en OpenSea (testnets)
              </a>
            </p>
          )}

          {result.preview?.imageIpfsUrl && (
            <div>
              <p>Previsualización IPFS</p>
              <img
                src={`https://ipfs.io/ipfs/${result.preview.imageIpfsUrl.replace(
                  "ipfs://",
                  ""
                )}`}
                alt="ipfs"
                className="preview-image"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}