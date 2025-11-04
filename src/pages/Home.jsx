import React, { useState, useRef, useEffect } from "react";
import "../home.css";
import policy from "../assets/Policy.png";

const Home = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordLimit, setWordLimit] = useState(700);
  const [language, setLanguage] = useState("English");
  const [audioState, setAudioState] = useState("stopped"); // "playing", "paused", "stopped"

  const fileInputRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utterRef = useRef(null);

  useEffect(() => {
    return () => synthRef.current.cancel();
  }, []);

  const handleChooseFile = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a PDF file first!");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("wordLimit", wordLimit);
      formData.append("language", language);

      const response = await fetch(
        "http://localhost:5678/webhook-test/7104db72-dd00-413f-8132-fddf6a0f4bf7",
        {
          method: "POST",
          body: formData,
          mode: "cors",
          headers: { Accept: "application/json, text/plain" },
        }
      );

      // Handle text or JSON webhook responses gracefully
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        data = json.output || JSON.stringify(json, null, 2);
      } else {
        data = await response.text();
      }

      setSummary(data.trim() || "✅ Summary generated successfully.");
    } catch (error) {
      console.error("❌ Upload error:", error);
      setSummary("❌ Upload failed. Please check your webhook connection.");
    } finally {
      setLoading(false);
    }
  };

  // ---- AUDIO CONTROLS ---- //
  const handlePlay = () => {
    if (!summary) return;
    synthRef.current.cancel();

    const utter = new SpeechSynthesisUtterance(summary);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onstart = () => setAudioState("playing");
    utter.onend = () => setAudioState("stopped");
    utter.onerror = () => setAudioState("stopped");

    utterRef.current = utter;
    synthRef.current.speak(utter);
  };

  const handlePause = () => {
    const synth = synthRef.current;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setAudioState("paused");
    } else if (synth.paused) {
      synth.resume();
      setAudioState("playing");
    }
  };

  const handleStop = () => {
    synthRef.current.cancel();
    setAudioState("stopped");
  };

  return (
    <div className="summarizer-container">
      <div className="summarizer-card">
        {/* Header */}
        <div className="header">
          <img src={policy} alt="Logo" className="logo" width="100" height="100" />
          <div>
            <h2>Policy Summarizer</h2>
            <p>
              Upload a PDF and get a concise summary. Choose summary length,
              bullet format, or keep tone.
            </p>
          </div>
        </div>

        <div className="form-output-container">
          {/* Left: Upload & Options */}
          <div className="form-section">
            <h3>Upload & Options</h3>

            <div className="drop-zone" onClick={handleChooseFile}>
              <span>{fileName || "Drop a PDF here or"}</span>
              <p className="subtext">
                Supports multipage PDFs. Max 20MB (adjust server-side).
              </p>
              <button type="button" className="choose-btn">
                Choose File
              </button>
            </div>

            <input
              type="file"
              accept="application/pdf"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className="options-group">
              <div className="word-section">
                <p>Words</p>
                <div className="word-buttons">
                  {[200, 700, 1000, 2000].map((num) => (
                    <button
                      key={num}
                      className={wordLimit === num ? "active" : ""}
                      onClick={() => setWordLimit(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lang-section">
                <p>Languages</p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>

          {/* Right: Output */}
          <div className="output-section">
            <h3>Output</h3>
            <div className="output-box">
              {loading ? (
                <p className="loader">Analyzing your document...</p>
              ) : (
                <>
                  <div className="scrollable-output">
                    <p className="summary-text">
                      {summary || "Your summary will appear here."}
                    </p>
                  </div>

                  {summary && (
                    <div className="audio-section">
                      <div className="audio-controls">
                        <button
                          className="audio-btn"
                          onClick={handlePlay}
                          disabled={audioState === "playing"}
                        >
                          ▶️ Play
                        </button>
                        <button
                          className="audio-btn"
                          onClick={handlePause}
                          disabled={audioState === "stopped"}
                        >
                          {audioState === "paused" ? "▶️ Resume" : "⏸ Pause"}
                        </button>
                        <button
                          className="audio-btn stop"
                          onClick={handleStop}
                          disabled={audioState === "stopped"}
                        >
                          ⏹ Stop
                        </button>
                      </div>

                      <div className="waveform">
                        {[0, 0.1, 0.2, 0.3, 0.4].map((delay) => (
                          <div
                            key={delay}
                            className={`bar ${
                              audioState === "playing" ? "animate" : ""
                            }`}
                            style={{ "--delay": `${delay}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
