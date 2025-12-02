import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../home.css";
import jsPDF from 'jspdf';
import useScript from "../hooks/useScript";
import MermaidDiagram from "../components/MermaidDiagram";

const Home = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [mermaidSvg, setMermaidSvg] = useState(null); // Store SVG for PDF
  const [summaryError, setSummaryError] = useState(false);
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing your document");
  const [wordLimit, setWordLimit] = useState(200);
  const [language, setLanguage] = useState("English");
  const [audioState, setAudioState] = useState("stopped"); // "playing", "paused", "stopped"
  const [audioUrl, setAudioUrl] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(null);
  const [zoom, setZoom] = useState(1);
  
  const navigate = useNavigate();
  const razorpayScriptStatus = useScript('https://checkout.razorpay.com/v1/checkout.js');

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
    Urdu: { code: 'ur-IN', nativeName: 'اردو', translateCode: 'ur' }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      
      const user = await response.json();
      if (user.isSubscribed) {
        const now = new Date();
        const expiresAt = new Date(user.subscriptionExpiresAt);
        setSubscriptionExpiresAt(expiresAt);
        if (expiresAt > now) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(false);
        setSubscriptionExpiresAt(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setIsSubscribed(false); // Assume not subscribed on error
      setSubscriptionExpiresAt(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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

  useEffect(() => {
    if (loading) {
      const messages = [
        "Analyzing your document...",
        "Extracting key points...",
        "Summarizing the content...",
        "Finalizing the summary...",
      ];
      let messageIndex = 0;
      setLoadingText(messages[messageIndex]);

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingText(messages[messageIndex]);
      }, 3000); // Change message every 3 seconds

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

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState("stopped");
    }
  };

  const handleDownloadPDF = async () => {
    if (!summary) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Policy Summary', margin, margin);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    // Add Summary Text
    const splitText = doc.splitTextToSize(summary, maxWidth);
    doc.text(splitText, margin, margin + 10);
    
    // Calculate height of text block
    const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor; 
    const textHeight = splitText.length * lineHeight * 1.15; // Approx line height factor
    let currentY = margin + 10 + textHeight + 10; // Margin + Title + Text + Gap

    // Add Flow Diagram if available
    if (mermaidSvg) {
      try {
        // Convert SVG string to PNG via Canvas
        const svgData = mermaidSvg;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Proper encoding for SVG data URL
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Set canvas size to match image (or scaled)
            canvas.width = img.width * 2; // High res
            canvas.height = img.height * 2;
            ctx.scale(2, 2);
            ctx.fillStyle = 'white'; // PDF needs white background usually
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate dimensions for PDF
            // Fit width to page margins, keep aspect ratio
            const imgProps = doc.getImageProperties(imgData);
            const pdfImgWidth = maxWidth;
            const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

            // Check if new page is needed
            if (currentY + pdfImgHeight > pageHeight - margin) {
               doc.addPage();
               currentY = margin;
            }

            doc.text("Flow Diagram:", margin, currentY);
            doc.addImage(imgData, 'PNG', margin, currentY + 5, pdfImgWidth, pdfImgHeight);
            
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        });
      } catch (err) {
        console.error("Error adding diagram to PDF:", err);
        doc.text("(Diagram could not be generated in PDF)", margin, currentY);
      }
    }
    
    // Footer Date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    // Position at bottom of current page (or next if filled)
    doc.text(`Generated on ${date}`, margin, pageHeight - 10);
    
    doc.save('policy-summary.pdf');
  };

  const handlePayment = async (onSuccess) => {
    if (razorpayScriptStatus !== 'ready') {
      alert('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const orderUrl = "http://localhost:5000/api/payment/create-order";
      const orderResponse = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({
          amount: 99, // 99 INR
          currency: "INR",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order.");
      }

      const order = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Policy Summarizer",
        description: "30-Day Subscription",
        order_id: order.id,
        handler: async (response) => {
          const verificationUrl = "http://localhost:5000/api/payment/verify-payment";
          const verificationResponse = await fetch(verificationUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount / 100,
              currency: order.currency,
            }),
          });

          const verificationData = await verificationResponse.json();
          if (verificationData.status === "success") {
            await fetchUser(); // Refetch user to update subscription status
            onSuccess();
          } else {
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong with the payment. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a PDF file first!");
      return;
    }

    const performSubmit = async () => {
      setLoading(true);
      setSummary("");
      setMermaidCode("");
      setMermaidSvg(null); // Reset SVG
      setTranslatedSummary("");
      setSummaryError(false);
      setAudioUrl(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("wordLimit", wordLimit);
      formData.append("language", language);

      // --- Fetch 1: Summary ---
      const fetchSummary = async () => {
          try {
            const response = await fetch(
              "http://localhost:5678/webhook/8e4885d1-670f-4fad-9e45-4022f25d3fd7",
              {
                method: "POST",
                body: formData,
                mode: "cors",
                headers: { Accept: "application/json, text/plain" },
              }
            );

            if (!response.ok) {
              throw new Error(`Summary HTTP error! status: ${response.status}`);
            }
      
            const contentType = response.headers.get("content-type");
            let summaryText = "";

            if (contentType && contentType.includes("application/json")) {
              const json = await response.json();
              // The user specified the format is: [{ useroutput: "...", chatbot: "..." }]
              if (Array.isArray(json) && json.length > 0 && json[1].useroutput) {
                summaryText = json[1].useroutput;
              } else {
                // Fallback for unexpected JSON structure
                summaryText = JSON.stringify(json, null, 2);
              }
            } else {
              summaryText = await response.text();
            }
      
            summaryText = summaryText.trim() || "✅ Summary generated successfully.";
            setSummary(summaryText);

            // --- NEW: Save the summary as the context for the chatbot ---
            try {
              const token = localStorage.getItem("token");
              await fetch("http://localhost:5000/api/chatbot/session", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "auth-token": token,
                },
                body: JSON.stringify({ context: summaryText }),
              });
              console.log("Chatbot context updated successfully.");
            } catch (error) {
              console.error("Error updating chatbot context:", error);
            }

            // --- FIX for 9-minute audio delay ---
            // Only send a short snippet of the summary to the TTS service to prevent timeouts.
            const ttsSnippet = summaryText.substring(0, 250); // Send first 250 chars for audio
            console.log("Sending truncated snippet to TTS service:", ttsSnippet);

            try {
              const ttsResponse = await fetch("http://localhost:5001/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: ttsSnippet, // Use the short snippet
                  lang: languageConfig[language].translateCode,
                }),
              });
              const blob = await ttsResponse.blob();
              const url = URL.createObjectURL(blob);
              setAudioUrl(url);
            } catch (error) {
              console.error("Error pre-fetching audio:", error);
            }

            // Save the FULL summary to the database
            try {
              const token = localStorage.getItem("token");
              await fetch("http://localhost:5000/api/summary/add", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "auth-token": token,
                },
                body: JSON.stringify({ summaryText, wordLimit, language }),
              });
            } catch (error) {
              console.error("Error saving summary:", error);
            }

            if (language !== 'English') {
              const translated = await translateText(summaryText, language);
              setTranslatedSummary(translated);
            }
        } catch (error) {
            console.error("❌ Summary Upload error:", error);
            const errorMessage = "❌ Upload failed. Please check your webhook connection.";
            setSummary(errorMessage);
            setTranslatedSummary(errorMessage);
            setSummaryError(true);
        }
      };

      // --- Fetch 2: Mermaid Diagram ---
      const fetchMermaid = async () => {
          try {
              const response = await fetch(
                "http://localhost:5678/webhook/703361df-aa5d-47e7-8b5a-f3e1cea4acc1",
                {
                    method: "POST",
                    body: formData, // Sending same file/data
                    mode: "cors",
                }
              );
              
              if (!response.ok) throw new Error("Mermaid webhook failed");
              const data = await response.json();
              
              // Expecting: { mermaid: "..." } or [{ mermaid: "..." }]
              let code = Array.isArray(data) ? data[0]?.mermaid : data?.mermaid;
              
              if (code) {
                  // Try to extract code block if present
                  const match = code.match(/```mermaid\s*([\s\S]*?)\s*```/i);
                  if (match && match[1]) {
                      code = match[1].trim();
                  } else {
                      code = code.replace(/```mermaid/gi, '').replace(/```/g, '').trim();
                  }
                  
                  // Escape parentheses and single quotes inside node labels [label] to prevent syntax errors
                  // Replaces ( with #40;, ) with #41;, and ' with #39; ONLY inside the square brackets
                  code = code.replace(/\[([^\]]+)\]/g, (match, label) => {
                      const escapedLabel = label.replace(/\(/g, '#40;').replace(/\)/g, '#41;').replace(/'/g, '#39;');
                      return `[${escapedLabel}]`;
                  });

                  setMermaidCode(code);
              }
          } catch (error) {
              console.error("Mermaid fetch error:", error);
              // We don't show an error to user for this secondary feature
          }
      };

      try {
          await Promise.all([fetchSummary(), fetchMermaid()]);
      } finally {
          setLoading(false);
      }
    };

    const needsSubscription = wordLimit >= 1000 || (language && language !== 'English' && language !== 'Hindi');

    if (needsSubscription) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/payment/check-subscription", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        if (response.ok) {
          await performSubmit();
        } else {
          navigate('/pricing');
        }
      } catch (error) {
        console.error("Subscription check error:", error);
        alert("Could not verify subscription status. Please try again.");
      }
    } else {
      // No subscription needed, proceed directly
      await performSubmit();
    }
  };

  const handlePlayPause = async () => {
    const performPlay = () => {
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
        audioRef.current.onended = () => setAudioState("stopped");
      }
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/payment/check-subscription", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      if (response.ok) {
        performPlay();
      } else {
                  navigate('/pricing');      }
    } catch (error) {
      console.error("Subscription check error:", error);
      alert("Could not verify subscription status. Please try again.");
    }
  };
  
  return (
    <div className="summarizer-container">
      <div className="summarizer-card">
        {/* Header */}
        <div className="header">
          <div>
            <h2><b>Policy Summarizer</b></h2>
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

                  {summary && !summaryError && (
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

        {/* Flow Diagram Section - Moved Below */}
        {mermaidCode && (
          <div className="flow-diagram-section">
            <div className="diagram-header">
              <h4>Flow Diagram</h4>
              <div className="zoom-controls">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom Out">➖</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} title="Zoom In">➕</button>
                <button onClick={() => setZoom(1)} title="Reset Zoom">🔄</button>
              </div>
            </div>
            <div className="mermaid-scroll-container">
              <div className="mermaid-wrapper" style={{ minWidth: `${zoom * 100}%` }}>
                <MermaidDiagram chart={mermaidCode} onRender={setMermaidSvg} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;