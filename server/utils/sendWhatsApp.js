// WhatsApp utility using whatsapp-web.js (ESM)
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

const client = new Client({
    authStrategy: new LocalAuth()
});

let isWhatsAppReady = false;

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above with your WhatsApp to authenticate.');
});

client.on('ready', () => {
    isWhatsAppReady = true;
    console.log('WhatsApp client is ready!');
});

client.initialize();

/**
 * Send a WhatsApp message to a number
 * @param {string} number - WhatsApp number in international format (e.g., '919999999999')
 * @param {string} message - Message to send
 */
export function sendWhatsApp(number, message) {
    if (!isWhatsAppReady) {
        console.error('WhatsApp client is not ready. Cannot send message.');
        return;
    }
    // WhatsApp number must be in the format: 919999999999@c.us
    client.sendMessage(`${number}@c.us`, message);
} 