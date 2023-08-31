// Configuration options
var OFFSET_FOR_CONTENT = {
    "default": 177,
    "with-typeface": 177
};

var LIGHTBOX_FILETYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

$(document).ready(function(){
    setSizeForContent(OFFSET_FOR_CONTENT['default']);
    
    //prepend span tag for images (general & gallery)
	$("ul#photo-gallery-thumbs li a, div.taped-photo").prepend("<span></span>");

    activateLightbox(LIGHTBOX_FILETYPES);

    removeAccentsFromNavTexts();

    createSlideDownMenus();

    // Required because of typeface.js
    if (!$.browser.msie) restyleHeadingsForTypeface();

    // Add the new paddings for use with the typeface.js

    // Change the min-height for the #content div based on the new paddings
    setSizeForContent(OFFSET_FOR_CONTENT['with-typeface']);

    // Watch for window resizes
    $(window).resize(function(){
        setSizeForContent(OFFSET_FOR_CONTENT['with-typeface']);
    });

    // Load typeface
    if (!$.browser.msie) typefaceInit();

    // if ($('div#content div#left-column ul#in-content-navigation-list').length != 0){
    //     var active_entry = $('div#content div#left-column ul#in-content-navigation-list a.active h3');
    //     var entries = $('div#content div#left-column ul#in-content-navigation-list a h3');
    //     entries.hover(function(){
    //         entries.css({ background: "none" });
    //         $(this).css({ background: "url('images/right-arrow-trans.png') no-repeat 175px 10px"});
    //     },function(){
    //         $(this).css({ background: "none" });
    //         active_entry.css({ background: "url('images/right-arrow-trans.png') no-repeat 175px 10px"});
    //     });
    // };
    
    if ($.browser.msie && $.browser.version < 7) loadIE6fixes();
    
    // Load google analytics
    $.trackPage('UA-5666884-4')
});

/* 
   Make the main Content div to span across the entire page if it's height
   is less than the page's available space.
*/
function setSizeForContent(offset){
    $('div#main div#content').css({ 'min-height': $(window).height() - offset });
};

/* 
   Add the slide-down functionality to all navigation elements
   that have a subnavigation menu, i.e.: when they have an id
   like *something*-menu.
*/
function createSlideDownMenus(){
    cancel_close = [];  // Flag for the state of each sliding menu
    $('ul#navigation > li').each(function(){
       var self = this;
       var elem_id = self.id;
       if (elem_id && elem_id.match('-menu')){
           var idx = elem_id.indexOf('-menu');
           var val = elem_id.slice(0, idx);

           $('ul#navigation li#' + val + '-menu' + ':not(.active)').hover(
               function(){
                   cancel_close[elem_id] = true; // flag
                   $('ul#navigation li#' + val + '-menu').css( { background: "url('/images/bg-red.png')" });
                   $('ul#navigation ul#' + val + '-navigation').slideDown("normal", function(){
                       cancel_close[elem_id] = false;
                   });
               },
               function(){
                   $('ul#navigation ul#' + val + '-navigation').slideUp("normal", function(){
                       if ($('ul#navigation li#' + val + '-menu').hasClass('active') == false && cancel_close[elem_id] == false) {
                           $('ul#navigation li#' + val + '-menu').css( { background: "url('/images/bg-black.png')" });
                       }
                   });
               }
           );
       }
    });  
};

/*
   Replaces the first element of the heading with a span element with a predefined style
   and appends a '/' to the end unless the heading has a class of 'last' or is not inside
   a 'headings-navigation' container.
   
   XXX: Beware, that it replaces all html from inside the headings. This means that if 
   there are any ohter elements inside the heading (for example an 'a' TAG, or an 'em')
   they WILL BE LOST.
*/
function restyleHeadingsForTypeface(){
    // Helper function to search through the whole DOM tree looking for a parent element
    // with a particular id.
    var hasParentNode = function(element, id){
        if (element.parentNode){
            return (element.parentNode.id == id) ? true : hasParentNode(element.parentNode, id);
        }else{
            return false;
        }
    };

    $('div#main h2').each(function(i){
        var original_content = $(this).text();
        
        // Set the style for the first-letter span. 
        var first_letter_style = "color: white;";
        // Fake a whitespace character with
        // padding if the second character of the heading is a whitespace or an &nbsp;
        if (original_content[1] == ' ' || original_content.slice(1,7) == '&nbsp;'){
            // NOTE: This may need to be changed to pixels (because of IE problem with typeface)
            first_letter_style += " padding-right: 0.4em";
        }

        // Fake the h2:first-letter by adding a span element with inline styles.
        var new_content = '<span style="' + first_letter_style + '">'
                            + original_content.substring(0,1)
                        + '</span>'
                        + original_content.substring(1,original_content.length);
        
        // Set the new html inside the heading
        $(this).html(new_content);
        $(this).addClass('typeface-js');
    });
};

function removeAccentsFromNavTexts(){
    var mapping_table = {
        'ά': 'α', 'Ά': 'Α',
        'έ': 'ε', 'Έ': 'Ε',
        'ή': 'η', 'Ή': 'Η',
        'ί': 'ι', 'Ί': 'Ι',
        'ό': 'ο', 'Ό': 'Ο',
        'ύ': 'υ', 'Ύ': 'Υ',
        'ώ': 'ω', 'Ώ': 'Ω'
    };
    
    var nav_element = $('ul#navigation');
    var original_html = nav_element.html();
    var new_html = original_html;
    
    jQuery.each(mapping_table, function(key, val){
        var was = new_html;
        new_html = new_html.replace(new RegExp(key,'g'), val); // the 'g' is option is needed for global pattern matching
    });
    
    nav_element.html(new_html);
};

function activateLightbox(filetypes){
    // <---- Meta-magick ---->
	var base_selector = "a:has(img)";
	var complete_selector = '';
	jQuery.each(filetypes, function(){ complete_selector += base_selector + '[href$=' + this + '],'; });
    // <---- Meta-magick ---->

    $(complete_selector.substring(0,complete_selector.length - 1)).lightBox({
    	    fixedNavigation: true,
    	    txtImage: 'Εικόνα',
            txtOf: 'από',
            // Required to be absolute because of Radiant
            imageLoading: '/images/lightbox-ico-loading.gif',
            imageBtnClose: '/images/lightbox-btn-close.gif',
            imageBtnPrev: '/images/lightbox-btn-prev.gif',
            imageBtnNext: '/images/lightbox-btn-next.gif',
            imageBlank: '/images/lightbox-blank.gif'
    });
};

/* Gets the videos from youtube and inserts them on the page
   Options (from global variable video_options):
        container: The id of the container that will be
                    filled with html. Defaults to "videos-listing".
        asListItems: (true | false) . Defaults to "true".
        size: (small | medium | big) . Defaults to "big".
        showTitle: (true | false) . Defaults to "true.
        titleElement: The html element that will include the title
                        of each video. The default is 'h3'.
        showDescription: (true | false) . Defaults to "true".

    TODO: Add a way to position elements externally. For example
          title first, then the video, then the description, etc...
*/
function showVideos(data) {
    // Set the default options
    video_options = video_options || {};
    video_options['container'] = video_options['container'] || 'videos-listing';
    video_options['asListItems'] = video_options['asListItems'] == undefined ? true : video_options['asListItems'];
    video_options['size'] = video_options['size'] || 'big';
    video_options['showTitle'] = video_options['showTitle'] == undefined ? true : video_options['showTitle'];
    video_options['titleElement'] = video_options['titleElement'] || 'h3';
    video_options['showDescription'] = video_options['showDescription'] == undefined ? true : video_options['showDescription'];

    // Set video dimensions based on 'size' attribute
    switch (video_options['size']){
        case 'small':
            video_options['width'] = '207';
            video_options['height'] = '150';
            break;
        case 'medium':
            video_options['width'] = '550';
            video_options['height'] = '375';
            break;
        case 'big':
            video_options['width'] = '650';
            video_options['height'] = '475';
            break;
    }

    // Set the html for the title element if necessary.
    if (video_options['showTitle']){
        video_options['titleStartHtml'] = '<' + video_options['titleElement'] + '>';
        video_options['titleEndHtml'] = '</' + video_options['titleElement'] + '>';
    }

    // Init other needed variables
    var feed = data.feed;
    var entries = feed.entry || [];
    var html = [];

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var url = entry.media$group.media$content[0].url;
        var video_html = [];

        if (video_options['showTitle']){
            video_html.push(video_options['titleStartHtml'], entry.media$group.media$title.$t, video_options['titleEndHtml']);
        }

        var object_html = '<object width="' + video_options['width'] + '" height="' + video_options['height'] + '">'
                        + '<param name="movie" value="' + url + '&hl=en&fs=1&rel=0"></param>'
                        + '<param name="allowFullScreen" value="true"></param>'
                        + '<param name="allowscriptaccess" value="always"></param>'
                        + '<embed src="' + url + '&hl=en&fs=1&rel=0" '
                                + 'type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" '
                                + 'width="' + video_options['width'] + '" '
                                + 'height="' + video_options['height'] + '">'
                        + '</embed></object>';
        video_html.push(object_html);

        if (video_options['showDescription']){
            video_html.push('<p>', entry.media$group.media$description.$t, '</p>');
        }

        video_options['asListItems'] ? html.push('<li>', video_html.join(''), '</li>') : html.push(video_html);
    }

    document.getElementById('videos-listing').innerHTML = html.join('');
}

function loadIE6fixes(){
    //Fake the :hover pseudo-class for the navigation items
    $('div#header ul#navigation > li:not(:has(ul)):not(.active)').hover(
        function(){
            $(this).css({ background: "url('/images/bg-red.png')" });
        },
        function(){
            $(this).css({ background: "url('/images/bg-black.png')" });
    });
}