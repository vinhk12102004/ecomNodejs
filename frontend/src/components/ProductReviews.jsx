import { useState, useEffect } from 'react';
import { getReviews, createReview } from '../lib/api';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ authorName: '', content: '', stars: 0 });
  const [hoverStar, setHoverStar] = useState(0); // Để hiển thị khi hover vào sao
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const result = await getReviews(productId, { page: 1, limit: 10 });
      setReviews(result.data || []);
      setMeta(result.meta || { page: 1, total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }
    if (!formData.stars || formData.stars < 1 || formData.stars > 5) {
      alert('Vui lòng chọn số sao đánh giá (1-5 sao)');
      return;
    }
    
    setSubmitting(true);
    try {
      await createReview(productId, formData);
      setFormData({ authorName: '', content: '', stars: 0 });
      setHoverStar(0);
      await loadReviews();
      alert('Đánh giá của bạn đã được gửi!');
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Component hiển thị sao (read-only)
  const StarRating = ({ stars }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: '20px',
              color: star <= stars ? '#fbbf24' : '#d1d5db'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-white">Đánh giá và bình luận</h2>
      
      {/* Review Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Viết đánh giá</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ⭐ Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá sao <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1" style={{ fontSize: '32px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoverStar || formData.stars);
                  return (
                    <span
                      key={star}
                      onClick={() => setFormData({ ...formData, stars: star })}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      style={{
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        color: isActive ? '#fbbf24' : '#d1d5db'
                      }}
                      title={`${star} sao`}
                    >
                      ★
                    </span>
                  );
                })}
              </div>
              {formData.stars > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  {formData.stars} / 5 sao
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên của bạn (tùy chọn)</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Nhập tên của bạn"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 min-h-[100px]"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.content.length}/2000 ký tự</p>
          </div>
          <button
            type="submit"
            disabled={submitting || !formData.content.trim() || !formData.stars}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <p className="text-gray-600">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-400 mb-4">
              Tổng cộng {meta.total} đánh giá
            </div>
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {review.authorName ? review.authorName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-semibold text-gray-900">
                          {review.authorName || 'Khách hàng'}
                        </div>
                        {/* ⭐ Hiển thị số sao cho mỗi review */}
                        {review.stars && (
                          <StarRating stars={review.stars} />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

