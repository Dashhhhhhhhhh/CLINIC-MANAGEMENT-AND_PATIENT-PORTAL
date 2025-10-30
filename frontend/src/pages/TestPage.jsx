import { useEffect, useState } from "react";
import api from "../services/api";

export default function TestPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/patients") // this calls http://localhost:3000/api/patients
      .then(res => setData(res.data))
      .catch(() => setError("Failed to fetch data"));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>API Connection Test</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <pre>{data ? JSON.stringify(data, null, 2) : "Loading..."}</pre>
    </div>
  );
}
