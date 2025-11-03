const runCode = async () => {
  if (!pyodide) {
    setOutput(prev => prev + "⏳ Loading Pyodide...\n");
    return;
  }

  setExecuting(true);
  let outputText = '';

  // 🧹 تفريغ stdout قبل كل تشغيل
  pyodide._module.stdout = "";
  pyodide._module.stderr = "";

  // ⚙️ إعداد stdout وstderr
  pyodide.setStdout({
    batched: (text) => {
      outputText += text;
    },
  });
  pyodide.setStderr({
    batched: (text) => {
      outputText += "⚠️ " + text;
    },
  });

  try {
    await pyodide.runPythonAsync(code);

    // 🧾 التأكد من وجود أسطر جديدة صحيحة
    const formattedOutput = outputText
      ? outputText.replace(/\r?\n/g, '\n')
      : "✅ Code executed successfully, but no output.";

    // 💡 تحديث الإخراج مع سطر جديد بين كل تنفيذ وآخر
    setOutput(prev => prev + formattedOutput + "\n----------------------\n");

  } catch (err) {
    setOutput(prev => prev + "❌ Execution error:\n" + err.message + "\n");
  } finally {
    setExecuting(false);
  }
};
export default App;