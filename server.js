import express from "express";
import bodyParser from "body-parser";
import { spawn } from "child_process";

const app = express();
app.use(bodyParser.json());

// endpoint عام: /generate أو /fix أو /explain
app.post("/:action", (req, res) => {
  const { code } = req.body;
  const action = req.params.action;

  const ollama = spawn("ollama", ["run", "deepseek-coder"]);

  let output = "";
  ollama.stdout.on("data", data => {
    output += data.toString();
  });

  // نرسل الطلب للنموذج
  ollama.stdin.write(`${action} this code:\n${code}\n`);
  ollama.stdin.end();

  ollama.on("close", () => {
    res.json({ answer: output });
  });
});

app.listen(8000, () => console.log("AI server running on http://localhost:8000"));
