import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';

const PREFIX = process.env.PREFIX || "!";   
const BOT_NAME = "👻 Ghost Bot";
const OWNER = "2348118015884";   // Your number

console.log(`🤖 ${BOT_NAME} Advanced Version Starting...`);

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
            if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(`✅ ${BOT_NAME} is Online!`);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const jid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid || "";

        if (!text.startsWith(PREFIX)) return;

        const args = text.slice(PREFIX.length).trim().split(/\s+/);
        const cmd = args[0]?.toLowerCase();

        if (cmd === "menu" || cmd === "help") {
            await sock.sendMessage(jid, { 
                text: `${BOT_NAME}\n\n🔰 Prefix: \( {PREFIX}\n\nCommands:\n \){PREFIX}menu\n\( {PREFIX}ping\n \){PREFIX}owner` 
            });
        }

        if (cmd === "ping") {
            await sock.sendMessage(jid, { text: "🏓 Pong! Ghost Bot is alive!" });
        }

        if (cmd === "owner") {
            await sock.sendMessage(jid, { text: `👑 Bot Owner: +${OWNER}` });
        }

        // Simple Admin Check
        function isOwner(s) {
            return s.replace(/\D/g, "").includes(OWNER);
        }

        if (cmd === "admin") {
            if (!isOwner(sender)) {
                return sock.sendMessage(jid, { text: "❌ No permission!" });
            }
            await sock.sendMessage(jid, { text: "👑 Admin Panel\nYou are the owner!" });
        }
    });
}

startBot().catch(err => console.error('Error:', err));
