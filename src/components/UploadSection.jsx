import React, { useState } from "react";
import axios from "axios";

export default function UploadSection({ onResult }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("QR NFT");
  const [description, setDescription] = useState("NFT generado desde QR del juego");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      else formData.append("imageUrl", imageUrl);
      formData.append("name", name);
      formData.append("description", description);

      const resp = await axios.post("http://localhost:4000/mint", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onResult(resp.data);
    } catch(err) {
      console.error(err);
      onResult({ success: false, error: err.message || "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
      <label>
        Nombre:
        <input value={name} onChange={(e)=>setName(e.target.value)} />
      </label>
      <label>
        Descripción:
        <input value={description} onChange={(e)=>setDescription(e.target.value)} />
      </label>
      <label>
        Subir imagen (archivo):
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} />
      </label>
      <div style={{ textAlign: "center" }}>o</div>
      <label>
        Ingresar URL de la imagen:
        <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} />
      </label>

      <button type="submit" disabled={loading || (!file && !imageUrl)}>
        {loading ? "Generando..." : "Crear NFT"}
      </button>
    </form>
  );
}