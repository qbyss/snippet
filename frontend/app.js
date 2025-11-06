// API base URL
const API_URL = window.location.origin;

// State
let snippets = [];
let filteredSnippets = [];
let selectedIndex = -1;
let autoCopyEnabled = false;

// DOM elements
const searchInput = document.getElementById('searchInput');
const snippetList = document.getElementById('snippetList');
const emptyState = document.getElementById('emptyState');
const addButton = document.getElementById('addButton');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const cancelButton = document.getElementById('cancelButton');
const snippetForm = document.getElementById('snippetForm');
const autoCopyToggle = document.getElementById('autoCopyToggle');
const resultCount = document.getElementById('resultCount');
const notification = document.getElementById('notification');

// Initialize app
async function init() {
    await loadSettings();
    await loadSnippets();
    setupEventListeners();
    searchInput.focus();
}

// Load settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/api/settings`);
        const settings = await response.json();
        autoCopyEnabled = settings.autoCopy || false;
        autoCopyToggle.checked = autoCopyEnabled;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings
async function saveSettings() {
    try {
        await fetch(`${API_URL}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autoCopy: autoCopyEnabled })
        });
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Load snippets
async function loadSnippets() {
    try {
        const response = await fetch(`${API_URL}/api/snippets`);
        snippets = await response.json();
        filterSnippets();
    } catch (error) {
        console.error('Error loading snippets:', error);
        showNotification('Error loading snippets', 'error');
    }
}

// Filter snippets based on search input
function filterSnippets() {
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        filteredSnippets = [...snippets];
    } else {
        const queryWords = query.split(/\s+/);
        filteredSnippets = snippets.filter(snippet => {
            const searchableText = [
                snippet.command,
                snippet.description,
                ...snippet.keywords
            ].join(' ').toLowerCase();

            return queryWords.every(word => searchableText.includes(word));
        });
    }

    selectedIndex = filteredSnippets.length > 0 ? 0 : -1;
    renderSnippets();
}

// Render snippets
function renderSnippets() {
    snippetList.innerHTML = '';

    resultCount.textContent = `${filteredSnippets.length} snippet${filteredSnippets.length !== 1 ? 's' : ''} found`;

    if (filteredSnippets.length === 0) {
        emptyState.classList.add('visible');
        snippetList.style.display = 'none';
        return;
    }

    emptyState.classList.remove('visible');
    snippetList.style.display = 'block';

    filteredSnippets.forEach((snippet, index) => {
        const div = document.createElement('div');
        div.className = 'snippet-item';
        if (index === selectedIndex) {
            div.classList.add('selected');
        }

        div.innerHTML = `
            <div class="snippet-header">
                <div class="snippet-command">${escapeHtml(snippet.command)}</div>
                <div class="snippet-actions">
                    <button class="btn btn-danger delete-btn" data-id="${snippet.id}" onclick="event.stopPropagation()">
                        Delete
                    </button>
                </div>
            </div>
            ${snippet.description ? `<div class="snippet-description">${escapeHtml(snippet.description)}</div>` : ''}
            <div class="snippet-keywords">
                ${snippet.keywords.map(k => `<span class="keyword-tag">${escapeHtml(k)}</span>`).join('')}
            </div>
        `;

        div.addEventListener('click', () => selectSnippet(index));
        snippetList.appendChild(div);
    });

    // Add delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSnippet(btn.dataset.id));
    });

    // Scroll selected item into view
    if (selectedIndex >= 0) {
        const selectedElement = snippetList.children[selectedIndex];
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
}

// Select snippet
function selectSnippet(index) {
    selectedIndex = index;
    renderSnippets();

    if (autoCopyEnabled && filteredSnippets[index]) {
        copyToClipboard(filteredSnippets[index].command);
    }
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotification('Failed to copy to clipboard', 'error');
    }
}

// Delete snippet
async function deleteSnippet(id) {
    if (!confirm('Are you sure you want to delete this snippet?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/snippets/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Snippet deleted successfully');
            await loadSnippets();
        } else {
            showNotification('Failed to delete snippet', 'error');
        }
    } catch (error) {
        console.error('Error deleting snippet:', error);
        showNotification('Error deleting snippet', 'error');
    }
}

// Add snippet
async function addSnippet(command, keywords, description) {
    try {
        const response = await fetch(`${API_URL}/api/snippets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command, keywords, description })
        });

        if (response.ok) {
            showNotification('Snippet added successfully');
            await loadSnippets();
            closeModalWindow();
        } else {
            showNotification('Failed to add snippet', 'error');
        }
    } catch (error) {
        console.error('Error adding snippet:', error);
        showNotification('Error adding snippet', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} visible`;

    setTimeout(() => {
        notification.classList.remove('visible');
    }, 3000);
}

// Open modal
function openModal() {
    modal.classList.add('visible');
    document.getElementById('commandInput').focus();
}

// Close modal
function closeModalWindow() {
    modal.classList.remove('visible');
    snippetForm.reset();
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', filterSnippets);

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (filteredSnippets.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filteredSnippets.length - 1);
            renderSnippets();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderSnippets();
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            if (autoCopyEnabled) {
                copyToClipboard(filteredSnippets[selectedIndex].command);
            } else {
                // Select the text in the snippet for manual copy
                const selectedSnippet = snippetList.children[selectedIndex];
                if (selectedSnippet) {
                    const commandElement = selectedSnippet.querySelector('.snippet-command');
                    const range = document.createRange();
                    range.selectNodeContents(commandElement);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    showNotification('Snippet selected - press Cmd/Ctrl+C to copy');
                }
            }
        }
    });

    // Auto-copy toggle
    autoCopyToggle.addEventListener('change', () => {
        autoCopyEnabled = autoCopyToggle.checked;
        saveSettings();
        showNotification(`Auto-copy ${autoCopyEnabled ? 'enabled' : 'disabled'}`);
    });

    // Add button
    addButton.addEventListener('click', openModal);

    // Close modal
    closeModal.addEventListener('click', closeModalWindow);
    cancelButton.addEventListener('click', closeModalWindow);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalWindow();
        }
    });

    // Form submit
    snippetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const command = document.getElementById('commandInput').value.trim();
        const keywordsInput = document.getElementById('keywordsInput').value.trim();
        const description = document.getElementById('descriptionInput').value.trim();

        const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);

        if (command && keywords.length > 0) {
            addSnippet(command, keywords, description);
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModalWindow();
        }
    });
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
