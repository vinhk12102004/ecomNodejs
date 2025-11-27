import { useState, useEffect } from "react";
import { getMyRating, addRating } from "../lib/api";

export default function ProductRatings({ productId }) {
  const [myRating, setMyRating] = useState(0);     // rating đã chọn
  const [hoverRating, setHoverRating] = useState(0); // rating khi hover
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load rating hiện tại khi component mount
  useEffect(() => {
    const loadMyRating = async () => {
      try {
        const result = await getMyRating(productId);
        if (result.data && result.data.stars) {
          setMyRating(result.data.stars);
        }
      } catch (err) {
        // Không có rating hoặc lỗi (có thể là guest user) - không cần xử lý
        console.log("No existing rating found");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadMyRating();
    }
  }, [productId]);

  const handleRate = async (value) => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await addRating(productId, value);
      setMyRating(value); // Cập nhật state sau khi submit thành công
    } catch (err) {
      console.error("Rating error:", err);
      // Revert về rating cũ nếu lỗi
      alert(err.response?.data?.error || "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontSize: "40px", marginTop: "20px", display: "flex", gap: "6px", opacity: 0.5 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>★</span>
        ))}
      </div>
    );
  }

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
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "color 0.2s",
              color: isActive ? "gold" : "#ccc",
              opacity: submitting ? 0.6 : 1
            }}
            title={submitting ? "Đang gửi..." : `Đánh giá ${star} sao`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
