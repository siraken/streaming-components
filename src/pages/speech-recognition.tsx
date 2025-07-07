(() => {
  const viewElement = document.getElementById('view') as HTMLElement;
  const resultElement = document.getElementById(
    'result-text',
  ) as HTMLDivElement;
  const statusElement = document.getElementById('status') as HTMLDivElement;
  const startButton = document.getElementById('start') as HTMLButtonElement;
  const settingsElement = {
    label: {
      fontSize: document.getElementById(
        'control__settings--font-size',
      ) as HTMLSpanElement,
      textWidth: document.getElementById(
        'control__settings--text-width',
      ) as HTMLSpanElement,
    },
    fontSizeButtons: document.querySelectorAll(
      '.control__settings--font-size-button',
    ) as NodeListOf<HTMLButtonElement>,
    fontWeight: document.getElementById(
      'control__settings--font-weight',
    ) as HTMLSelectElement,
    fontStyle: document.getElementById(
      'control__settings--font-style',
    ) as HTMLSelectElement,
    textStyle: document.getElementById(
      'control__settings--text-style',
    ) as HTMLSelectElement,
    textWidth: document.getElementById(
      'control__settings--text-width-input',
    ) as HTMLInputElement,
    textColor: document.getElementById(
      'control__settings--text-color',
    ) as HTMLInputElement,
    bgColor: document.getElementById(
      'control__settings--background-color',
    ) as HTMLInputElement,
    language: document.getElementById(
      'control__settings--language',
    ) as HTMLSelectElement,
  };

  // Properties
  let language = 'ja-JP';
  let fontSize: number = 1;

  // Flags
  let speechFlag: boolean = false;

  function setFontSize(size: number) {
    if (size === 0) {
      fontSize = 1;
    }
    fontSize += size;
    resultElement.style.fontSize = fontSize + 'rem';
    settingsElement.label.fontSize.innerHTML = fontSize.toString();
  }

  function setFontWeight(weight: string) {
    resultElement.style.fontWeight = weight;
  }

  function setFontStyle(style: string) {
    resultElement.style.fontStyle = style;
  }

  function setTextStyle(style: string) {
    // remove all classes from classList
    resultElement.classList.remove(...resultElement.classList);
    resultElement.classList.add(`message__style--${style}`);
  }

  function setTextWidth(width: string) {
    resultElement.style.width = `${width}px`;
    settingsElement.label.textWidth.innerHTML = width;
  }

  function setTextColor(color: string) {
    resultElement.style.color = color;
  }

  function setBackgroundColor(color: string) {
    viewElement.style.backgroundColor = color;
  }

  const SpeechRecognition =
    (window as any).speechRecognition ||
    (window as any).webkitSpeechRecognition;

  function main() {
    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onsoundstart = (e: any) => {
      statusElement.innerHTML = 'Listening...';
    };

    recognition.onnomatch = (e: any) => {
      statusElement.innerHTML = 'Try again';
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      statusElement.innerHTML = 'Error!! Retrying...';
      if (!speechFlag) {
        main();
      }
    };

    recognition.onsoundend = (e: any) => {
      statusElement.innerHTML = 'Paused';
      main();
    };

    recognition.onresult = (e: any) => {
      const results = e.results;
      for (let i = e.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          resultElement.innerHTML = results[i][0].transcript;
          main();
        } else {
          resultElement.innerHTML = results[i][0].transcript;
          speechFlag = true;
        }
      }
      viewElement.scrollTop = viewElement.scrollHeight;
    };
    speechFlag = false;
    recognition.start();
  }

  startButton.addEventListener('click', () => {
    main();
    resultElement.innerHTML = '';
  });

  settingsElement.fontSizeButtons.forEach((element: HTMLButtonElement) => {
    element.addEventListener('click', () => {
      setFontSize(Number(element.dataset.size));
    });
  });

  settingsElement.fontWeight.addEventListener('change', (e: any) => {
    setFontWeight(e.target.value);
  });

  settingsElement.fontStyle.addEventListener('change', (e: any) => {
    setFontStyle(e.target.value);
  });

  settingsElement.textStyle.addEventListener('change', (e: any) => {
    setTextStyle(e.target.value);
  });

  settingsElement.textWidth.addEventListener('input', (e: any) => {
    setTextWidth(e.target.value);
  });

  settingsElement.textColor.addEventListener('input', (e: any) => {
    setTextColor(e.target.value);
  });

  settingsElement.bgColor.addEventListener('input', (e: any) => {
    setBackgroundColor(e.target.value);
  });

  settingsElement.language.addEventListener('change', (e: any) => {
    language = e.target.value;
  });

  window.addEventListener('keydown', (e: any) => {
    if (e.key === 'f') {
      viewElement.style.height = '100vh';
    }
    if (e.key === 'Escape') {
      viewElement.style.height = '';
    }
    if (e.key === 'c') {
      if (viewElement.style.visibility === 'hidden') {
        viewElement.style.visibility = 'visible';
      } else {
        viewElement.style.visibility = 'hidden';
      }
    }
  });
})();

<div>
  <section id="control">
    <h1 id="status">SpeechRecognition</h1>
    <button type="button" id="start">
      Start
    </button>
    <div id="control__settings">
      <div>
        <label>
          Font size(<span id="control__settings--font-size"></span>rem):
        </label>
        <button
          type="button"
          class="control__settings--font-size-button"
          data-size="-1"
        >
          -1
        </button>
        <button
          type="button"
          class="control__settings--font-size-button"
          data-size="-0.5"
        >
          -0.5
        </button>
        <button
          type="button"
          class="control__settings--font-size-button"
          data-size="0"
        >
          Base
        </button>
        <button
          type="button"
          class="control__settings--font-size-button"
          data-size="0.5"
        >
          +0.5
        </button>
        <button
          type="button"
          class="control__settings--font-size-button"
          data-size="1"
        >
          +1
        </button>
      </div>
      <div>
        <label>Font weight:</label>
        <select id="control__settings--font-weight">
          <option value="normal">Default</option>
          <option value="bold">Bold</option>
        </select>
      </div>
      <div>
        <label>Font style:</label>
        <select id="control__settings--font-style">
          <option value="normal">Default</option>
          <option value="italic">Italic</option>
        </select>
      </div>
      <div>
        <label>Text style:</label>
        <select id="control__settings--text-style">
          <option value="default">Default</option>
          <option value="bubble">Bubble</option>
        </select>
      </div>
      <div>
        <label>
          Text width(<span id="control__settings--text-width"></span>px):
        </label>
        <input
          id="control__settings--text-width-input"
          type="range"
          min="0"
          max="1920"
          value="250"
        />
      </div>
      <div>
        <label>Text color:</label>
        <input
          id="control__settings--text-color"
          type="color"
          value="#ffffff"
        />
      </div>
      <div>
        <label>Background color:</label>
        <input
          id="control__settings--background-color"
          type="color"
          value="#008000"
        />
      </div>
      <div>
        <label>Language:</label>
        <select id="control__settings--language">
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
          <option value="ja-JP" selected>
            日本語
          </option>
        </select>
      </div>
    </div>
  </section>
  <section id="view">
    <div id="result-text" class="message__style--default" style="width: 250px">
      Press "Start" button to start...
    </div>
  </section>
</div>;
