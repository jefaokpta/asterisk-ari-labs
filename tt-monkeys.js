/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/8/24
 */
require('dotenv').config();
const ari = require('ari-client');
const util = require('util');

const AST_HOST = 'http://' + process.env.AST_HOST
const AST_USER = process.env.AST_USER
const AST_PASS = process.env.AST_PASS

ari.connect(AST_HOST, AST_USER, AST_PASS, clientLoaded);

// handler for client being loaded
function clientLoaded (err, client) {
    if (err) {
        throw err;
    }
    console.log('Connected to Asterisk: App carregado');

    // handler for StasisStart event
    function stasisStart(event, channel) {
        console.log(util.format(
            'Monkeys! Attack %s!', channel.caller, channel.dialplan));

        const playback = client.Playback();
        channel.play({media: 'sound:tt-monkeys'}, playback, function(err, newPlayback) {
                if (err) {
                    throw err;
                }
            });
        playback.on('PlaybackFinished', playbackFinished);

        function playbackFinished(event, completedPlayback) {
            console.log(util.format(
                'Monkeys successfully vanquished %s; hanging them up',
                channel.name));
            channel.hangup(function(err) {
                if (err) {
                    throw err;
                }
            });
        }
    }

    // handler for StasisEnd event
    function stasisEnd(event, channel) {
        console.log(util.format(
            'Channel %s just left our application', channel.name));
    }

    client.on('StasisStart', stasisStart);
    client.on('StasisEnd', stasisEnd);

    client.start('channel-playback-monkeys');
}