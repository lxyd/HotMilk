(function() {
    $hotmilk.bare.js$

    // do export like underscore.js do:
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HotMilk;
    } else {
        this.HotMilk = HotMilk;
    }
})();
