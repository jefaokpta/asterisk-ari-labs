/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 11/8/24
 */

require('dotenv').config();
const AST_HOST = 'http://' + process.env.AST_HOST
const AST_USER = process.env.AST_USER
const AST_PASS = process.env.AST_PASS

const ari = require('ari-client');
const util = require('util');

const timers = {};
ari.connect(AST_HOST, AST_USER, AST_PASS, clientLoaded);

// handler for client being loaded
function clientLoaded (err, client) {
    if (err) {
        throw err;
    }

    // handler for StasisStart event
    function stasisStart(event, channel) {
        console.log(util.format(
            'Channel %s has entered the application no estado %s', channel.name, channel.state));

        channel.ring(function(err) {
            if (err) {
                throw err;
            }
        });
        // answer the channel after 2 seconds
        const timer = setTimeout(answer, 2000);
        timers[channel.id] = timer;

        // callback that will answer the channel
        function answer() {
            console.log(util.format('Answering channel %s', channel.name));
            channel.answer(function(err) {
                if (err) {
                    throw err;
                }
            });
            channel.startSilence(function(err) {
                if (err) {
                    throw err;
                }
            });
            // hang up the channel in 4 seconds
            const timer = setTimeout(hangup, 4000);
            timers[channel.id] = timer;
        }

        // callback that will hangup the channel
        function hangup() {
            console.log(util.format('Hanging up channel %s', channel.name));
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
        const timer = timers[channel.id];
        if (timer) {
            clearTimeout(timer);
            delete timers[channel.id];
        }
    }

    // handler for ChannelStateChange event
    function channelStateChange(event, channel) {
        console.log(util.format(
            'Channel %s is now: %s', channel.name, channel.state));
    }

    client.on('StasisStart', stasisStart);
    client.on('StasisEnd', stasisEnd);
    client.on('ChannelStateChange', channelStateChange);

    client.start('channel-state');
}