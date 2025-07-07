import React, { useState, useRef, useEffect } from 'react';

export default function SpeechRecognition() {
  const [status, setStatus] = useState('SpeechRecognition');
  const [resultText, setResultText] = useState('Press "Start" button to start...');
  const [fontSize, setFontSize] = useState(1);
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textStyle, setTextStyle] = useState('default');
  const [textWidth, setTextWidth] = useState(250);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#008000');
  const [language, setLanguage] = useState('ja-JP');
  const [viewHeight, setViewHeight] = useState('');
  const [viewVisibility, setViewVisibility] = useState('visible');

  const viewRef = useRef<HTMLDivElement>(null);
  const speechFlagRef = useRef(false);

  const handleFontSizeChange = (size: number) => {
    if (size === 0) {
      setFontSize(1);
    } else {
      setFontSize(prev => prev + size);
    }
  };

  const handleTextStyleChange = (style: string) => {
    setTextStyle(style);
  };

  const SpeechRecognitionAPI = 
    (window as any).speechRecognition ||
    (window as any).webkitSpeechRecognition;

  const startRecognition = () => {
    if (!SpeechRecognitionAPI) {
      setStatus('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onsoundstart = () => {
      setStatus('Listening...');
    };

    recognition.onnomatch = () => {
      setStatus('Try again');
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setStatus('Error!! Retrying...');
      if (!speechFlagRef.current) {
        startRecognition();
      }
    };

    recognition.onsoundend = () => {
      setStatus('Paused');
      startRecognition();
    };

    recognition.onresult = (e: any) => {
      const results = e.results;
      for (let i = e.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          setResultText(results[i][0].transcript);
          startRecognition();
        } else {
          setResultText(results[i][0].transcript);
          speechFlagRef.current = true;
        }
      }
      if (viewRef.current) {
        viewRef.current.scrollTop = viewRef.current.scrollHeight;
      }
    };

    speechFlagRef.current = false;
    recognition.start();
  };

  const handleStart = () => {
    startRecognition();
    setResultText('');
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'f') {
        setViewHeight('100vh');
      }
      if (e.key === 'Escape') {
        setViewHeight('');
      }
      if (e.key === 'c') {
        setViewVisibility(prev => prev === 'hidden' ? 'visible' : 'hidden');
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div>
      <section id="control">
        <h1 id="status">{status}</h1>
        <button type="button" onClick={handleStart}>
          Start
        </button>
        <div id="control__settings">
          <div>
            <label>
              Font size({fontSize}rem):
            </label>
            <button
              type="button"
              onClick={() => handleFontSizeChange(-1)}
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange(-0.5)}
            >
              -0.5
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange(0)}
            >
              Base
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange(0.5)}
            >
              +0.5
            </button>
            <button
              type="button"
              onClick={() => handleFontSizeChange(1)}
            >
              +1
            </button>
          </div>
          <div>
            <label>Font weight:</label>
            <select
              value={fontWeight}
              onChange={(e) => setFontWeight(e.target.value)}
            >
              <option value="normal">Default</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <div>
            <label>Font style:</label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
            >
              <option value="normal">Default</option>
              <option value="italic">Italic</option>
            </select>
          </div>
          <div>
            <label>Text style:</label>
            <select
              value={textStyle}
              onChange={(e) => handleTextStyleChange(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="bubble">Bubble</option>
            </select>
          </div>
          <div>
            <label>
              Text width({textWidth}px):
            </label>
            <input
              type="range"
              min="0"
              max="1920"
              value={textWidth}
              onChange={(e) => setTextWidth(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Text color:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>
          <div>
            <label>Background color:</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </div>
          <div>
            <label>Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="id-ID">Bahasa Indonesia</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
              <option value="de-DE">Deutsch</option>
              <option value="fil-PH">Filipino</option>
              <option value="fr-FR">Français</option>
              <option value="it-IT">Italiano</option>
              <option value="nb-NO">Norsk bokmål</option>
              <option value="ru-RU">Pусский</option>
              <option value="uk-UA">Українська</option>
              <option value="ko-KR">한국어</option>
              <option value="cmn-Hans-CN">普通话 (中国大陆)</option>
              <option value="cmn-Hant-TW">中文 (台灣)</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
        </div>
      </section>
      <section
        id="view"
        ref={viewRef}
        style={{
          backgroundColor: bgColor,
          height: viewHeight,
          visibility: viewVisibility as 'visible' | 'hidden'
        }}
      >
        <div
          id="result-text"
          className={`message__style--${textStyle}`}
          style={{
            width: `${textWidth}px`,
            fontSize: `${fontSize}rem`,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            color: textColor
          }}
        >
          {resultText}
        </div>
      </section>
    </div>
  );
}
