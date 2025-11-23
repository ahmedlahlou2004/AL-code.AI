// server.js
import express from "express";
import { exec } from "child_process";

const app = express();
app.use(express.json());

// نقطة نهاية عامة: /generate أو /fix أو /explain
app.post("/:action", (req, res) => {
  const { code } = req.body;
  const action = req.params.action;

  // نرسل الطلب مباشرة كـ prompt
  const prompt = `${action} this code:\n${code}`;

  exec(`ollama run deepseek-coder --prompt "${prompt}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error("Stderr:", stderr);
    }
    res.json({ answer: stdout.trim() });
  });
});

app.listen(8000, () => console.log("AI server running on http://localhost:8000"));
