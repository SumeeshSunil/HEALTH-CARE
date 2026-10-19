import express from 'express';

// Express receives HTTP requests and sends responses to the frontend.
const app = express();
const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a whole number between 1 and 65535.');
}

// Read JSON request bodies. Later, login and appointment forms will send JSON.
app.use(express.json({ limit: '100kb' }));
app.disable('x-powered-by');

// A health check confirms the API server is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Healthcare backend is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Healthcare API: http://localhost:${port}/api/health`);
});

server.on('error', (err) => {
  console.error(`Could not start the API: ${err.message}`);
  process.exitCode = 1;
});
