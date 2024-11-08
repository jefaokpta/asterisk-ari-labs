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

ari.connect(AST_HOST, AST_USER, AST_PASS, clientLoaded);

// handler for client being loaded
function clientLoaded (err, client) {
    if (err) {
        throw err;
    }

    // find or create a holding bridge
    let bridge = null;
    client.bridges.list(function(err, bridges) {
        if (err) {
            throw err;
        }

        bridge = bridges.filter(function(candidate) {
            return candidate.bridge_type === 'holding';
        })[0];

        if (bridge) {
            console.log(util.format('Using bridge %s', bridge.id));
        } else {
            client.bridges.create({type: 'holding'}, function(err, newBridge) {
                if (err) {
                    throw err;
                }

                bridge = newBridge;
                console.log(util.format('Created bridge %s', bridge.id));
            });
        }
    });

    // handler for StasisStart event
    function stasisStart(event, channel) {
        console.log(util.format(
            'Channel %s just entered our application, adding it to bridge %s',
            channel.name,
            bridge.id));

        channel.answer(function(err) {
            if (err) {
                throw err;
            }

            bridge.addChannel({channel: channel.id}, function(err) {
                if (err) {
                    throw err;
                }

                bridge.startMoh(function(err) {
                    if (err) {
                        throw err;
                    }
                });
            });
        });
    }

    // handler for StasisEnd event
    function stasisEnd(event, channel) {
        console.log(util.format(
            'Channel %s just left our application', channel.name));
    }

    client.on('StasisStart', stasisStart);
    client.on('StasisEnd', stasisEnd);

    client.start('bridge-hold');
}