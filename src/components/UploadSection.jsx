import React, { useState } from "react";
import axios from "axios";
import "./UploadSection.css";

export default function UploadSection({ onResult }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("QR NFT");
  const [description, setDescription] = useState("NFT generado desde QR del juego");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
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
    } catch (err) {
      console.error(err);
      onResult({ success: false, error: err.message || "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="form-item">
        <label>Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="form-item">
        <label>Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="form-item">
        <label>Subir imagen</label>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      </div>

      <div className="or-text">o</div>

      <div className="form-item">
        <label>Ingresar URL de la imagen</label>
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading || (!file && !imageUrl)}
      >
        {loading ? "Generando..." : "Crear NFT"}
      </button>
    </form>
  );
}