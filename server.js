import express from "express";
import { spawn } from "child_process";

const app = express();
app.use(express.json());

app.post("/:action", (req, res) => {
  const { code } = req.body;
  const action = req.params.action;

  const ollama = spawn("ollama", ["run", "deepseek-coder"]);

  let output = "";

  ollama.stdout.on("data", (data) => {
    output += data.toString();
  });

  ollama.stderr.on("data", (data) => {
    console.error("Error from Ollama:", data.toString());
  });

  ollama.stdin.write(`${action} this code:\n${code}\n`);
  ollama.stdin.end();

  ollama.on("close", () => {
    res.json({ answer: output.trim() });
  });
});

app.listen(8000, () => console.log("AI server running on http://localhost:8000"));
