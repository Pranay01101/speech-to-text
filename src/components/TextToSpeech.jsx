import React, { useState, useEffect } from "react";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import VoiceControls from "./VoiceControls";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en-US"); // Default to English
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    isSupported,
    voices,
    speaking,
    paused,
    error,
    speak,
    pause,
    resume,
    stop,
    clearError,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (voices.length > 0) {
      const defaultVoice = voices.find((voice) => voice.lang === lang);
      setSelectedVoice(defaultVoice || voices[0]);
    }
  }, [voices, lang]);
  // Sample texts for different languages
  const sampleTexts = [
    "Hello! This is a text to speech application that supports multiple languages.",
    "नमस्ते! यह एक टेक्स्ट टू स्पीच एप्लिकेशन है। Hello, this supports mixed languages too!",
    "Bonjour! Ceci est une application de synthèse vocale.",
    "¡Hola! Esta es una aplicación de texto a voz.",
    "こんにちは！これはテキスト読み上げアプリケーションです。",
  ];

  const handleSpeak = () => {
    if (text.trim()) {
      speak(text, {
        voice: selectedVoice,
        rate: rate,
        pitch: pitch,
        lang: lang,
      });
    }
  };

  const handleSampleText = (sampleText) => {
    setText(sampleText);
  };

  const handleClear = () => {
    setText("");
    stop();
  };

  if (!isSupported) {
    return (
      <div className="tts-container">
        <div className="error-message">
          <h2>⚠️ Browser Not Supported</h2>
          <p>
            Your browser doesn't support the Web Speech API. Please try using a
            modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
          <div className="lang-selector">
            <label htmlFor="lang-select">Select Language:</label>
            <select
              id="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              disabled={speaking && !paused}
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tts-container">
      <header className="tts-header">
        <h1>🎤 Text to Speech</h1>
        <p>
          Enter text below and click "Speak" to hear it read aloud. Supports
          multiple languages!
        </p>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="close-error">
            ×
          </button>
        </div>
      )}

      <div className="text-input-section">
        <label htmlFor="text-input">Enter text to speak:</label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text here... You can mix languages like: Hello! नमस्ते! How are you? आप कैसे हैं?"
          rows={6}
          className="text-input"
          disabled={speaking && !paused}
        />

        <div className="text-info">
          <span className="char-count">{text.length} characters</span>
          <button
            onClick={handleClear}
            className="clear-btn"
            disabled={speaking && !paused}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="sample-texts">
        <h3>Try these sample texts:</h3>
        <div className="sample-buttons">
          {sampleTexts.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleText(sample)}
              className="sample-btn"
              disabled={speaking && !paused}
            >
              Sample {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="playback-controls">
        <button
          onClick={handleSpeak}
          disabled={!text.trim() || (speaking && !paused)}
          className="control-btn speak-btn"
        >
          🔊 Speak
        </button>

        <button
          onClick={paused ? resume : pause}
          disabled={!speaking}
          className="control-btn pause-btn"
        >
          {paused ? "▶️ Resume" : "⏸️ Pause"}
        </button>

        <button
          onClick={stop}
          disabled={!speaking}
          className="control-btn stop-btn"
        >
          ⏹️ Stop
        </button>
      </div>

      <div className="status-indicator">
        {speaking && !paused && (
          <span className="status speaking">🔊 Processing...</span>
        )}
        {speaking && paused && <span className="status paused">⏸️ Paused</span>}
        {!speaking && <span className="status ready">✅ Ready</span>}
      </div>

      <div className="advanced-controls">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="toggle-advanced"
        >
          {showAdvanced ? "▼" : "▶"} Advanced Settings
        </button>

        {showAdvanced && (
          <VoiceControls
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            rate={rate}
            onRateChange={setRate}
            pitch={pitch}
            onPitchChange={setPitch}
            speaking={speaking}
          />
        )}
      </div>

      <footer className="tts-footer">
        <p>
          💡 <strong>Tip:</strong> This app works best with mixed language
          content. Try combining English and Hindi text for multilingual speech
          synthesis!
        </p>
        <p>
          <strong>Available voices:</strong> {voices.length}
          {voices.length > 0 &&
            ` (${
              new Set(voices.map((v) => v.lang.split("-")[0])).size
            } languages)`}
        </p>
      </footer>
    </div>
  );
};

export default TextToSpeech;
