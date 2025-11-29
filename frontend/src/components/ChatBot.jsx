import { useState, useEffect } from "react";
import { sendMessage } from "../lib/gemini";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // 🔥 Hiển thị "Bot đang trả lời..."

  // Load vị trí từ localStorage
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem("chat-pos");
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 90, y: window.innerHeight - 120 };
  });

  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Mouse down — bắt đầu kéo
  const handleMouseDown = (e) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setDragging(true);
    setMoved(false);
  };

  // Mouse move — nếu di chuyển đủ thì coi là kéo
  const handleMouseMove = (e) => {
    if (!dragging) return;

    const dx = Math.abs(e.clientX - startPos.x);
    const dy = Math.abs(e.clientY - startPos.y);

    if (dx > 5 || dy > 5) {
      setMoved(true);
      const newPos = { x: e.clientX - 30, y: e.clientY - 30 };
      setPos(newPos);
      localStorage.setItem("chat-pos", JSON.stringify(newPos));
    }
  };

  // Mouse up — kết thúc kéo
  const handleMouseUp = () => setDragging(false);

  // Gắn event listener
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  // SEND MESSAGE
  async function handleSend() {
    if (!input.trim()) return;

    setMessages(m => [...m, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);  // 🟢 Bắt đầu gõ

    const reply = await sendMessage(input);

    setIsTyping(false);  // 🔴 Bot trả lời xong
    setMessages(m => [...m, { sender: "bot", text: reply }]);
  }

  return (
    <>
      {/* ================= BUTTON CHAT FLOAT ================= */}
      {!open && (
        <div
          onMouseDown={handleMouseDown}
          onClick={() => !moved && setOpen(true)}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: 55,
            height: 55,
            borderRadius: "50%",
            background: "#007bff",
            color: "#fff",
            fontSize: 25,
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            transition: dragging ? "none" : ".15s",
            zIndex: 9999
          }}>
          💬
        </div>
      )}

      {/* ================= CHAT WINDOW ================= */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 350,
          background: "#fff",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 15px rgba(0,0,0,.15)",
          zIndex: 9999,
          maxHeight: 500,
          overflow: "hidden"
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <b>🤖 Hỗ trợ khách hàng</b>
            <button
              onClick={() => setOpen(false)}
              style={{ fontSize: 20, border: "none", background: "none", cursor: "pointer" }}
            >✖</button>
          </div>

          {/* MESSAGE AREA */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: 350,
            border: "1px solid #ddd",
            padding: 10,
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>

            {/* Khi chưa chat */}
            {messages.length === 0 && (
              <div style={{
                textAlign: "center",
                color: "#888",
                paddingTop: 20,
                fontStyle: "italic"
              }}>
                👋 Chào bạn! Hãy đặt câu hỏi để mình hỗ trợ nhé.
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left" }}>
                <div style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: m.sender === "user" ? "#007bff" : "#e5e5e5",
                  color: m.sender === "user" ? "#fff" : "#000",
                  maxWidth: "80%"
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Bot đang trả lời */}
            {isTyping && (
              <div style={{
                background: "#f1f1f1",
                width: "fit-content",
                padding: "6px 12px",
                borderRadius: 10,
                fontSize: 14,
                color: "#555"
              }}>
                Bot đang trả lời...
              </div>
            )}
          </div>

          {/* INPUT BOX */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            style={{ marginTop: 10, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button onClick={handleSend} style={{
            marginTop: 10, padding: 9,
            background: "#007bff", color: "#fff",
            borderRadius: 6, fontWeight: "bold"
          }}>
            Gửi
          </button>
        </div>
      )}
    </>
  );
}
