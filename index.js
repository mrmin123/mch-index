$(document).ready(function() {
    var sections = ['', 'github', 'tv', 'read', 'flickr'];
    var mobileCheck = window.matchMedia("only screen and (max-device-width: 760px)");

    var circles = Snap.select('#circles');
    var circle_one = circles.select('#circle_one');
    var circle_two = circles.select('#circle_two');
    var circle_three = circles.select('#circle_three');
    var box_one = circles.select('#box_one');
    var box_two = circles.select('#box_two');
    var t = new Snap.Matrix();
    var animating = false;

    if (mobileCheck.matches) {
        t.scale(1.5, 1.5, 300, 300);
        circle_one.transform(t);
        circle_two.transform(t);
        circle_three.transform(t);
        box_one.transform(t);
        box_two.transform(t);
    }

    function out_anim(url) {
        if (animating == false) {
            animating = true;
            $('i').animate({ opacity: 0}, 400);
            circle_one.animate({ transform: 'r360 300 300 s5 300 300' }, 500, mina.backin);
            circle_two.animate({ transform: 'r360 300 300 s5 300 300' }, 500, mina.backin);
            circle_three.animate({ transform: 'r360 300 300 s5 300 300' }, 500, mina.backin);
            window.setTimeout( function() {
                window.location.href = url;
            }, 500);
        }
    }

    $('#fullpage').fullpage({
        menu: '#menu',
        anchors: sections,
        keyboardScrolling: true,
        loopBottom: true,
        easing: 'easeOutQuart',
        scrollingSpeed: 250,
        resize : true,
        responsive: true,
        navigation: true,
        navigationPosition: 'right',
        navigationTooltips: sections
    });

    $('i.fa-caret-square-o-down').click(function() { $.fn.fullpage.moveSectionDown(); });
    $('i.fa-caret-square-o-up').click(function() { $.fn.fullpage.moveSectionUp(); });

    $('a.out').click(function( event ) {
        event.preventDefault();
        out_anim(event.delegateTarget.href);
    });

    window.onunload = function(){};
});
