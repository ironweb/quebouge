(function($){
var OccurencesCache = {};
/**
 * Front Controller
 */
FrontController = {
    isStarted:false,
    init:function() {
        window.scrollTo(0, 1);

        FrontController.addActions();
        FrontController.readTemplates();

        //prepare controller
        SearchController.init();

        //init libs
        SearchController.addSpinner();
        SearchController.$spinner.show();
        
        Geo.init();

        //start Application from Geo object (after we get the geo position)
    },
    start:function(url) {
        if(FrontController.isStarted){
            return;
        }
        FrontController.loadPage(url, true);
    },
    addActions:function() {
        
        $('#home-page').delegate('ol a','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            if( Modernizr.history && History.enabled ){
                History.pushState({state:2}, this.title, this.href);
            }else{
                FrontController.loadPage( this.href );
            }
        });

        $('#activity-page').delegate('a.back','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            if( Modernizr.history){
                History.pushState(null, this.title, '/');
            }else{
                FrontController.loadPage( "/" );
            }

        });

        if(Modernizr.history){
            History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
                var State = History.getState(); // Note: We are using History.getState() instead of event.state
                History.log(State.data, State.title, State.url);
                FrontController.loadPage( State.url );
            });    
        }
        

        //$('form.filter').delegate('select', 'change', SearchController.load);

        $(window).bind('resize', ActivityController.adjustMap);
        //window.addEventListener( "orientationchange", Layout.adjustHeight, false );
    },
    readTemplates:function() {
        $('script').each(function() {
            var el = $(this);
            if (el.attr('type') == 'text/html') {
                dust.compileFn(el.html(), el.attr('id'));
            }
        });
    },
    loadPage:function( url, first_page ){

        url = FrontController.clearUrl(url);

        switch( url ){
            case '/':
                SearchController.show(url, first_page);
                break;
            default:
                ActivityController.show(url, first_page);
                break;
        }

    },
    clearUrl:function( url ){
        if(url == ''){
            return '/';
        }
        return url.split(window.location.origin).pop();
    }     
}

Layout = {
    /*adjustHeight:function() {
        var documentHeight = $(document).height(),
            $homepage      = $('#home-page'),
            headerHeight   = $homepage.children('header').height(),
            $container     = $('#container');

        $container.css('min-height', documentHeight);
        //headerHeight
        $container.find('.page').find('ol').css('max-height', documentHeight);   
    }*/
}

SearchController = {
    $form:false,
    _loaded: false,
    init:function(){
        SearchController.$form = $('form');
        SearchController.$form.bind('submit', SearchController.doSubmit);

        SearchController.$linkdropdown = $('#show-cat-dropdown');
        SearchController.$dropdown     = $('#lst-category');
        SearchController.$linkdropdown.bind('click', SearchController.displayDropdown);
        SearchController.$dropdown.bind('change', SearchController.onChangeDropdown);
    },
    load:function(){
        SearchController._loaded = true;
        SearchController.$form.trigger('submit');
    },
    addSpinner:function(){

        var opts = {
          lines: 12, // The number of lines to draw
          length: 7, // The length of each line
          width: 4, // The line thickness
          radius: 10, // The radius of the inner circle
          color: '#fff', // #rgb or #rrggbb
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false // Whether to use hardware acceleration
        };
        //var target = $('#home-page')[0]
        var $wrap = $('<div class="wrap-spinner"></div>');
        $('<div class="spinner"></div>').appendTo($wrap);
        var target = $wrap.prependTo($('#home-page').find('.view')).children('div')[0];
        var spinner = new Spinner(opts).spin(target);

        SearchController.$spinner = $wrap.hide();
    },
    doSubmit:function(e) {
        e.preventDefault();
        e.stopPropagation();

        $('#home-page .error').addClass('hide');

        var center = Geo.getPosition(),
            $this = $(this);
        
        var dataToSend = {
            latlon:center.latitude+','+center.longitude,
            radius:2.0,
            //max_price:$this.find('select[name=price]').val(),
            cat_id:$this.find('select[name=category]').val()
        }

        SearchController.$spinner.show();
        
        $.ajax({
            type:'GET',
            url:'/activities',
            data:dataToSend,
            dataType:'json',
            success:SearchController.appendData
        });

        return false;
    },
    appendData:function(data) {
        if(data.elements.length == 0){
            $('#home-page .error').removeClass('hide');
            $('#home-page').find('.view div.content').empty();
            SearchController.$spinner.hide();
            return false;
        }
        //do an ajax call to load data from the form
        var data = {
            activities: data.elements
        }

        // Cache the dataz
        for(var i = 0; i < data.activities.length ; i++){
          var item = data.activities[i];
          OccurencesCache[item.occurence_id] = item;
        }

        dust.render('tpl_list_view', data, function(err, out) {
            $('#home-page').find('.view div.content').html(out);
            SearchController.$spinner.hide();
            //Layout.adjustHeight();
        });
    },
    show:function(url, first_page) {
        if(first_page || !SearchController._loaded) SearchController.load();

        var $outElement = $('#container .wrap>.page.current'),
            $inElement  = $('#home-page');

        if($inElement.css('display') == 'block') return;

        $outElement.css("top", -window.pageYOffset);
        $inElement.addClass('current').css("top", 0);
        $outElement.addClass('slideright out');
        scrollTo(0, 0);

        var toStart = 'translateX(' + '-' + window.innerWidth + 'px)';
        $inElement.css('webkitTransform', toStart);

        setTimeout(function(){
            $outElement.removeClass('current slideright out');
            $inElement.removeClass('slideright in').css( 'webkitTransform', '')
        },250);
        
    },
    onChangeDropdown:function(){
        //trigger the search
        SearchController.load();
    }
}

ActivityController = {
    zoom: 9,
    map:false,
    markersList:[],
    init:function() {
      if(ActivityController.map) return;
      var opts = {
        zoom:13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(Geo.coords.latitude,Geo.coords.longitude),
        disableDefaultUI: false,
        streetViewControl:false,
        zoomControl: false,
        scrollwheel: false,
        scaleControl: false,
        mapTypeId: 'quebouge',
        panControl: false,
        overviewMapControl: false,
        mapTypeControl: false,
        draggable: false
      };
      ActivityController.map_canvas = $("#map-canvas");
      ActivityController.adjustMap();

      ActivityController.map = new google.maps.Map(
        ActivityController.map_canvas[0], opts);

        var styledMapType = new google.maps.StyledMapType([
          {
            stylers: [
              { invert_lightness: true },
              { visibility: "on" },
              { lightness: 8 },
              { hue: "#00f6ff" },
              { saturation: -98 },
              { gamma: 1.58 }
            ]
          }
        ]);
        ActivityController.map.mapTypes.set('quebouge', styledMapType);
    },
    adjustMap:function() {
        ActivityController.map_canvas.width($(document).width())
        google.maps.event.trigger(ActivityController.map, 'resize')  
    },
    load:function(url) {
        var id = ActivityController._urlToId(url)
        var occurence = OccurencesCache[id];
        if(occurence){
            ActivityController._load(occurence);
        }
        else{
            var latlon = Geo.getPosition();
            url += '?latlon=' + latlon.latitude + ',' + latlon.longitude;
            $.getJSON(url, function(occurence){
                ActivityController._load(occurence);
            });
        }
    },

    // Inner load : once data is ready
    _load: function(occurence){
        SearchController.$spinner.hide();
        ActivityController._cleanMap();
        ActivityController._drawPointsAndRecenter(occurence);

        var $activity_page = $('#activity-page');
        dust.render('tpl_map_view', occurence, function(err, out) {
          $activity_page.find('div.content').html(out);
        });
        // load template with data
        var occurence_tmpl = $.extend({}, occurence);
        occurence_tmpl.location_url_safe = encodeURI(occurence_tmpl.location)
        occurence_tmpl.saddr = Geo.coords.latitude + "," + Geo.coords.longitude
        dust.render('tpl_map_view_howtogo', occurence_tmpl, function(err, out) {
          $activity_page.find('section.sec').html(out);
          // Bind direction clicks
          var $direction_links = $('#direction-links');
          $direction_links.delegate('a', 'click', function(e){
            e.preventDefault();
            window.open($direction_links.data('href') + '&dirflg=' + $(this).data('dirflg'));
          });
        });
    },

    show:function(url, first_page) {
        var $outElement = $('#container>.wrap>.page.current'),
            $inElement  = $('#activity-page')

        var show_page = function(){
            ActivityController.init();
            ActivityController.load(url);
        }

        if(first_page){
            $inElement.addClass('current');
            show_page();
        }
        else{
            $inElement.addClass('current slideleft in').css("top", 0);
            $outElement.css("top", -window.pageYOffset);
            scrollTo(0, 0);
            var toStart = 'translateX(' + window.innerWidth + 'px)';
            $inElement.css('webkitTransform', toStart);

            setTimeout(function(){
                $outElement.removeClass('current slideleft out');
                $inElement.removeClass('slideleft in').css( 'webkitTransform', '')
                show_page();
            },250);
        }
    },

    _urlToId: function(url){
      return url.split('/').pop();
    },

    _drawPointsAndRecenter: function(point){
      var bounds = new google.maps.LatLngBounds();
      var latlng = ActivityController._latLngFromPoint(point);
      var user_geoloc = new google.maps.LatLng(Geo.coords.latitude, Geo.coords.longitude)

      bounds.extend(latlng)
      bounds.extend(user_geoloc)

      var icon_activity = new google.maps.MarkerImage(
          '/static/images/pinpoint/pin_'+point.categ_icon,
          // This marker is 20 pixels wide by 32 pixels tall.
          new google.maps.Size(22, 30)
      );

      var activityMarker = new google.maps.Marker({
        position: latlng,
        icon:icon_activity,
        map: ActivityController.map,
        title: point.title
      });

      ActivityController.markersList.push(activityMarker);

      var icon_me = new google.maps.MarkerImage(
          '/static/images/pinpoint/pin_me.png',
          // This marker is 20 pixels wide by 32 pixels tall.
          new google.maps.Size(24, 24)
      );

      var userMarker = new google.maps.Marker({
        icon: icon_me,
        position: user_geoloc,
        map: ActivityController.map
      });

      ActivityController.markersList.push(userMarker);
      
      setTimeout(function(){
            ActivityController.map
          ActivityController.map.fitBounds(bounds);
      },700)
      
    },

    _latLngFromPoint: function(point){
      return new google.maps.LatLng(point.position[0], point.position[1]);
    },

    _cleanMap:function(){
        if (ActivityController.markersList.length > 0 ) {
            for (var i = 0; i < ActivityController.markersList.length; i++ ) {
                ActivityController.markersList[i].setMap(null);
                ActivityController.markersList[i] = null
            }
        } 
          ActivityController.markersList = new Array();
    }

}


Geo = {
    coords:false,
    init:function(){

        Modernizr.load({
            test: Modernizr.geolocation,
            nope: '/static/js/libs/geolocalisation.js',
            complete:function(){
                Geo.loadPosition();
            }
        }); 
    },
    loadPosition:function() {
        navigator.geolocation.getCurrentPosition(function(data){
            Geo.coords = data.coords;
            FrontController.ready = true;
            FrontController.start( window.location.pathname );
        });
    },
    getPosition:function() {
        if (!Geo.coords) {
            alert('return default position')
        }else{
            return Geo.coords;
        }
    }
}


$(document).ready(function() {
    if (window.PhoneGap) {
        // For PhoneGap application.
        document.addEventListener("deviceready", function() {
            FrontController.init();
        }, false);
    } else {
        FrontController.init();
    }
});

})($);
