const express = require('express');

const app = express();
const PORT = 3221;

// Serve static files from current directory (no path, no __dirname)
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});
