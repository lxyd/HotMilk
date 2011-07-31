(function(window,document) {
    if(!window.DomReady) {
        throw new Error('HotMilk browser-nofw-version requires DomReady (http://code.google.com/p/domready/) to run');
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
                addTemplate(path, s.text);
            }
        };
    });
})(window,document);
