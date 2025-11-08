import React, { useState, useRef, useEffect } from "react";
import "../home.css";
// import policy from "../assets/Policy.png";
import jsPDF from 'jspdf';

const Home = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing your document");
  const [wordLimit, setWordLimit] = useState(200);
  const [language, setLanguage] = useState("English");
  const [audioState, setAudioState] = useState("stopped"); // "playing", "paused", "stopped"
  const [audioUrl, setAudioUrl] = useState(null);
  const [voices, setVoices] = useState([]);
  
  // Language configuration with ISO codes and native names
  const languageConfig = {
    English: { code: 'en-US', nativeName: 'English', translateCode: 'en' },
    Hindi: { code: 'hi-IN', nativeName: 'हिन्दी', translateCode: 'hi' },
    Bengali: { code: 'bn-IN', nativeName: 'বাংলা', translateCode: 'bn' },
    Telugu: { code: 'te-IN', nativeName: 'తెలుగు', translateCode: 'te' },
    Marathi: { code: 'mr-IN', nativeName: 'मराठी', translateCode: 'mr' },
    Tamil: { code: 'ta-IN', nativeName: 'தமிழ்', translateCode: 'ta' },
    Gujarati: { code: 'gu-IN', nativeName: 'ગુજરાતી', translateCode: 'gu' },
    Kannada: { code: 'kn-IN', nativeName: 'ಕನ್ನಡ', translateCode: 'kn' },
    Odia: { code: 'or-IN', nativeName: 'ଓଡ଼ିଆ', translateCode: 'or' },
    Malayalam: { code: 'ml-IN', nativeName: 'മലയാളം', translateCode: 'ml' },
    Punjabi: { code: 'pa-IN', nativeName: 'ਪੰਜਾਬੀ', translateCode: 'pa' },
    Assamese: { code: 'as-IN', nativeName: 'অসমীয়া', translateCode: 'as' },
    Nepali: { code: 'ne-NP', nativeName: 'नेपाली', translateCode: 'ne' },
    Sanskrit: { code: 'sa-IN', nativeName: 'संस्कृतम्', translateCode: 'sa' },
    Urdu: { code: 'ur-IN', nativeName: 'اردو', translateCode: 'ur' }
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === 'English') return text;
    
    setTranslating(true);
    try {
      const targetCode = languageConfig[targetLang].translateCode;
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetCode}&dt=t&q=${encodeURIComponent(text)}`
      );
      
      const data = await response.json();
      // Extract translated text from the response
      const translatedText = data[0].map(x => x[0]).join('');
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    } finally {
      setTranslating(false);
    }
  };

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const loadingMessages = [
    "Analyzing...",
    "Figuring...",
    "Thinking...",
    "Deep Thinking...",
    "Framing...",
  ];

  useEffect(() => {
    if (loading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % loadingMessages.length;
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleChooseFile = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      setSummaryError(false); // Reset error state on new file selection
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a PDF file first!");
      return;
    }

    setLoading(true);
    setSummary("");
    setTranslatedSummary("");
    setSummaryError(false); // Reset error state on new submission
    setAudioUrl(null); // Reset audio URL

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        data = json.output || JSON.stringify(json, null, 2);
      } else {
        data = await response.text();
      }

      const summaryText = data.trim() || "✅ Summary generated successfully.";
      setSummary(summaryText);

      // Pre-fetch audio
      try {
        const ttsResponse = await fetch("http://localhost:5001/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: summaryText,
            lang: languageConfig[language].translateCode,
          }),
        });
        const blob = await ttsResponse.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (error) {
        console.error("Error pre-fetching audio:", error);
      }


      // Save the summary to the database
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:5000/api/summary/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({
            summaryText,
            wordLimit,
            language,
            
          }),
        });
      } catch (error) {
        console.error("Error saving summary:", error);
      }

      if (language !== 'English') {
        const translated = await translateText(summaryText, language);
        setTranslatedSummary(translated);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      const errorMessage = "❌ Upload failed. Please check your webhook connection.";
      setSummary(errorMessage);
      setTranslatedSummary(errorMessage);
      setSummaryError(true); // Set error state on failure
    } finally {
      setLoading(false);
    }
  };

  // ---- AUDIO CONTROLS ---- //
  const handlePlayPause = async () => {
    if (audioState === "playing") {
      audioRef.current.pause();
      setAudioState("paused");
    } else if (audioState === "paused") {
      audioRef.current.play();
      setAudioState("playing");
    } else {
      if (!audioUrl) return;
      setAudioState("playing");
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      audioRef.current.onended = () => {
        setAudioState("stopped");
      };
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState("stopped");
    }
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Add title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Policy Summary', margin, margin);
    
    // Add content
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    const splitText = doc.splitTextToSize(summary, maxWidth);
    doc.text(splitText, margin, margin + 10);
    
    // Add footer with date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${date}`, margin, doc.internal.pageSize.getHeight() - 10);
    
    // Save the PDF
    doc.save('policy-summary.pdf');
  };

  return (
    <div className="summarizer-container">
      <div className="summarizer-card">
        {/* Header */}
        <div className="header">
          {/* <img src={policy} alt="Logo" className="logo" width="100" height="100" /> */}
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
                  onChange={async (e) => {
                    setLanguage(e.target.value);
                    if (summary) {
                      const translated = await translateText(summary, e.target.value);
                      setTranslatedSummary(translated);
                    }
                  }}
                >
                  {Object.entries(languageConfig).map(([lang, config]) => (
                    <option key={lang} value={lang}>
                      {`${lang} (${config.nativeName})`}
                    </option>
                  ))}
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
                <div className="interactive-loader">
                  <div className="spinner"></div>
                  <p className="loader-text">{loadingText} 🧠</p>
                  <div className="progress-bar">
                    <div className="progress"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="scrollable-output">
                    <p className="summary-text">
                      {translating ? "Translating..." : 
                       (language === 'English' ? summary : translatedSummary) || 
                       "Your summary will appear here."}
                    </p>
                  </div>

                  {summary && (
                    <div className="audio-section">
                      <div className="audio-controls">
                        <button
                          className="audio-btn"
                          onClick={handlePlayPause}
                          disabled={!audioUrl}
                        >
                          {audioState === 'playing' && '⏸ Pause'}
                          {audioState === 'paused' && '▶️ Resume'}
                          {audioState === 'stopped' && '▶️ Play'}
                        </button>
                        <button
                          className="audio-btn stop"
                          onClick={handleReset}
                          disabled={audioState === "stopped"}
                        >
                          ⏹ Reset
                        </button>
                        <button
                          className="audio-btn download"
                          onClick={handleDownloadPDF}
                          disabled={!summary}
                        >
                          📥 Download PDF
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
