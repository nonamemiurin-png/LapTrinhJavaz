document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesArea = document.getElementById('messages-area');
    const fileUpload = document.getElementById('file-upload');
    const uploadStatus = document.getElementById('upload-status');

    // Handle File Upload
    fileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadStatus.textContent = 'Đang tải lên và xử lý...';
        uploadStatus.style.color = '#eab308'; // yellow

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                uploadStatus.textContent = '✅ Đã tải lên và học xong tài liệu!';
                uploadStatus.style.color = '#4ade80'; // green
            } else {
                uploadStatus.textContent = '❌ Lỗi khi tải lên.';
                uploadStatus.style.color = '#ef4444'; // red
            }
        } catch (error) {
            uploadStatus.textContent = '❌ Không thể kết nối tới server.';
            uploadStatus.style.color = '#ef4444';
        }
        
        // Reset file input
        fileUpload.value = '';
    });

    // Handle Chat Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Get selected mode
        const mode = document.querySelector('input[name="model-mode"]:checked').value;

        // Add user message to UI
        appendMessage('user', message);
        chatInput.value = '';

        // Add loading indicator
        const loadingId = appendLoading();

        try {
            if (mode === 'compare') {
                const response = await fetch('/api/evaluate/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });
                
                const data = await response.json();
                removeLoading(loadingId);
                appendCompareMessage(data);

            } else {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message, mode: mode })
                });
                
                const data = await response.json();
                removeLoading(loadingId);
                appendMessage('bot', data.answer, data.sources, data.mode);
            }
        } catch (error) {
            removeLoading(loadingId);
            appendMessage('bot', 'Xin lỗi, đã có lỗi xảy ra khi kết nối với máy chủ.');
        }
    });

    function appendMessage(sender, text, sources = null, modeName = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        let sourcesHtml = '';
        if (sources && sources.length > 0) {
            sourcesHtml = `<div class="message-sources">Nguồn: ${sources.join(', ')}</div>`;
        }

        let modeBadge = '';
        if (modeName) {
            modeBadge = `<div style="font-size:11px; color:#818cf8; margin-bottom:6px; text-transform:uppercase;">[${modeName} MODE]</div>`;
        }

        msgDiv.innerHTML = `
            <div class="avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">
                ${modeBadge}
                ${text.replace(/\n/g, '<br>')}
                ${sourcesHtml}
            </div>
        `;
        
        messagesArea.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendCompareMessage(data) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message bot`;
        
        const rag = data.rag_model;
        const ft = data.fine_tuned_model;

        msgDiv.innerHTML = `
            <div class="avatar">⚖️</div>
            <div class="message-content" style="width: 100%;">
                <div class="compare-container">
                    <div class="compare-box">
                        <div class="compare-title">RAG (Retrieval-Augmented)</div>
                        <p>${rag.answer.replace(/\n/g, '<br>')}</p>
                        ${rag.sources ? `<div class="message-sources">Nguồn: ${rag.sources.join(', ')}</div>` : ''}
                    </div>
                    <div class="compare-box">
                        <div class="compare-title">Fine-Tuned Model</div>
                        <p>${ft.answer.replace(/\n/g, '<br>')}</p>
                        ${ft.sources ? `<div class="message-sources">Nguồn: ${ft.sources.join(', ')}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        messagesArea.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendLoading() {
        const id = 'loading-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message bot`;
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesArea.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeLoading(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
});
