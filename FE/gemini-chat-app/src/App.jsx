import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/api/chat", {
        prompt: input,
      });

      const geminiMessage = { role: "gemini", text: res.data.reply };
      setMessages((prev) => [...prev, geminiMessage]);
    } catch (err) {
      console.error("Error:", err.message);
      setMessages((prev) => [
        ...prev,
        { role: "error", text: "Failed to get response. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    const rawMarkup = marked.parse(text, { breaks: true, gfm: true });
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: cleanMarkup };
  };

  return (
    <div className="h-screen flex flex-col  m-auto  bg-gray-100 -5 ">
      <header className="bg-white shadow px-6 py-4 text-xl font-light text-gray-800">
        💬 Gemini Chat
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-max px-4 py-2 rounded-lg break-words shadow-sm ${
              msg.role === "user"
                ? "bg-blue-50 self-end text-right ms-auto"
                : msg.role === "gemini"
                ? "bg-white self-start text-left"
                : "bg-red-200 self-start text-left"
            }`}
          >
            {msg.role === "gemini" ? (
              <div dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
            ) : (
              <p className="whitespace-pre-wrap">{msg.text}</p>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
        {isLoading && (
          <div className="flex gap-2 " >
            <div
              className="animate-ping  bg-black "
              style={{ width: "5px", height: "5px", borderRadius: "50%" }}
            ></div>
            <div
              className="animate-ping  bg-black "
              style={{ width: "5px", height: "5px", borderRadius: "50%" }}
            ></div>
            <div
              className="animate-ping  bg-black "
              style={{ width: "5px", height: "5px", borderRadius: "50%" }}
            ></div>
          </div>
        )}
      </main>

      <div className="p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            rows="2"
            className="flex-1 resize-none rounded-lg p-2 text-sm outline-0 shadow-lg shadow-black-300 border-1 "
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
          />
          <button
            className={`bg-black text-white font-light px-4 py-2 rounded-lg ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
