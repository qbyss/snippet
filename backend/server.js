const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// File paths
const SNIPPETS_FILE = path.join(__dirname, 'data', 'snippets.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// Helper functions
async function readSnippets() {
  try {
    const data = await fs.readFile(SNIPPETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading snippets:', error);
    return [];
  }
}

async function writeSnippets(snippets) {
  try {
    await fs.writeFile(SNIPPETS_FILE, JSON.stringify(snippets, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing snippets:', error);
    return false;
  }
}

async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default settings if file doesn't exist
    return { autoCopy: false };
  }
}

async function writeSettings(settings) {
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
}

// API Routes

// Get all snippets
app.get('/api/snippets', async (req, res) => {
  const snippets = await readSnippets();
  res.json(snippets);
});

// Add a new snippet
app.post('/api/snippets', async (req, res) => {
  const { command, keywords, description } = req.body;

  if (!command || !keywords || keywords.length === 0) {
    return res.status(400).json({ error: 'Command and keywords are required' });
  }

  const snippets = await readSnippets();
  const newSnippet = {
    id: Date.now().toString(),
    command,
    keywords: Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()),
    description: description || ''
  };

  snippets.push(newSnippet);
  const success = await writeSnippets(snippets);

  if (success) {
    res.status(201).json(newSnippet);
  } else {
    res.status(500).json({ error: 'Failed to save snippet' });
  }
});

// Delete a snippet
app.delete('/api/snippets/:id', async (req, res) => {
  const { id } = req.params;
  const snippets = await readSnippets();
  const filteredSnippets = snippets.filter(s => s.id !== id);

  if (filteredSnippets.length === snippets.length) {
    return res.status(404).json({ error: 'Snippet not found' });
  }

  const success = await writeSnippets(filteredSnippets);

  if (success) {
    res.json({ message: 'Snippet deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

// Get settings
app.get('/api/settings', async (req, res) => {
  const settings = await readSettings();
  res.json(settings);
});

// Update settings
app.post('/api/settings', async (req, res) => {
  const settings = req.body;
  const success = await writeSettings(settings);

  if (success) {
    res.json(settings);
  } else {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Snippet Manager running on http://0.0.0.0:${PORT}`);
});
