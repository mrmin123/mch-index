var img_fground = ['img/fground_01.png',
                'img/fground_02.png',
                'img/fground_03.png',
                'img/fground_04.png',
                'img/fground_05.png',
                'img/fground_06.png'];
var img_sky = ['img/sky_01.png',
                'img/sky_02.png',
                'img/sky_03.png',
                'img/sky_04.png',
                'img/sky_05.png',
                'img/sky_06.png',
                'img/sky_07.png',
                'img/sky_08.png'];
var rand_layers = ['fground',
                'sky01',
                'sky02'];
var rand_layer_specs = ['data-0="bottom:0%;" data-40p="bottom:0%;"',
                'data-0="bottom:50%;" data-40p="bottom:18%;"',
                'data-0="bottom:70%;" data-40p="bottom:25%;"'];
var img_mground = ['img/mground_01.png',
                'img/mground_02.png',
                'img/mground_03.png'];
var img_bground = ['img/bground_01.png',
                'img/bground_02.png',
                'img/bground_03.png'];
var last_generated_rand = new Array(rand_layers.length);
var last_generated_mground = new Array(1);
var last_generated_bground = new Array(1);

function header_animation() {
    $('.fground').animate({ 'right': '+=5' }, 50, 'linear');
    $('.mground').animate({ 'right': '+=4' }, 50, 'linear');
    $('.bground').animate({ 'right': '+=3' }, 50, 'linear');
    $('.sky01').animate({ 'right': '+=2' }, 50, 'linear');
    $('.sky02').animate({ 'right': '+=1' }, 50, 'linear');
    
    $('img').each(function(index) {
        if (parseInt($(this).css('right'), 10) > $(window).width()) { $(this).remove(); }
    });
    if (parseInt($('.mground:last').css('right'), 10) > -50) {
        add_header_element_fixed('mground');
    }
    if (parseInt($('.bground:last').css('right'), 10) > -50) {
        add_header_element_fixed('bground');
    }
    
}

function add_header_element_random() {
    var layer_num = Math.floor(Math.random()*rand_layers.length);
    var layer = rand_layers[layer_num];
    var layer_spec = rand_layer_specs[layer_num];
    if (layer_num < 1) {
        var image_num = Math.floor(Math.random()*img_fground.length);
        while (last_generated_rand[layer_num] == image_num) {
            image_num = Math.floor(Math.random()*img_fground.length);
        }
        var image = img_fground[image_num];
        last_generated_rand[layer_num] = image_num;
    } else {
        var image_num = Math.floor(Math.random()*img_sky.length);
        while (last_generated_rand[layer_num] == image_num) {
            image_num = Math.floor(Math.random()*img_sky.length);
        }
        var image = img_sky[image_num];
        last_generated_rand[layer_num] = image_num;
    }
    
    if ($('img').length < 30) {
        $('#header_anim').append('<img src="' + image + '" class="header_element ' + layer + '" ' + layer_spec + ' />');
    }
}

function populate_ground() {
    for (var x = $(window).width()-500; x > -499; x -= 500) {
        add_header_element_fixed('mground', x);
        add_header_element_fixed('bground', x);
    }
}

function add_header_element_fixed(layer, init) {
    init = ' style="right:' + init + 'px;" ' || ' ';
    
    if (layer == 'mground') {
        var append = 'data-0="bottom:0%;" data-40p="bottom:-2%;"';
        var image_num = Math.floor(Math.random()*img_mground.length);
        while (last_generated_mground[0] == image_num) {
            image_num = image_num = Math.floor(Math.random()*img_mground.length);
        }
        var image = img_mground[image_num];
        last_generated_mground[0] = image_num;
    } else if (layer == 'bground') {
        var append = 'data-0="bottom:3%;" data-40p="bottom:-3%;"';
        var image_num = Math.floor(Math.random()*img_bground.length);
        while (last_generated_bground[0] == image_num) {
            image_num = image_num = Math.floor(Math.random()*img_bground.length);
        }
        var image = img_bground[image_num];
        last_generated_bground[0] = image_num;
    }
    $('#header_anim').append('<img src="' + image + '" class="header_element ' + layer + '" ' + append + init + '/>');
    
}

$(document).ready(function() {
    var s = skrollr.init();
    populate_ground();
    add_header_element_random();
    setInterval(header_animation, 50);
    
    (function fast_loop() {
        setTimeout(function() {
            s.refresh($('img'));
            fast_loop();  
        }, 1000);
    }());
    
    (function random_loop() {
        var rand = Math.round(Math.random() * 4500);
        setTimeout(function() {
            add_header_element_random();
            random_loop();  
        }, rand);
    }());
    
    skrollr.menu.init(s, {
        animate: true,
        easing: 'sqrt',
        scale: 2,
        duration: function(currentTop, targetTop) {
            return 500;
        }
    });
    
    $('.go_down').click(function() {
        $(this).css('display', 'none');
        $('.go_up').css('display', 'inline-block');
    });
    
    $('.go_up').click(function() {
        $(this).css('display', 'none');
        $('.go_down').css('display', 'inline-block');
    });
});