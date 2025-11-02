import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

function App() {
  const [code, setCode] = useState(`# اكتب كود بايثون هنا\nprint("مرحبًا يا Med!")`);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setOutput("فشل تحميل Pyodide: " + err);
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput("جارٍ تحميل Pyodide...");
      return;
    }

    let outputText = '';
    pyodide.setStdout({
      batched: (text) => {
        outputText += text;
      },
    });

    try {
      await pyodide.runPythonAsync(code);
      setOutput(outputText || "✅ تم تنفيذ الكود بنجاح، لكن لا يوجد ناتج.");
    } catch (err) {
      setOutput("⚠️ " + err.toString());
    }
  };

  return (
    <div className="container">
      <div className="editor">
        <h1>🧠 محرر بايثون التفاعلي</h1>
        <p style={{ fontSize: '18px', color: '#888' }}>اكتب كودك وشغّله مباشرة في المتصفح!</p>
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            lineNumbers: "on",
            automaticLayout: true,
          }}
        />
       
