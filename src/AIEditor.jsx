import { useState } from "react";

export default function AIEditor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  async function callAI(endpoint) {
    const res = await fetch(`http://localhost:8000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: input })
    });
    const data = await res.json();
    setOutput(data.answer);
  }

  return (
    <div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="اكتب الكود هنا..."
      />
      <button onClick={() => callAI("generate")}>توليد كود</button>
      <button onClick={() => callAI("fix")}>إصلاح كود</button>
      <button onClick={() => callAI("explain")}>شرح كود</button>
      <pre>{output}</pre>
    </div>
  );
}
