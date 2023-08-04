const express = require('express');
const app = express();
const client_view = require('./render_client.js');

app.use('/assets', express.static('assets'));
app.listen(process.env.PORT, () => console.log('Services start'));

app.get('/*', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(client_view.html());
})