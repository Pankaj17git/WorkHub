"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import swagger-ui-react (it uses browser APIs)
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then(setSpec)
      .catch(console.error);
  }, []);

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh" }}>
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
            color: "#888",
            fontSize: 16,
          }}
        >
          Loading API documentation…
        </div>
      )}
    </div>
  );
}
