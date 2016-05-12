'use strict';

const es = require('event-stream');
const express = require('express');
const fs = require('fs');

const app = express();
const port = 3539; // "flex" in T9

const timestamp = (timeStarted) => ((Date.now() - timeStarted) / 1000) + 's';

function contentStream(files, startTime) {
    return es.readable(function (count, cb) {
        const stream = this;
        const file = files[count];

        if(!file){
            return stream.emit('end');
        }

        fs.readFile(file.name, 'utf8', function (err, result) {
            if(err){
                stream.emit('error');
            }
            setTimeout(() => {
                stream.emit('data', orderHtml(result, file.order, timestamp(startTime)));
                cb();
            }, file.delay);
        });
    });
}

function orderHtml(html, order, timestamp) {
    return `
        <div data-order="${order}" data-timestamp="${timestamp}">
            ${html}
        </div>
    `;
}

app.get('/', (req, res) => {

    const timeStarted = Date.now();
    const files = [
        {name: 'src/hero.html', order: 1, delay: 1750 },
        {name: 'src/diagram.html', order: 2, delay: 2500 },
        {name: 'src/article.html',  order: 3, delay: 900 }
    ];
    const tail = '</main></body></html>';

    res.write('<html lang="en">');
    res.write(fs.readFileSync('src/head.html')); // contains are `.flexbox-order` styles
    res.write('<body>');
    res.write(fs.readFileSync('src/header.html'));
    res.write(fs.readFileSync('src/footer.html'));
    res.write('<main class="flexbox-order">');

    contentStream(files, timeStarted).pipe(res).on('end', () => {
        res.write(tail);
    });
});

app.listen(port, () => console.log('Demo server available on http://localhost:' + port));
