const https = require('https');

function getUnsplashId(query) {
  return new Promise((resolve) => {
    https.get('https://unsplash.com/s/photos/' + encodeURIComponent(query), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /href="\/photos\/([a-zA-Z0-9-]+)"/;
        const match = data.match(regex);
        if (match) {
          resolve(match[1]);
        } else {
          resolve(null);
        }
      });
    });
  });
}

async function run() {
  const queries = ['fried chicken', 'tofu dish', 'chili sauce', 'indonesian food'];
  for (const q of queries) {
    const id = await getUnsplashId(q);
    console.log(q, id);
  }
}
run();
