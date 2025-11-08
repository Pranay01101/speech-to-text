import { useState, useEffect, useRef, useCallback } from "react";

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(null);
  const utteranceRef = useRef(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    if ("speechSynthesis" in window) {
      setIsSupported(true);

      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Load voices immediately
      loadVoices();

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      setIsSupported(false);
      setError("Speech synthesis is not supported in this browser.");
    }
  }, []);

  // Speak function
  const speak = useCallback(
    (text, options = {}) => {
      if (!isSupported) {
        setError("Speech synthesis is not supported.");
        return;
      }

      if (!text.trim()) {
        setError("Please enter some text to speak.");
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const segments = text.match(/[\u0900-\u097F\s.,!?]+|[^\u0900-\u097F]+/g) || [];

      const utterances = segments.map(segment => {
        const utterance = new SpeechSynthesisUtterance(segment.trim());
        const isHindi = /[\u0900-\u097F]/.test(segment);
        let voice;

        if (isHindi) {
          // For Hindi text, prioritize finding a Hindi voice
          voice = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('hi'));
        } else {
          // For non-Hindi text, use the selected voice from the dropdown
          voice = options.voice;
        }

        // If a specific voice is found, use it.
        if (voice) {
          utterance.voice = voice;
        }
        
        // Set language for the utterance for better browser voice selection fallback
        utterance.lang = isHindi ? 'hi-IN' : (options.lang || 'en-US');
        
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
        return utterance;
      }).filter(utterance => utterance.text.length > 0);

      let currentIndex = 0;

      const speakNext = () => {
        if (currentIndex < utterances.length) {
          const currentUtterance = utterances[currentIndex];
          
          currentUtterance.onstart = () => {
            setSpeaking(true);
            setPaused(false);
            setError(null);
          };

          currentUtterance.onend = () => {
            currentIndex++;
            speakNext();
          };

          currentUtterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            setError(`Speech error: ${event.error}`);
            currentIndex++;
            speakNext();
          };

          // Add event handlers for pause and resume
          currentUtterance.onpause = () => setPaused(true);
          currentUtterance.onresume = () => setPaused(false);

          utteranceRef.current = currentUtterance;
          window.speechSynthesis.speak(currentUtterance);
        } else {
          setSpeaking(false);
          setPaused(false);
          utteranceRef.current = null;
        }
      };

      speakNext();
    },
    [isSupported, voices]
  );

  // Pause function
  const pause = useCallback(() => {
    if (isSupported && speaking && !paused) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, speaking, paused]);

  // Resume function
  const resume = useCallback(() => {
    if (isSupported && speaking && paused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, speaking, paused]);

  // Stop function
  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
};
