// script.js

$(document).ready(function() {
    const chatBody = $('#chat-body');
    const chatForm = $('#chat-form');
    const messageInput = $('#message-input');
    const loadingSpinnerTemplate = $('#loading-spinner-template').html();

    // Function to append user message
    function appendUserMessage(message) {
        const messageElement = $(`
            <div class="chat-message user">
                <div class="message-content">
                    ${escapeHtml(message)}
                </div>
            </div>
        `);
        chatBody.append(messageElement);
        scrollToBottom();
    }

    // Function to append bot message
    function appendBotMessage(message) {
        const messageElement = $(`
            <div class="chat-message bot">
                <div class="message-content">
                    ${parseMarkdown(message)}
                </div>
            </div>
        `);
        chatBody.append(messageElement);
        scrollToBottom();
    }

    // Function to show loading spinner
    function showLoadingSpinner() {
        const loadingElement = $(`
            <div class="loading-message" id="loading-spinner">
                ${loadingSpinnerTemplate}
            </div>
        `);
        chatBody.append(loadingElement);
        scrollToBottom();
    }

    // Function to remove loading spinner
    function removeLoadingSpinner() {
        $('#loading-spinner').remove();
    }

    // Function to scroll chat to bottom
    function scrollToBottom() {
        chatBody.stop().animate({
            scrollTop: chatBody[0].scrollHeight
        }, 500);
    }

    // Function to escape HTML
    function escapeHtml(text) {
        return $('<div>').text(text).html();
    }

    // Function to parse Markdown (basic implementation)
    function parseMarkdown(text) {
        // Convert line breaks
        let parsedText = text.replace(/\n/g, '<br>');

        // Convert code blocks
        parsedText = parsedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Convert inline code
        parsedText = parsedText.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Convert bold text
        parsedText = parsedText.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

        // Convert italic text
        parsedText = parsedText.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

        return parsedText;
    }

    // Handle form submission
    chatForm.submit(function(e) {
        e.preventDefault();
        const message = messageInput.val().trim();
        if (message === '') return;
        
        appendUserMessage(message);
        messageInput.val('');
        showLoadingSpinner();

        // Send message to server
        $.ajax({
            url: '/chat',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ message: message }),
            success: function(response) {
                removeLoadingSpinner();
                appendBotMessage(response.response);
            },
            error: function() {
                removeLoadingSpinner();
                appendBotMessage('Oops! Something went wrong. Please try again.');
            }
        });
    });
});
