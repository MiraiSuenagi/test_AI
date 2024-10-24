const API_KEY = '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'; // Твой ключ API

// Проверяем, поддерживает ли браузер API распознавания речи
if (!('webkitSpeechRecognition' in window)) {
    alert('Ваш браузер не поддерживает распознавание речи');
} else {
    // Создаем экземпляр SpeechRecognition
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ru-RU'; // Устанавливаем язык
    recognition.continuous = true; // Постоянное прослушивание
    recognition.interimResults = false; // Только окончательные результаты

    recognition.onstart = function() {
        console.log("Ассистент слушает...");
        const avatar = document.getElementById('avatar');
        avatar.classList.add("blinking", "moving-head", "smiling");
    };

    recognition.onresult = async function(event) {
        // Получаем распознанную фразу
        const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
        console.log("Вы сказали:", transcript);

        // Отправляем текст на обработку
        await getResponseFromChatGPT(transcript);
    };

    recognition.onerror = function(event) {
        console.error("Ошибка распознавания:", event.error);
        // Восстанавливаем прослушивание в случае ошибки
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert('Пожалуйста, включите доступ к микрофону.');
        } else if (event.error === 'network' || event.error === 'no-speech') {
            recognition.stop();
            recognition.start();
        }
    };

    // Запускаем прослушивание
    recognition.start();
}

// Функция для воспроизведения приветственного сообщения
function speakWelcomeMessage() {
    const welcomeMessage = "Задайте мне вопрос";
    const speech = new SpeechSynthesisUtterance(welcomeMessage);
    speech.lang = 'ru-RU';
    speech.onstart = () => {
        // Добавляем класс talking, когда аватар говорит
        document.getElementById('avatar').classList.add("talking");
    };
    speech.onend = () => {
        // Убираем класс talking, когда аватар закончил говорить
        document.getElementById('avatar').classList.remove("talking");
    };
    window.speechSynthesis.speak(speech);
}

// Функция для отправки вопроса и получения ответа
async function getResponseFromChatGPT(question) {
    let avatar = document.getElementById('avatar');
    avatar.classList.add("talking");

    try {
        // Отправляем запрос к ChatGPT
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: question }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const answer = data.choices[0].message.content;
            console.log("Ответ от ChatGPT:", answer);
            speakAnswer(answer);
        } else {
            console.error("Ошибка API:", response.statusText);
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }

    avatar.classList.remove("talking");
}

// Функция для преобразования ответа в речь
function speakAnswer(answer) {
    const speech = new SpeechSynthesisUtterance(answer);
    speech.lang = 'ru-RU';
    speech.onstart = () => {
        document.getElementById('avatar').classList.add("talking");
    };
    speech.onend = () => {
        document.getElementById('avatar').classList.remove("talking");
    };
    window.speechSynthesis.speak(speech);
}

// Воспроизводим приветственное сообщение при загрузке страницы
window.onload = function() {
    speakWelcomeMessage();
};
