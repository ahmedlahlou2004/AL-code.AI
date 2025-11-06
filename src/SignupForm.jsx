import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setMessage(`تم إنشاء الحساب: ${userCredential.user.email}`);
    } catch (error) {
      setMessage(`خطأ: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" required />
      <button type="submit">تسجيل</button>
      {message && <p>{message}</p>}
    </form>
  );
}