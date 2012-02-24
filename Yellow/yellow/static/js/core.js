(function($){
var OccurencesCache = {};
/**
 * Front Controller
 */
FrontController = {
    isStarted:false,
    hasData:false,
    init:function() {
        window.scrollTo(0, 1);
        //@TODO change that when we can load another page than the search results
        window.currentUrl = '/';

        FrontController.addActions();
        FrontController.readTemplates();

        OrientationMap.init();

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
        FrontController.isStarted = true;

        //add future router here
        SearchController.load();      
    },
    addActions:function() {
        
        $('#home-page').delegate('ol a','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            if( Modernizr.history ){
                History.pushState({state:2}, this.title, this.href);
            }else{
                FrontController.loadPage( this.href );
            }
        });

        $('#activity-page').delegate('a.back','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            if( Modernizr.history ){
                History.pushState({state:1}, this.title, '/');
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
    loadPage:function( url ){

        url = FrontController.clearUrl(url);
        
        window.currentUrl = url;

        if( FrontController.hasData ){
            OrientationMap.test();
        }
        
        switch( url ){
            case '/':
                SearchController.show();
                break;    
            default:
                ActivityController.show(url);
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
        var data = {
            activities: data.elements
        }

        FrontController.hasData = true;

        // Cache the dataz
        for(var i = 0; i < data.activities.length ; i++){
          var item = data.activities[i];
          OccurencesCache[item.occurence_id] = item;
        }
        OrientationMap.prepare();

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
            OrientationMap.resize();
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
    markersList:[],
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
      var activityMarker = new google.maps.Marker({
        position: latlng,
        map: ActivityController.map,
        title: point.title
      });
      ActivityController.markersList.push(activityMarker);
      var userMarker = new google.maps.Marker({
        icon: '/static/images/pinpoint.png',
        position: user_geoloc,
        map: ActivityController.map
      });
      ActivityController.markersList.push(userMarker);
      ActivityController.map.fitBounds(markers)
      
    },

    _latLngFromPoint: function(point){
      return new google.maps.LatLng(point.position[0], point.position[1]);
    },

    _cleanMap:function(){
        if (ActivityController.markersList.length > 0 ) {
            for (var i = 0; i < ActivityController.markersList.length; i++ ) {
                ActivityController.markersList[i].setMap(null);
            }
        }    
    }

}

OrientationMap = {
    isInit:false,
    results:{
        init:false,
        $obj:false,
        map:false,
        bounds:false,
        isopen:false,
        markersList:[]
    },
    activity:{
        init:false,
        $obj:false,
        map:false,
        markersList:[]
    },
    $activityMap:false,
    resultInit:false,
    activityInit:false,
    init:function(){
        //if( !Modernizr.touch || OrientationMap.isInit ){
        if( OrientationMap.isInit ){
            return;
        }

        window.addEventListener( "orientationchange", OrientationMap.test, false );
    },
    prepare:function(){
        //if(!Modernizr.touch || OrientationMap.isInit){
        if(OrientationMap.isInit){
            return;
        }

        OrientationMap.results.$obj = $('#home-page').children('.orientationmap');
        OrientationMap.$activityMap = $('#activity-page').children('.orientationmap');

        OrientationMap.test();
    },
    test:function() {
        
        //check wich orientation we are, and call the good function
        if(Modernizr.mq("(orientation:landscape)")){
            OrientationMap.load();
        }else{
            OrientationMap.hideMap();
        }
    },
    load:function(){
        //depending of the current url
        if(window.currentUrl == '/'){
            OrientationMap.displayResultsMap();
        }
    },

    displayResultsMap:function() {
        var $d = $(document);
        OrientationMap.results.$obj.width( $d.width() )
        OrientationMap.results.$obj.height( $d.height() )

        if(!OrientationMap.results.init){
            OrientationMap.results.map = OrientationMap.getMapOverlayObject(OrientationMap.results.$obj[0]);
        }
        OrientationMap.results.isopen = true;
        //clear cache
        for(var x=0;x<OrientationMap.results.markersList.length;x++){
            OrientationMap.results.markersList[x].setMap(null);
            OrientationMap.results.markersList[x] = null;
        }
        OrientationMap.results.markersList = new Array();

        //load all occurences in map
        var bounds = new google.maps.LatLngBounds();
        
        $.each(OccurencesCache, function(index,element){

            var latlng = new google.maps.LatLng(element.position[0], element.position[1])
            bounds.extend(latlng)

            var marker = new google.maps.Marker({
                position: latlng,
                map: OrientationMap.results.map,
                title: element.title,
                flat:true
            });

            marker.url = '/show/'+element.occurence_id
            marker.title = element.title;
            google.maps.event.addListener(marker, 'click', function(e, t) {
                OrientationMap.hideMap();

                if(Modernizr.history){
                    if( Modernizr.history ){
                        History.pushState({state:2}, marker.title, marker.url);
                    }else{
                        FrontController.loadPage( marker.url );
                    }
                }

            });

            OrientationMap.results.markersList.push(marker)
        });

        OrientationMap.results.$obj.show();
        OrientationMap.results.bounds = bounds;
        OrientationMap.resize();
    },
    resize:function(){
        if(OrientationMap.results.isopen){
            google.maps.event.trigger(OrientationMap.results.map, 'resize')
            OrientationMap.results.map.fitBounds(OrientationMap.results.bounds)
        }
        
    },
    displayActivityMap:function() {
        var $d = $(document);
        OrientationMap.activity.$obj.width( $d.width() )
        OrientationMap.activity.$obj.height( $d.height() )

        if(!OrientationMap.activity.init){
            OrientationMap.activity.map = OrientationMap.getMapOverlayObject(OrientationMap.activity.$obj[0]);
        }

        OrientationMap.activity.$obj.show();
    },
    hideMap:function(){
        if(OrientationMap.results.$obj){
            OrientationMap.results.$obj.hide();
            OrientationMap.results.isopen = false;
        }
        
        if(OrientationMap.activity.$obj){
            OrientationMap.activity.$obj.hide();
        }
    },
    getMapOverlayObject:function( el ){
        var opts = {
            zoom:3,
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
      
          return ActivityController.map = new google.maps.Map( el, opts);
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


$(document).ready(function() {
    FrontController.init();
})
})($);
