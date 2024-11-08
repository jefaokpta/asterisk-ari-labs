/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/8/24
 */
require('dotenv').config();
const AST_HOST = process.env.AST_HOST
const AST_USER = process.env.AST_USER
const AST_PASS = process.env.AST_PASS
const WebSocket = require('ws');

const ws = new WebSocket(`ws://${AST_HOST}/ari/events?app=externalMedia`, {
    headers: {
        'Authorization': `Basic ${Buffer.from(`${AST_USER}:${AST_PASS}`).toString('base64')}`
    },
});

ws.on('open', () => {
    console.log('Websocker conectado ao Asterisk');
})

ws.on('message', (data) => {
    console.log('mensagem recebida: ', data);
})

ws.on('close', () => {
    console.log('Websocket desconectado');
})

ws.on('error', (err) => {
    console.error('Erro: ', err.message);
})
