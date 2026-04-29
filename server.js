const { createServer } = require('http');
const next = require('next');

const app = next({ 
  dev: false, 
  dir: __dirname,
  conf: require('./.next/required-server-files.json').config 
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    return handle(req, res);
  });
  
  server.listen(3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Ready on http://0.0.0.0:3000');
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
});
