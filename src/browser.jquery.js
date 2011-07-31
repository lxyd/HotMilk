(function($) {
    if(!$) {
        throw new Error('HotMilk browser-jquery-version requires jQuery (http://jquery.com/) to run');
    }

    $hotmilk.bare.js$

    // do export like underscore.js do:
    $.fn.HotMilk = HotMilk;

    // grab templates
    $(function() {
        var ss = document.getElementsByTagName('script');
        for(var i = 0; i < ss.length; i++) {
            var s = ss[i], path;
            if(s.type === 'text/x-mustache-template' && (path = s.getAttribute('data-hotmilk-path'))) {
                addTemplate(path, s.text);
            }
        };
    });
})(jQuery);
