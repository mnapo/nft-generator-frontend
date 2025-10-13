import React, { useState } from "react";
import UploadSection from "./components/UploadSection";

export default function App(){
  const [result, setResult] = useState(null);
  return (
    <div style={{ fontFamily: "sans-serif", padding: 20, backgroundColor: "#000" }}>
      <h1>Generador NFT desde QR</h1>
      <p>Subí una imagen del QR o insertá la URL del mismo para generar tu NFT</p>
      <UploadSection onResult={setResult} />
      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Resultado</h3>
          <pre style={{ maxHeight: 300, overflow: "auto" }}>{JSON.stringify(result, null, 2)}</pre>
          {result.opensea && <p><a href={result.opensea} target="_blank">Ver en OpenSea (testnets)</a></p>}
          {result.preview?.imageIpfsUrl && (
            <div>
              <p>Previsualización IPFS:</p>
              <img src={`https://ipfs.io/ipfs/${result.preview.imageIpfsUrl.replace("ipfs://","")}`} alt="ipfs" style={{maxWidth:400}}/>
            </div>
          )}
        </div>
      )}
    </div>
  )
}