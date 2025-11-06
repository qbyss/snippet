# Snippet Manager

A web-based snippet manager that lets you store, search, and copy frequently used commands and code snippets with ease. Access your snippets from anywhere in the world!

## Features

- **Keyword Search**: Type keywords to instantly filter and find your snippets
- **Keyboard Navigation**: Use arrow keys to navigate and Enter to select
- **Smart Clipboard**: Choose between auto-copy or manual copy (Cmd/Ctrl+C)
- **Easy Management**: Add and remove snippets through a clean web interface
- **Persistent Storage**: All snippets stored in JSON format
- **Docker Ready**: Run anywhere with Docker

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd snippet
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

4. **Stop the application**:
   ```bash
   docker-compose down
   ```

### Using Docker

1. **Build the image**:
   ```bash
   docker build -t snippet-manager .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 3000:3000 -v $(pwd)/backend/data:/app/backend/data snippet-manager
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

### Local Development

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding a Snippet

1. Click the **"+ Add Snippet"** button
2. Enter the command (e.g., `ls -lSh`)
3. Enter keywords separated by commas (e.g., `list, size, files`)
4. Optionally add a description
5. Click **"Save Snippet"**

### Finding and Using a Snippet

1. Type keywords in the search box (e.g., "list files")
2. Use arrow keys (↑/↓) to navigate through results
3. Press **Enter** to select a snippet
   - If auto-copy is enabled: snippet is automatically copied to clipboard
   - If auto-copy is disabled: snippet is selected, press Cmd/Ctrl+C to copy

### Auto-Copy Settings

Toggle the **"Auto-copy on select"** switch in the header to:
- **ON**: Automatically copy snippets to clipboard when selected with Enter
- **OFF**: Manually copy snippets with Cmd/Ctrl+C after selection

### Deleting a Snippet

Click the **"Delete"** button on any snippet card and confirm the deletion.

## Configuration

### Port

The default port is `3000`. To change it:

**Docker Compose**: Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Change 8080 to your desired port
```

**Docker**: Change the port mapping:
```bash
docker run -d -p 8080:3000 -v $(pwd)/backend/data:/app/backend/data snippet-manager
```

### Data Persistence

Snippets are stored in `backend/data/snippets.json`. This file is automatically created when you add your first snippet.

When using Docker, the data directory is mounted as a volume, so your snippets persist even if you restart or rebuild the container.

## Project Structure

```
snippet/
├── backend/
│   ├── data/
│   │   ├── snippets.json      # Snippet storage
│   │   └── settings.json      # App settings
│   ├── package.json           # Node.js dependencies
│   └── server.js              # Express server
├── frontend/
│   ├── index.html             # Main HTML
│   ├── styles.css             # Styling
│   └── app.js                 # Frontend logic
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # This file
```

## API Endpoints

The backend provides a REST API:

- `GET /api/snippets` - Get all snippets
- `POST /api/snippets` - Add a new snippet
- `DELETE /api/snippets/:id` - Delete a snippet
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

## Browser Compatibility

The application uses the modern Clipboard API and requires a recent browser version:

- Chrome/Edge 66+
- Firefox 63+
- Safari 13.1+

**Note**: Clipboard access requires HTTPS in production (localhost works with HTTP).

## Accessing from Anywhere

To access your snippet manager from anywhere in the world:

1. **Deploy to a cloud provider** (AWS, Google Cloud, DigitalOcean, etc.)
2. **Set up a reverse proxy** with Nginx or Apache
3. **Enable HTTPS** using Let's Encrypt or your provider's SSL
4. **Configure firewall** to allow traffic on your chosen port

Example deployment options:
- Docker on a VPS
- AWS ECS/Fargate
- Google Cloud Run
- DigitalOcean App Platform
- Heroku

## Security Notes

- This is a basic implementation intended for personal use
- Consider adding authentication if deploying publicly
- Use HTTPS in production for secure clipboard access
- Regularly backup your `backend/data/snippets.json` file

## Troubleshooting

**Clipboard not working?**
- Ensure you're using HTTPS (or localhost for development)
- Check browser permissions for clipboard access

**Container won't start?**
- Check if port 3000 is already in use: `lsof -i :3000`
- Check Docker logs: `docker-compose logs`

**Snippets not persisting?**
- Verify the data volume is mounted correctly
- Check file permissions in `backend/data/`

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!
