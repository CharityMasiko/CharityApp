// public/js/chatbot.js - Client-side only
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Financial Education Chatbot...');
    
    // Get DOM elements
    const chatbotModal = document.getElementById('chatbotModal');
    const chatbotOverlay = document.getElementById('chatbotOverlay');
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    // Check if elements exist
    if (!chatbotToggle) {
        console.log('Chatbot button not found - skipping initialization');
        return;
    }
    
    console.log('All chatbot elements found successfully');
    
    // Show chatbot
    chatbotToggle.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Opening chatbot...');
        chatbotModal.style.display = 'block';
        chatbotOverlay.style.display = 'block';
        chatbotInput.focus();
    });
    
    // Close chatbot
    function closeChatbot() {
        chatbotModal.style.display = 'none';
        chatbotOverlay.style.display = 'none';
    }
    
    chatbotClose.addEventListener('click', closeChatbot);
    chatbotOverlay.addEventListener('click', closeChatbot);
    
    // Send message function
    async function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;
        
        console.log('Sending message:', message);
        
        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';
        
        // Disable send button during request
        chatbotSend.disabled = true;
        chatbotSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const userId = getCurrentUserId();
            
            const response = await fetch('/api/education/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    userId: userId
                })
            });
            
            const data = await response.json();
            console.log('API response:', data);
            
            if (data.success) {
                addMessage(data.response, 'bot');
            } else {
                addMessage('Error: ' + (data.message || 'Please try again.'), 'bot');
            }
            
        } catch (error) {
            console.error('Chatbot error:', error);
            addMessage('Network error. Please check your connection and try again.', 'bot');
        } finally {
            // Re-enable send button
            chatbotSend.disabled = false;
            chatbotSend.innerHTML = '<i class="fas fa-paper-plane"></i>';
            chatbotInput.focus();
        }
    }
    
    // Event listeners for sending
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const icon = sender === 'bot' ? 'robot' : 'user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
                <small class="message-time">${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    console.log('Chatbot initialized successfully!');
});

// Get user ID 
function getCurrentUserId() {
    // Try to get from session or global variable
    return window.userId || 1; // Temporary fix
}