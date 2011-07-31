(function(window,MooTools) {
    if(!MooTools) {
        throw new Error('HotMilk browser-mootools-version requires MooTools (http://mootools.net/) to run');
    }

    $hotmilk.bare.js$

    // do export like underscore.js do:
    MooTools.HotMilk = HotMilk;

    // grab templates
    window.addEvent('domready', function() {
        var ss = document.getElementsByTagName('script');
        for(var i = 0; i < ss.length; i++) {
            var s = ss[i], path;
            if(s.type === 'text/x-mustache-template' && (path = s.getAttribute('data-hotmilk-path'))) {
                addTemplate(path, s.text);
            }
        };
    });
})(window,MooTools);
