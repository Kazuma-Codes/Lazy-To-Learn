import { useEffect, useRef, useState } from "react";

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem("chat-name") || "");
  const [draftName, setDraftName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!name) return;
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/messages");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setMessages(data);
      } catch {
        if (active) setError("Cannot reach the server.");
      }
    }

    load();
    const id = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [name]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function join(e) {
    e.preventDefault();
    const clean = draftName.trim();
    if (!clean) return;
    localStorage.setItem("chat-name", clean);
    setName(clean);
  }

  async function send(e) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;

    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text: clean }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Message could not be sent.");
      }
      setText("");
      const list = await (await fetch("/api/messages")).json();
      setMessages(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!name) {
    return (
      <main className="join">
        <form className="card" onSubmit={join}>
          <h1>Mosaic Lite</h1>
          <p>One room. Write in any language. Every message is translated to English.</p>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            maxLength={40}
            autoFocus
          />
          <button disabled={!draftName.trim()}>Join chat</button>
        </form>
      </main>
    );
  }

  return (
    <main className="chat">
      <header>
        <h1>Mosaic Lite</h1>
        <span>You are {name}</span>
      </header>

      <section className="messages">
        {messages.length === 0 && (
          <p className="empty">No messages yet. Say hello in any language.</p>
        )}
        {messages.map((m) => (
          <article className={m.name === name ? "bubble mine" : "bubble"} key={m._id}>
            <div className="meta">
              <strong>{m.name}</strong>
              <time>{new Date(m.createdAt).toLocaleTimeString()}</time>
            </div>
            <p>{m.text}</p>
          </article>
        ))}
        <div ref={endRef} />
      </section>

      {error && <p className="error">{error}</p>}

      <form className="composer" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type in any language..."
          maxLength={1000}
        />
        <button disabled={sending || !text.trim()}>
          {sending ? "Translating..." : "Send"}
        </button>
      </form>
    </main>
  );
}
