Jelo.mold('Platform', function(window) {
    var ua = window.navigator.userAgent.toLowerCase();
    function create(el) {
        return window.document.createElement(el);
    }
    function match(regex) {
        var t = regex.test(ua),
            m = ua.match(regex);
        return t ? (m[1] || m[0]) : 0;
    }
    return {
        Is: {
            
            // browsers
            ie: match(/msie (\d+(\.\d+)?)/),
            firefox: match(/firefox\/(\d+(\.\d+)?)/),
            chrome: match(/chrome\/(\d+(\.\d+)?)/),
            safari: match(/safari\/(\d+(\.\d+)?)/),
            opera: match(/opera\/(\d+(\.\d+)?)/),
            
            // rendering engines
            trident: match(/msie/) ? match(/trident\/(\d+(\.\d+)?)/) || (match(/msie (\d+(\.\d+))/) - 3).toFixed(1) : 0,
            gecko: match(/gecko\/(\d+)/),
            webkit: match(/webkit|khtml\/(\d+(\.\d+)?)/),
            
            // desktop runtimes
            air: match(/adobeair\/(\d+(\.\d+)?)/),
            titanium: match(/titanium\/(\d+(\.\d+)?)/),
            rhino: match(/rhino/),
            
            // operating systems
            windows: match(/(win)[d3]/), // windows, win32
            mac: match(/(mac)[i ]/), // macintosh, macintel, mac os x
            linux: match(/linux/),
            unix: match(/unix/), // TODO: revise this, probably not accurate
            
            // mobile, currently also matches tablets and consoles
            mobile: match(/android|avantgo|blackberry|brew|docomo|htc|ipad|iphone|ipod|kindle|minimo|opera mini|midp|mmp|mobile|netfront|nokia|nook|opwv|palmos|palm|pda|phone|playstation|ppc|proxinet|samsung|sonyeric|symbian|tablet|vodafone|wap|wii|windows ce|xbox/),
            
            // so I don't need to worry about extra trailing commas
            nothing: false
            
        },
        Supports: {
            appCache: function() {
                return !!window.applicationCache;
            },
            audio: function(type) { // see switch
                var a = create('audio');
                if (!a || !a.canPlayType) {
                    return false;
                }
                type = ('' + type).toLowerCase();
                switch(('' + type).toLowerCase()) {
                    case 'mp3':
                        return !!a.canPlayType('audio/mpeg').replace(/no/i, '');
                    case 'ogg': // fall through
                    case 'vorbis':
                        return !!a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/i, '');
                    case 'wav':
                        return !!a.canPlayType('audio/wav; codecs="1"').replace(/no/i, '');
                    case 'aac':
                        return !!a.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/i, '');
                    default:
                        return true;
                }
            },
            canvas: function(text) { // null, true
                var c = create('canvas');
                return (text ?
                    (c.getContext && typeof c.getContext('2d').fillText == 'function') :
                    !!c.getContext);
            },
            command: function() {
                return 'type' in create('command');
            },
            contentEditable: function() {
                return 'isContentEditable' in create('span');
            },
            dbSimple: function() {
                return !!window.indexedDB;
            },
            dbSQL: function() {
                return !!window.openDatabase;
            },
            datalist: function() {
                return 'options' in create('datalist');
            },
            details: function() {
                return 'open' in create('details');
            },
            device: function() {
                return 'type' in create('device');
            },
            dragDrop: function() {
                return 'draggable' in create('span');
            },
            fileAPI: function() {
                return typeof FileReader != 'undefined';
            },
            formConstraints: function() {
                return 'noValidate' in create('form');
            },
            geolocation: function() {
                return !!navigator.geolocation;
            },
            history: function() {
                return !!(window.history && window.history.pushState && window.history.popState);
            },
            iframe: function(type) { // sandbox, srcdoc
                return (type || 'src') in create('iframe');
            },
            input: function(type) { // see switch
                var i = create('input');
                type = ('' + type).toLowerCase();
                switch(type) {
                    case 'autofocus': // fall through
                    case 'placeholder':
                        return type in i;
                    case 'color': // fall through
                    case 'date': // fall through
                    case 'datetime': // fall through
                    case 'datetime-local': // fall through
                    case 'email': // fall through
                    case 'month': // fall through
                    case 'number': // fall through
                    case 'range': // fall through
                    case 'search': // fall through
                    case 'tel': // fall through
                    case 'time': // fall through
                    case 'url': // fall through
                    case 'week':
                        i.setAttribute('type', type);
                        return i.type !== 'text';
                    default:
                        return false;
                }
            },
            localStorage: function() {
                return ('localStorage' in window) && window.localStorage !== null;
            },
            meter: function() {
                return 'value' in create('meter');
            },
            microdata: function() {
                return !!document.getItems;
            },
            output: function() {
                return 'value' in create('output');
            },
            progress: function() {
                return 'value' in create('progress');
            },
            serverEvents: function() {
                return typeof EventSource !== 'undefined';
            },
            sessionStorage: function() {
                try {
                    return ('sessionStorage' in window) && window.sessionStorage !== null;
                } catch(e) {
                    return false;
                }
            },
            sockets: function() {
                return !!window.WebSocket;
            },
            svg: function(inline) {
                if (inline) {
                    var e = create('div');
                    e.innerHTML = '<svg></svg>';
                    return !!(window.SVGSVGElement && e.firstChild instanceof window.SVGSVGElement);
                } else {
                    return !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
                }
            },
            time: function() {
                return 'valueAsDate' in create('time');
            },
            undo: function() {
                return typeof UndoManager != 'undefined';
            },
            video: function(type) {
                var v = create('video');
                if (!v || !v.canPlayType) {
                    return false;
                }
                type = ('' + type).toLowerCase();
                switch(type) {
                    case 'captions':
                        return 'track' in create('track');
                    case 'poster':
                        return 'poster' in v;
                    case 'webm':
                        return !!(v.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, ''));
                    case 'h264': // fall through
                    case 'h.264':
                        return !!(v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
                    case 'ogg': // fall through
                    case 'theora':
                        return !!(v.canPlayType('video/ogg; codecs="theora, vorbis"').replace(/no/, ''));
                    default:
                        return true;
                }
            },
            workers: function() {
                return !!window.Worker;
            }
        }
    };
}(this));
