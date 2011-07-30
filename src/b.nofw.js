(function(window,document) {
    if(!window.DomReady) {
        throw new Error('HotMilk browser-nofw-version requires DomReady (http://code.google.com/p/domready/) library to run');
    }
    if(!window.XMLHttpRequest) {
        throw new Error('HotMilk browser-nofw-version requires XMLHttpRequest (https://github.com/ilinsky/xmlhttprequest) to run');
    }

    $hotmilk.bare.js$

    // do export like underscore.js do:
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HotMilk;
    } else {
        this.HotMilk = HotMilk;
    }

    // grab templates
    DomReady.ready(function() {
        var ss = document.getElementsByTagName('script');
        for(var i = 0; i < ss.length; i++) {
            var s = ss[i], path;
            if(s.type === 'text/x-mustache-template' && (path = s.getAttribute('data-hotmilk-path'))) {
                if(s.src) { // if script is located somewhere else
                    var request = new XMLHttpRequest();
                    request.open('GET', s.src, true);
                    request.onreadystatechange = function() {
                        if (this.readyState === 4) {
                            // file: queries return 0 instead of 200
                            if(this.status === 200 || this.status === 0) {
                                addTemplate(path, this.responseText);
                            }
                        }
                    };
                    request.send(null);
                } else {
                    addTemplate(path, s.text);
                }
            }
        };
    });
})(window,document);
