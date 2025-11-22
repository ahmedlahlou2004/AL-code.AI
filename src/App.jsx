import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './index.css';

const correctPassword = 'med2025';

function App() {
  const initialCode = `import math

# Example: ln(x)
x = 10
ln_x = math.log(x)
print(f"ln({x}) = {ln_x}")`;

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
      const wrappedCode = `
import matplotlib.pyplot as plt
import io, base64, sys

plt.switch_backend('agg')

${code}

img_base64 = None
if plt.get_fignums():
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
`;
      await pyodide.runPythonAsync(wrappedCode);
      const end = performance.now();
      const time = (end - start).toFixed(2);
      const sep = '\n----------\n';

      const img = pyodide.globals.get('img_base64');
      const imageHTML = img
        ? `<img src="data:image/png;base64,${img}" style="max-width:100%; border-radius:10px; margin-top:10px;" />`
        : '';

      setOutput((prev) =>
        prev +
        sep +
        (errorLines.length
          ? `<span style="color:#ff4d4d">❌ Execution Error:\n${errorLines.join('')}</span>\n--- [ Error in ${time} ms ] ---\n\n`
          : `<span style="color:#00b894">${outputLines.join('') || '✅ Executed successfully.'}</span>\n⏱ Execution time: ${time} ms\n${imageHTML}\n----------\n\n`)
      );
    } catch (err) {
      setOutput((prev) =>
        prev + '\n----------\n❌ Unexpected Error:\n' + err.message + '\n--- [ Execution End ] ---\n\n'
      );
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

  const handleShare = () => {
    const codeEncoded = encodeURIComponent(code);
    const shareableLink = `${window.location.href}?code=${codeEncoded}`;
    navigator.clipboard.writeText(shareableLink);
    alert('Link copied to clipboard! The recipient will need the password to view the code.');
  };

  if (loading) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#f5f7fa', color:'#00b894', flexDirection:'column' }}>
        <div style={{ width:'70px', height:'70px', border:'6px solid rgba(0,0,0,0.1)', borderTopColor:'#00b894', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <p style={{marginTop:'20px'}}>🚀 Loading Pyodide {loadingProgress}%</p>
        <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', background:'linear-gradient(135deg, #e0f7fa, #c8e6c9)', color:'#333' }}>
        <h2 style={{marginBottom:'15px'}}>🔐 Enter password to access</h2>
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            padding:'12px 15px',
            borderRadius:'10px',
            border:'1px solid #a0d8ef',
            outline:'none',
            fontSize:'16px',
            background:'rgba(255,255,255,0.8)',
            color:'#333',
            textAlign:'center',
            boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(5px)'
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            marginTop:'15px',
            padding:'10px 20px',
            borderRadius:'10px',
            border:'none',
            cursor:'pointer',
            background:'rgba(0, 180, 148, 0.8)',
            color:'#fff',
            fontWeight:'600',
            boxShadow:'0 4px 12px rgba(0,0,0,0.2)',
            transition:'0.3s'
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', fontFamily:'Arial', backgroundColor:'#f5f7fa'}}>
      {/* HEADER */}
      <header
        style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          padding:'10px 20px',
          background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
          color:'#fff',
          fontWeight:'bold',
          fontSize:'1.3rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <span>⚡ AL-Code.AI</span>
        <button
          onClick={()=>setShowMenu(!showMenu)}
          style={{
            padding:'8px 15px',
            borderRadius:'8px',
            border:'none',
            cursor:'pointer',
            background:'rgba(255,255,255,0.2)',
            color:'#fff',
            fontWeight:'600'
          }}
        >
          ⚙️ Menu
        </button>
      </header>

      {showMenu && (
        <div style={{position:'absolute', top:'50px', right:'20px', background:'rgba(255,255,255,0.95)', borderRadius:'10px', boxShadow:'0 4px 15px rgba(0,0,0,0.1)', padding:'10px', zIndex:1000, display:'flex', flexDirection:'column', gap:'8px'}}>
          <button onClick={runCode} style={{background:'#4facfe', color:'#fff'}}>🚀 Run</button>
          <button onClick={clearOutput} style={{background:'#00b894', color:'#fff'}}>🗑️ Clear</button>
          <button onClick={restartApp} style={{background:'#00b894', color:'#fff'}}>🔄 Restart</button>
          <button onClick={undoCode} style={{background:'#aaa', color:'#fff'}}>↩️ Undo</button>
          <button onClick={redoCode} style={{background:'#aaa', color:'#fff'}}>↪️ Redo</button>
          <button onClick={()=>navigator.clipboard.writeText(code)} style={{background:'#4facfe', color:'#fff'}}>📑 Copy Code</button>
          <button onClick={()=>navigator.clipboard.writeText(output)} style={{background:'#4facfe', color:'#fff'}}>📋 Copy Output</button>
          <button onClick={pasteCode} style={{background:'#00b894', color:'#fff'}}>📥 Paste</button>
          <button onClick={handleShare} style={{background:'#4facfe', color:'#fff'}}>🔗 Share Code</button>
        </div>
      )}

      <div style={{flex:1, display:'flex', flexDirection:'column', padding:'20px', gap:'20px'}}>
        <div style={{flex:1, borderRadius:'10px', overflow:'hidden', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
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
        <div style={{flex:1, backgroundColor:'#ffffff', borderRadius:'10px', padding:'20px', overflowY:'auto', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
          <h3 style={{fontSize:'1.1rem', color:'#4facfe', marginBottom:'10px'}}>Output:</h3>
          <div dangerouslySetInnerHTML={{__html: output}}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
