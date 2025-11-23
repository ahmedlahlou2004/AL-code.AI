import { useState } from "react";

export default function AIEditor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  async function callAI(endpoint) {
    try {
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input })
      });
      const data = await res.json();
      setOutput(data.answer);
    } catch (err) {
      setOutput("خطأ في الاتصال بالخادم: " + err.message);
    }
  }

  return (
    <div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="اكتب الكود هنا..."
        rows={6}
        cols={60}
      />
      <div>
        <button onClick={() => callAI("generate")}>توليد كود</button>
        <button onClick={() => callAI("fix")}>إصلاح كود</button>
        <button onClick={() => callAI("explain")}>شرح كود</button>
      </div>
      <pre>{output}</pre>
    </div>
  );
}
