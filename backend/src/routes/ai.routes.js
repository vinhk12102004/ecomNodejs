import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/product.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Lấy sản phẩm từ DB
    const laptops = await Product.find({
      category: { $regex: "laptop", $options: "i" }
    })
      .select("_id name price image cpu ram ssd slug")
      .limit(8);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ----------------- PROMPT HỢP CHUẨN KHÔNG SYSTEM-ROLE -----------------
    const prompt = `
Bạn là chatbot tư vấn laptop cho website e-commerce.
Hãy trả lời tự nhiên, thân thiện như đang trò chuyện.

Quy tắc bắt buộc:
1. Nếu người dùng hỏi về laptop / tư vấn mua / chọn máy → 
   - Trả lời hội thoại tự nhiên
   - Có thể đề xuất 1-3 laptop bên dưới
   - Chỉ được chọn từ danh sách sản phẩm này:
     ${JSON.stringify(laptops.map(p => ({
        name: p.name,
     })), null, 2)}
   - KHÔNG được bịa thêm sản phẩm ngoài danh sách này.

2. Nếu câu hỏi KHÔNG liên quan laptop →
   - Trả lời tự nhiên bình thường như người đang nói chuyện
   - Không cần nhắc đến laptop nếu không phù hợp.

3. Luôn trả lời ở dạng văn bản thuần (KHÔNG JSON, KHÔNG format data).
---

User: ${message}
`;



    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    // Nếu AI trả JSON → parse gửi FE
    try {
      return res.json(JSON.parse(reply));
    } catch {
      return res.json({ type: "text", reply }); // fallback text
    }

  } catch (err) {
    console.error("❌ Gemini Error:", err);
    return res.status(500).json({ error: "Gemini Chat failed" });
  }
});

export default router;
