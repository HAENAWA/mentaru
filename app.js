const apiKey = 'YOUR_API_KEY'; // ChatGPTのAPIキーをここに記入
const startButton = document.getElementById('start-button');
const sendButton = document.getElementById('send-button');
const textInput = document.getElementById('text-input'); // テキスト入力フィールド
const resultText = document.getElementById('result-text'); // 音声認識結果を表示する場所
const conversationHistory = document.getElementById('conversation-history'); // 会話履歴を表示する場所

// 音声認識の設定
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ja-JP'; // 言語設定 (日本語)
recognition.interimResults = false; // 暫定結果を表示しない
recognition.maxAlternatives = 1;

// ボタンをクリックしたら音声認識を開始
startButton.addEventListener('click', () => {
    recognition.start();
    resultText.textContent = "Listening..."; // 認識開始時に表示
});

// 音声認識が成功した場合
recognition.addEventListener('result', (event) => {
    const speechResult = event.results[0][0].transcript;
    resultText.textContent = `あなたが言ったこと: ${speechResult}`; // 認識した内容を表示
    appendToConversationHistory(`あなた: ${speechResult}`, 'user-message'); // 会話履歴に追加

    // ストレスレベルを評価する簡単なロジック
    handleResponse(speechResult);
});

// テキスト送信ボタンをクリックしたときの処理
sendButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        resultText.textContent = `あなたが入力したこと: ${text}`; // 入力した内容を表示
        appendToConversationHistory(`あなた: ${text}`, 'user-message'); // 会話履歴に追加
        handleResponse(text); // テキストの内容でレスポンスを処理
        textInput.value = ''; // 入力フィールドをクリア
    }
});

// ストレスレベルを評価する関数
function handleResponse(inputText) {
    let moodResponse;
    if (inputText.includes("ストレス") || inputText.includes("辛い")) {
        moodResponse = "大変ですね。何かお手伝いできることがありますか？";
    } else if (inputText.includes("嬉しい") || inputText.includes("楽しい")) {
        moodResponse = "良かったですね！その気持ちを大切にしてください。";
    } else {
        moodResponse = "あなたの気持ちを聞かせてくれてありがとう。";
    }

    appendToConversationHistory(`ロボット: ${moodResponse}`, 'robot-message'); // ロボットの返答を会話履歴に追加

    // ChatGPT APIに送信する部分
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: inputText }]
        })
    })
    .then(response => response.json())
    .then(data => {
        const gptResponse = data.choices[0].message.content;
        appendToConversationHistory(`ChatGPT: ${gptResponse}`, 'gpt-message'); // ChatGPTの返答を会話履歴に追加
    })
    .catch(error => {
        resultText.textContent += `\nError: ${error.message}`;
    });
}

// エラー時の処理
recognition.addEventListener('error', (event) => {
    resultText.textContent = `認識中にエラーが発生しました: ${event.error}`;
});

// 会話履歴に追加する関数
function appendToConversationHistory(text, messageClass) {
    const newMessage = document.createElement('div');
    newMessage.textContent = text;
    newMessage.classList.add(messageClass); // メッセージのクラスを追加
    conversationHistory.appendChild(newMessage);
    conversationHistory.scrollTop = conversationHistory.scrollHeight; // 最新のメッセージを表示
}