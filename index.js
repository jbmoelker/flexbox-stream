const express = require('express');
const fs = require('fs');

const app = express();
const port = 3539; // "flex" in T9

app.get('/', (req, res) => {

    const timeStarted = Date.now();
    const timestamp = () => ((Date.now() - timeStarted) / 1000) + 's';

    res.write('<html lang="en">');
    res.write(fs.readFileSync('src/head.html')); // contains are `.flexbox-order` styles
    res.write('<body>');
    res.write(fs.readFileSync('src/header.html'));
    res.write(fs.readFileSync('src/footer.html'));
    res.write('<main class="flexbox-order">');

    // These delays are to simulate individual parts being fetched asynchronously.
    // For instance because of a remote API call which causes an unknown delay.
    writeDelayed(fs.readFileSync('src/hero.html'), { order: 1, delay: 1750 });
    writeDelayed(fs.readFileSync('src/diagram.html'), { order: 2, delay: 2500 });
    writeDelayed(fs.readFileSync('src/article.html'), { order: 3, delay: 900 });

    // Close stream after all delayed writes are finished. Should code this properly.
    setTimeout(() => res.end('</main></body></html>'), 2600);

    function writeDelayed(content, options) {
        setTimeout(() => res.write(orderHtml(content, options.order)), options.delay);
    }

    function orderHtml(html, order) {
        return `
            <div data-order="${order}" data-timestamp="${timestamp()}">
                ${html}
            </div>
        `;
    }

    // Note: should be able to write everything as piped streams? But closes when combined with timeout :-/
    // setTimeout(() => fs.createReadStream('src/later.html').pipe(res), 1000);
    // fs.createReadStream('src/header.html').pipe(res);
});

app.listen(port, () => console.log('Demo server available on http://localhost:' + port));