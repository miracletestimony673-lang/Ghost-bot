import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs-extra';

const PREFIX = process.env.PREFIX || "°";   
const BOT_NAME = "👻 Ghost Bot";

console.log(`🤖 ${BOT_NAME} is Starting... Prefix: ${PREFIX}`);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: { level: 'silent' }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(`✅ ${BOT_NAME} Connected Successfully!`);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Message Handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const jid = msg.key.remoteJid;

        if (!text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).trim().split(/\s+/);
        const cmd = args[0]?.toLowerCase();

        if (cmd === "help" || cmd === "menu") {
            await sock.sendMessage(jid, { 
                text: `${BOT_NAME}\n\n🔰 Prefix: ${PREFIX}\n\nCommands coming soon...\nType ${PREFIX}help anytime` 
            });
        }

        console.log(`Command: ${cmd}`);
    });
}

startBot().catch(err => console.error('Error starting bot:', err));
