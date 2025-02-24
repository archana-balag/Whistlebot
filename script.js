const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');

const RASA_SERVER_URL = "https://34.134.253.141:5005/webhooks/rest/webhook";  // Orchestrator Agent
const FEEDBACK_URL = "https://34.134.253.141:5005/webhooks/rest/webhook";  // Feedback logging

function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    appendMessage(`SuperYou🧑: ${message}`, "user-message");
    userInput.value = '';

    axios.post(RASA_SERVER_URL, { sender: 'user', message })
    .then(response => {
        response.data.forEach(item => {
            if (item.text) {
                appendMessage(makeURLsClickable(item.text), "bot-message", item.text);
            }
            if (item.image) {
                appendImage(item.image);
            }
            if (item.buttons) {
                appendButtons(item.buttons);
            }
        });
    })
    .catch(error => {
        appendMessage('⚠️ Error connecting to the server.', "bot-message", "red");
    });
}

function makeURLsClickable(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
}

function appendMessage(text, className, rawText) {
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    messageDiv.innerHTML = text;
    chatWindow.appendChild(messageDiv);

    // Add feedback buttons below each bot response
    if (className === "bot-message") {
        appendFeedbackButtons(messageDiv, rawText);
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendImage(imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = "bot-image";
    chatWindow.appendChild(img);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendButtons(buttons) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "button-container";
    
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = "chat-button";
        btn.innerText = button.title;
        btn.onclick = () => sendMessageFromButton(button.payload);
        buttonContainer.appendChild(btn);
    });

    chatWindow.appendChild(buttonContainer);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendFeedbackButtons(parentDiv, botText) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = "feedback-container";

    const thumbsUp = document.createElement('button');
    thumbsUp.className = "thumbs-up";
    thumbsUp.innerText = "👍";
    thumbsUp.onclick = () => sendFeedback('👍', botText);

    const thumbsDown = document.createElement('button');
    thumbsDown.className = "thumbs-down";
    thumbsDown.innerText = "👎";
    thumbsDown.onclick = () => sendFeedback('👎', botText);

    feedbackContainer.appendChild(thumbsUp);
    feedbackContainer.appendChild(thumbsDown);

    parentDiv.appendChild(feedbackContainer);
}

function sendFeedback(feedback, botText) {
    axios.post(FEEDBACK_URL, { sender: 'user', message: feedback, response_text: botText })
    .then(() => {
        appendMessage("✅ Thanks for your feedback!", "bot-message");
    })
    .catch(() => {
        appendMessage("⚠ Feedback submission failed.", "bot-message", "red");
    });
}
