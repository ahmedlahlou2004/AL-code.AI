import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './index.css'; // استيراد التنسيقات

function App() {
  // الكود الافتراضي
  const initialCode = `# اكتب كود بايثون هنا (مرحباً بالعالم!)\nprint("السطر الأول")\nprint("السطر الثاني")\n\n# عند التنفيذ مرتين، سيتم الفصل بينهما بفاصل مرئي`;
  
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // Pyodide Loading Logic
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // تأكد من وجود دالة loadPyodide المتاحة في النافذة
        if (!window.loadPyodide) {
             throw new Error("Pyodide script not loaded in index.html. Check the <script> tag.");
        }
        
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
        setPyodide(pyodideInstance);
        setLoading(false);
      } catch (err) {
        setOutput("⚠️ فشل في تحميل Pyodide:\n" + err.message + "\n");
      }
    };
    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) {
      setOutput(prev => prev + "⏳ Pyodide قيد التحميل...\n");
      return;
    }

    setExecuting(true);
    let outputText = '';
    let errorText = '';
    
    // توجيه إخراج الكونسول والخطأ لـ Pyodide
    pyodide.setStdout({
      batched: (text) => { outputText += text; },
    });
    pyodide.setStderr({
        batched: (text) => { errorText += text; },
    });

    try {
      // 1. إضافة فاصل مرئي لنتيجة التنفيذ الجديدة
      const separator = "\n--- [ بـدايـة التنـفيـذ ] ---\n";
      
      // 2. تشغيل الكود
      await pyodide.runPythonAsync(code);
      
      // 3. تحديث حالة الإخراج
      if (errorText.trim()) {
          // إذا كان هناك خطأ (stderr)
          setOutput(prev => 
              prev + 
              separator + 
              "❌ خطأ في التنفيذ:\n" + 
              errorText.trim() + 
              "\n--- [ نـهـايـة التنـفيـذ بخطأ ] ---\n\n"
          );
      } else {
          // إذا تم بنجاح (stdout)
          setOutput(prev =>
              prev +
              separator +
              (outputText.trim() || "✅ تم التنفيذ بنجاح، لكن لا يوجد إخراج.") +
              "\n--- [ نـهـايـة التنـفيـذ ] ---\n\n"
          );
      }
      
    } catch (err) {
      // التقاط الأخطاء غير المتوقعة (مثل SyntaxError)
      const errorOutput = errorText.trim() || err.message;
      setOutput(prev => 
        prev + 
        "\n--- [ بـدايـة التنـفيـذ ] ---\n" +
        "❌ خطأ غير متوقع:\n" + 
        errorOutput + 
        "\n--- [ نـهـايـة التنـفيـذ بخطأ ] ---\n\n"
      );
    } finally {
      setExecuting(false);
      // إعادة تعيين الإخراج والخطأ للوضع الافتراضي
      pyodide.setStdout(window.console.log); 
      pyodide.setStderr(window.console.error);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#dff6ff',
      fontFamily: 'Cairo, sans-serif', // استخدام الخط العربي هنا
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        AL-code.AI - محرر بايثون
      </header>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column', // Layout Stacked for Mobile first
        padding: '20px',
        gap: '20px'
      }}>
        {/* Editor Area */}
        <div style={{
          flex: 1,
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              automaticLayout: true,
              fontFamily: 'JetBrains Mono, monospace' // التأكد من استخدام خط المونو للكود
            }}
          />
        </div>

        {/* Output and Controls Area */}
        <div style={{
          flex: 1,
          minHeight: '40vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={runCode}
              disabled={loading || executing}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#ccc' : 'linear-gradient(45deg, #007bff, #00ff99)',
                color: loading ? '#666' : '#fff',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 10px rgba(0,123,255,0.4)',
                transform: executing ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {loading ? 'جاري التحميل...' : executing ? 'جاري التنفيذ...' : 'تنفيذ الكود 🚀'}
            </button>

            <button
              onClick={clearOutput}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                background: '#ff4d4d',
                color: '#fff',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(255, 77, 77, 0.4)'
              }}
            >
              مسح الإخراج 🗑️
            </button>
          </div>
          
          <h3 style={{
            fontSize: '1.2rem',
            color: '#333',
            marginBottom: '10px',
            borderBottom: '2px solid #eee',
            paddingBottom: '5px'
          }}>
            شاشة الإخراج (Output)
          </h3>

          {/* Output Display Area - Using 'output-pre' class from index.css */}
          <pre className="output-pre">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;

