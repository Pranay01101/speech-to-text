import React from "react";

const VoiceControls = ({
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  speaking,
}) => {
  // Filter voices to show multilingual options prominently
  const getVoicesByLanguage = () => {
    const voicesByLang = {};
    voices.forEach((voice) => {
      const lang = voice.lang.split("-")[0]; // Get base language code
      if (!voicesByLang[lang]) {
        voicesByLang[lang] = [];
      }
      voicesByLang[lang].push(voice);
    });
    return voicesByLang;
  };

  const voicesByLanguage = getVoicesByLanguage();

  return (
    <div className="voice-controls">
      <div className="control-group">
        <label htmlFor="voice-select">Voice:</label>
        <select
          id="voice-select"
          value={selectedVoice ? selectedVoice.name : ""}
          onChange={(e) => {
            const voice = voices.find((v) => v.name === e.target.value);
            onVoiceChange(voice);
          }}
          className="voice-select"
          disabled={speaking}
        >
          <option value="">Default Voice</option>
          {Object.entries(voicesByLanguage).map(([lang, langVoices]) => (
            <optgroup key={lang} label={`${lang.toUpperCase()} Voices`}>
              {langVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="rate-control">Speech Rate: {rate.toFixed(1)}x</label>
        <input
          id="rate-control"
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={rate}
          onChange={(e) => onRateChange(parseFloat(e.target.value))}
          className="range-control"
        />
        <div className="range-labels">
          <span>Slow</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="pitch-control">Pitch: {pitch.toFixed(1)}</label>
        <input
          id="pitch-control"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={pitch}
          onChange={(e) => onPitchChange(parseFloat(e.target.value))}
          className="range-control"
        />
        <div className="range-labels">
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceControls;
