const DeviceMonitor = require('castv2-device-monitor').DeviceMonitor;
const Player = require('mpris-service');

const chromecastName = "Skycast";

const player = Player({
    name: chromecastName,
    identity: chromecastName,
    supportedUriSchemes: ['file'],
    supportedMimeTypes: ['audio/mpeg', 'application/ogg'],
    supportedInterfaces: ['player'],
    rate: 1.0,
    volume: 1.0,
    minimumRate: 1.0,
    maximumRate: 1.0,
    position: 0,
    canGoNext: false,
    canGoPrevious: false,
    canPlay: true,
    canPause: true,
    canSeek: false,
    canControl: true
});

player.on('quit', () => {
    process.exit();
});

player.on('pause', () => {
    dm.pauseDevice();
});

player.on('playpause', () => {
    if (dm.playState === 'play') {
        dm.pauseDevice();
    } else {
        dm.playDevice();
    }
});

player.on('play', () => {
    dm.playDevice();
});

player.on('stop', () => {
    dm.stopDevice();
});

player.on('volume', volume => {
    dm.setVolume(volume);
});

const dm = new DeviceMonitor(chromecastName);
dm.on('powerState', powerState => {
    if (powerState !== 'on') {
        player.playbackStatus = 'Stopped';
    }
});
dm.on('application', application => {
    let title = '', artist = '';
    if (player.metadata && player.metadata['xesam:title']) {
        title = player.metadata['xesam:title']
    }
    if (player.metadata && player.metadata['xesam:artist']) {
        artist = player.metadata['xesam:artist']
    }
    player.metadata = {
        'mpris:trackid': player.objectPath('track/0'),
        'mpris:length': 0,
        'mpris:artUrl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Chromecast_cast_button_icon.svg/500px-Chromecast_cast_button_icon.svg.png',
        'xesam:title': title,
        'xesam:album': application,
        'xesam:artist': [artist]
    };

    player.playbackStatus = 'Playing';
    console.log("application");
    console.log(application);
});
dm.on('media', media => {
    let application = '', artist = [''];
    if (media.artist) {
        artist = [media.artist]
    }
    if (player.metadata && player.metadata['xesam:album']) {
        application = player.metadata['xesam:album']
    }
    player.metadata = {
        'mpris:trackid': player.objectPath('track/0'),
        'mpris:length': 0,
        'mpris:artUrl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Chromecast_cast_button_icon.svg/500px-Chromecast_cast_button_icon.svg.png',
        'xesam:title': media.title || '',
        'xesam:album': application,
        'xesam:artist': artist,
    };

    player.playbackStatus = 'Playing';
    console.log("media");
    console.log(media);
});
dm.on('volume', volume => {
    player.volume = volume;
});