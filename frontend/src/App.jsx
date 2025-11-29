import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/health")
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="container mt-5">
      <h1>E-commerce App</h1>
      <div className="card">
        <div className="card-header">
          <h5>API Health Check</h5>
        </div>
        <div className="card-body">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}