import express from 'express';
const app = express();
app.get('/{*catchAll}', (req, res) => res.send('ok'));
app.listen(3001, () => {
  console.log('Listening on 3001');
  fetch('http://localhost:3001/')
    .then(r => r.text())
    .then(t => console.log('/ ->', t));
  fetch('http://localhost:3001/about')
    .then(r => r.text())
    .then(t => console.log('/about ->', t));
  fetch('http://localhost:3001/assets/main.js')
    .then(r => r.text())
    .then(t => {
      console.log('/assets/main.js ->', t);
      process.exit(0);
    });
});
