import { useState } from "react";

export default function ProductRatings({ productId }) {
  const [myRating, setMyRating] = useState(0);     // rating đã chọn
  const [hoverRating, setHoverRating] = useState(0); // rating khi hover

  const handleRate = async (value) => {
    setMyRating(value);

    try {
      const res = await fetch(`/api/products/${productId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: value })
      });

      if (!res.ok) {
        console.error("Rating failed");
        return;
      }

      // ⭐ GIỮ reload trang sau khi rating
      window.location.reload();

    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  return (
    <div
      style={{
        fontSize: "40px",        // ⭐ Sao lớn hơn
        marginTop: "20px",       // ⭐ Gần phần reviews hơn
        display: "flex",
        gap: "6px"
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || myRating);

        return (
          <span
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: "pointer",
              transition: "color 0.2s",
              color: isActive ? "gold" : "#ccc"
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
