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
    start:function() {
        if(FrontController.isStarted){
            return;
        }

        //add future router here
        SearchController.load();      
    },
    addActions:function() {
        /*$('body').delegate('a', 'click', function(e){
            
            if(Router.History.enabled){
                e.preventDefault();
                e.stopPropagation();
                
                //History.pushState({state:1}, this.title, this.href);    
            }

        });*/
        
        $('#home-page').delegate('ol a','click', function(e){
            e.preventDefault();
            e.stopPropagation();
            FrontController.loadPage( 'activity', this.href );
        });

        $('#activity-page').delegate('a.back','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            FrontController.loadPage( 'home', "/" );
        });

        //$('form.filter').delegate('select', 'change', SearchController.load);

        //$(window).bind('resize', Layout.adjustHeight);
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
    loadPage:function( pagename, url ){
        switch( pagename ){
            case 'home':
                SearchController.show();
                break;    
            case 'activity':
            default:
                ActivityController.show(url);
                break;
        }
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
    init:function(){
        SearchController.$form = $('form');
        SearchController.$form.bind('submit', SearchController.doSubmit);

        SearchController.$linkdropdown = $('#show-cat-dropdown');
        SearchController.$dropdown     = $('#lst-category');
        SearchController.$linkdropdown.bind('click', SearchController.displayDropdown);
        SearchController.$dropdown.bind('change', SearchController.onChangeDropdown);
    },
    load:function(){
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

        //do an ajax call to load data from the form
        //fake data

        var data = {
            activities: data.elements
        }

        // Cache the dataz
        for(var i = 0; i < data.activities.length ; i++){
          var item = data.activities[i];
          OccurencesCache[item.occurence_id] = item;
        }

        dust.render('tpl_list_view', data, function(err, out) {
            $('#home-page').find('div.content').html(out);
            SearchController.$spinner.hide();
            //Layout.adjustHeight();
        });
    },
    show:function() {

        var $outElement = $('#container>.page.current'),
            $inElement  = $('#home-page');
        $outElement.css("top", -window.pageYOffset);
        $inElement.addClass('current').css("top", 0);
        $outElement.addClass('slideright out');
        //$('#home-page').addClass('current');
        scrollTo(0, 0);

        var toStart = 'translateX(' + '-' + window.innerWidth + 'px)';
        $inElement.css('webkitTransform', toStart);

        setTimeout(function(){
            $outElement.removeClass('current slideright out');
            $inElement.removeClass('slideright in').css( 'webkitTransform', '')

           // ActivityController.__init();
        },250);
        
    },
    onChangeDropdown:function(){
        //trigger the search
        SearchController.load();
    }
}

ActivityController = {
    zoom: 11,
    map:false,
    init:function() {
      if(ActivityController.map) return;
      var opts = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(0,0),
        disableDefaultUI: false,
        streetViewControl:false,
        zoomControl: false,
        scrollwheel: false,
        scaleControl: false,
        panControl: false,
        overviewMapControl: false,
        mapTypeControl: false
      };
      ActivityController.map_canvas = $("#map-canvas");
      ActivityController.map = new google.maps.Map(
        ActivityController.map_canvas[0], opts);
    },

    load:function(id) {
      var occurence = OccurencesCache[id];
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

    show:function(url) {

        var $outElement = $('#container>.page.current'),
            $inElement  = $('#activity-page').addClass('current slideleft in').css("top", 0);
        
        $outElement.css("top", -window.pageYOffset);
        
        scrollTo(0, 0);

        var toStart = 'translateX(' + window.innerWidth + 'px)';
        $inElement.css('webkitTransform', toStart);

        setTimeout(function(){
            $outElement.removeClass('current slideleft out');
            $inElement.removeClass('slideleft in').css( 'webkitTransform', '')

            ActivityController.init();
            ActivityController.load(ActivityController._urlToId(url));
        },250);

    },

    _urlToId: function(url){
      return url.split('/').pop();
    },

    _drawPointsAndRecenter: function(point){
      var markers = new google.maps.LatLngBounds();
      var latlng = ActivityController._latLngFromPoint(point);
      var user_geoloc = new google.maps.LatLng(Geo.coords.latitude, Geo.coords.longitude)
      markers.extend(latlng)
      markers.extend(user_geoloc)
      new google.maps.Marker({
        position: latlng,
        map: ActivityController.map,
        title: point.title
      });
      new google.maps.Marker({
        icon: '/static/images/pinpoint.png',
        position: user_geoloc,
        map: ActivityController.map
      });
      ActivityController.map.fitBounds(markers)
    },

    _latLngFromPoint: function(point){
      return new google.maps.LatLng(point.position[0], point.position[1]);
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
            FrontController.start();                
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
/* 
Router = {
    routes:[],
    init:function(){
        Router.History = window.History; // Note: We are using a capital H instead of a lower h
        if ( !Router.History.enabled ) {
            // History.js is disabled for this browser.
            // This is because we can optionally choose to support HTML4 browsers or not.
            return false;
        } 

        Router.routes.push( new Davis.Route ('get', '/', function(req){
           console.debug(req)
        }) );
        Router.routes.push( new Davis.Route ('get', '/activity/:id', function(req){
            console.debug(req.params['id'])
        }) );

        Router.History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
            var State = Router.History.getState(); // Note: We are using History.getState() instead of event.state
            Router.History.log(State.data, State.title, State.url);

            Router.run( State.url );
        });
    },
    current:function() {
        var hash = Router.History.getHash();
        if(hash == ''){
            hash = '/';
        }
        return hash; 
    },
    run:function( path ) {
         var req = Router.getRequest( path );

         route = req.path.split(location.origin).pop(); 
         for(var x=0;x<Router.routes.length;x++){
            if(Router.routes[x].match( 'get', route )){
                Router.routes[x].run(req);
                continue;
            }
         }       
    },
    getRequest:function( path ){
        if(!path){
            return Davis.Request.forPageLoad();
        }else{
            return new Davis.Request( {
                title   : "",//don't care about the title, seriously!
                fullPath: path,
                method  : "get" //always get request, for now
            });
        }
    }
}
*/

$(document).ready(function() {
    FrontController.init();
})
})($);
