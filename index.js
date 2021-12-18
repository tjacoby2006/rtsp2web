require('dotenv').config();

const NodeMediaServer = require('node-media-server');

const relayTasks = [];
const transTasks = [];

let i = 1;
while (`RTSP_URL_${i}` in process.env && `RTSP_NAME_${i}` in process.env) {
    relayTasks.push({
        app: 'live',
        mode: 'static',
        edge: process.env[`RTSP_URL_${i}`],
        name: process.env[`RTSP_NAME_${i}`],
        rtsp_transport : 'tcp' //['udp', 'tcp', 'udp_multicast', 'http']
    });
    transTasks.push({
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
        name: process.env[`RTSP_NAME_${i}`]
    });
    i++;
}

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 80,
        allow_origin: '*',
        mediaroot: '/var/www/html/media',
    },
    relay: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: relayTasks
    },
    trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        tasks: transTasks
    }
};

const nms = new NodeMediaServer(config);
nms.run();
