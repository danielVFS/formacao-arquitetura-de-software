import { useState } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    const input = {
      name,
      email,
      document,
      password,
    };

    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const outputSign = await response.json();

    if (outputSign.accountId) {
      setMessage("success");
    } else {
      setMessage(outputSign.error || "Error signing up");
    }
  }

  return (
    <>
      <div>
        <input
          className="input-name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input-document"
          placeholder="Document"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
        />
        <input
          className="input-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button-signup" onClick={() => signUp()}>
          Sign Up
        </button>

        {message && <span className="span-message">{message}</span>}
      </div>
    </>
  );
}

export default App;
