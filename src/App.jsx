import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

const correctPassword = 'med2025';

function App() {
  const initialCode = `import math

# Natural logarithms from 1 to 10
for i in range(1, 11):
    print(f"ln({i}) = {math.log(i):.4f}")`;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const editorRef = useRef(null);
  const handleEditorMount = (editor) => (editorRef.current = editor);
  const undoCode = () => editorRef.current?.trigger('keyboard', 'undo', null);
  const redoCode = () => editorRef.current?.trigger('keyboard', 'redo', null);

  useEffect(() => {
    const saved = localStorage.getItem('user_code');
    if (saved) setCode(saved);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => localStorage.setItem('user_code', code), 500);
    return () => clearTimeout(timeout);
  }, [code]);

  const loadPyodideWithProgress = async () => {
    if (window._pyodideInstance) {
      setPyodide(window._pyodideInstance);
      return;
    }
    setLoading(true);
    setLoadingProgress(0);
    try {
      setLoadingProgress(10);
      const pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
      });
      setLoadingProgress(50);
      await pyodideInstance.loadPackage(['numpy','matplotlib','pandas']);
      setLoadingProgress(100);
      window._pyodideInstance = pyodideInstance;
      setPyodide(pyodideInstance);
    } catch (err) {
      setOutput('⚠️ Failed to load Pyodide:\n' + err.message);
    } finally {
      setTimeout(() => { setLoading(false); setLoadingProgress(0); }, 500);
    }
  };

  const runCode = async () => {
    if (!pyodide) await loadPyodideWithProgress();
    if (!pyodide) return;

    setExecuting(true);
    let outputLines = [], errorLines = [];
    pyodide.setStdout({ batched: (t) => outputLines.push(t.endsWith('\n') ? t : t + '\n') });
    pyodide.setStderr({ batched: (t) => errorLines.push(t.endsWith('\n') ? t : t + '\n') });

    try {
      const start = performance.now();
      await pyodide.runPythonAsync(code);
      const end = performance.now();
      const time = (end - start).toFixed(2);
      const sep = '<hr style="border:1px dashed #ccc; margin:10px 0;" />';
      let resultHTML = '';

      if (errorLines.length) {
        resultHTML = `<pre style="color:red; margin:0;">${errorLines.join('')}</pre>`;
      } else if (outputLines.length) {
        resultHTML = `<pre style="color:#007bff; margin:0;">${outputLines.join('')}</pre>`;
      } else {
        resultHTML = `<pre style="color:green; margin:0;">✅ Executed successfully.</pre>`;
      }

      setOutput(prev => prev + sep + resultHTML + `<p style="font-size:0.85rem; color:#555; margin:5px 0;">⏱ Execution time: ${time} ms</p>`);

    } catch (err) {
      setOutput(prev => prev + `<pre style="color:red;">❌ Unexpected Error:\n${err.message}</pre>`);
    } finally {
      setExecuting(false);
      pyodide.setStdout(null);
      pyodide.setStderr(null);
    }
  };

  const clearOutput = () => setOutput('');
  const restartApp = () => { setCode(initialCode); setOutput(''); setExecuting(false); };
  const pasteCode = async () => { try { setCode(await navigator.clipboard.readText()); } catch {} };

  const handleLogin = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('❌ Wrong password');
    }
  };

  if (loading) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#0d1117', color:'#00ffcc', flexDirection:'column' }}>
        <div style={{ width:'70px', height:'70px', border:'6px solid rgba(255,255,255,0.2)', borderTopColor:'#00ffcc', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <p style={{marginTop:'20px'}}>🚀 Loading Pyodide {loadingProgress}%</p>
        <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', background:'#f0f8ff' }}>
        <h2 style={{marginBottom:'10px'}}>🔐 Enter Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            padding:'10px',
            borderRadius:'8px',
            border:'1px solid #ccc',
            backgroundColor:'#fff',
            width:'200px',
            textAlign:'center'
          }}
        />
        <button onClick={handleLogin} style={{marginTop:'10px', padding:'8px 15px', borderRadius:'6px', cursor:'pointer', background:'#007bff', color:'#fff', border:'none'}}>Login</button>
      </div>
    );
  }

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', fontFamily:'Arial', backgroundColor:'#f0f8ff'}}>
      <header
        style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          padding:'10px 20px',
          background: 'linear-gradient(90deg, #007bff, #00ff99)',
          color:'#fff',
          fontWeight:'bold',
          fontSize:'1.3rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <span>⚡ AL-Code.AI</span>
        <button
          onClick={()=>setShowMenu(!showMenu)}
          style={{
            padding:'8px 15px',
            borderRadius:'6px',
            border:'none',
            cursor:'pointer',
            background:'#333',
            color:'#fff',
            fontWeight:'600'
          }}
        >
          ⚙️ Menu
        </button>
      </header>

      {showMenu && (
        <div style={{
          position:'absolute',
          top:'50px',
          right:'20px',
          background:'#fff',
          borderRadius:'8px',
          boxShadow:'0 4px 15px rgba(0,0,0,0.3)',
          padding:'10px',
          zIndex:1000,
          display:'flex',
          flexDirection:'column',
          gap:'8px'
        }}>
          <button onClick={runCode}>🚀 Run</button>
          <button onClick={clearOutput}>🗑️ Clear</button>
          <button onClick={restartApp}>🔄 Restart</button>
          <button onClick={undoCode}>↩️ Undo</button>
          <button onClick={redoCode}>↪️ Redo</button>
          <button onClick={()=>navigator.clipboard.writeText(code)}>📑 Copy Code</button>
          <button onClick={()=>navigator.clipboard.writeText(output)}>📋 Copy Output</button>
          <button onClick={pasteCode}>📥 Paste</button>
        </div>
      )}

      <div style={{flex:1, display:'flex', flexDirection:'column', padding:'20px', gap:'20px'}}>
        <div style={{flex:1, borderRadius:'10px', overflow:'hidden'}}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v)=>setCode(v||'')}
            theme="vs-light"
            onMount={handleEditorMount}
            options={{fontSize:16, minimap:{enabled:false}, automaticLayout:true, fontFamily:'JetBrains Mono, monospace'}}
          />
        </div>
        <div style={{flex:1, backgroundColor:'#fff', borderRadius:'10px', padding:'20px', overflowY:'auto'}}>
          <h3 style={{fontSize:'1.1rem', color:'#007bff', marginBottom:'10px'}}>Output:</h3>
          <div dangerouslySetInnerHTML={{__html: output}}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
