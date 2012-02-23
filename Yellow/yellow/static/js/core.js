/**
 * Front Controller
 */
FrontController = {
    isStarted:false,
    init:function() {
        FrontController.addActions();

        //prepare controller
        SearchController.init();

        //init libs
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

        $('#home-page').delegate('a','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            FrontController.loadPage( 'activity', this.href );
        });

        $('#activity-page').delegate('a.back','click', function(e){
            e.preventDefault();
            e.stopPropagation();

            FrontController.loadPage( 'home', "/" );
        });

        $('header').find('a.toggle-filters').bind('click', function(e){
            e.preventDefault();
            e.stopPropagation();
           $(this).closest("header").find('form.filter').toggleClass('state-close'); 
        });

        $(window).bind('resize', Layout.adjustHeight);
        window.addEventListener( "orientationchange", Layout.adjustHeight, false );
    },
    loadPage:function( pagename, url ){
        switch( pagename ){
            case 'home':
                SearchController.show();
                break;    
            case 'activity':
            default:
                ActivityController.show();
                break;
        }
    }     
}

Layout = {
    adjustHeight:function() {
        var documentHeight = $(document).height(),
            $homepage      = $('#home-page'),
            headerHeight   = $homepage.children('header').height(),
            $container     = $('#container');

        $container.css('min-height', documentHeight);
        //headerHeight
        $container.find('.page').find('ol').css('max-height', documentHeight);   
    }
}

SearchController = {
    $form:false,
    init:function(){
        SearchController.$form = $('form');
        SearchController.$form.bind('submit', SearchController.doSubmit);
    },
    load:function(){
        SearchController.$form.trigger('submit');
    },
    doSubmit:function() {
        //do an ajax call to load data from the form
        //fake data
        var data = {
            activities:[{id:476,category:"test",title:"Natation", distance:"0.5km", when:"20h00"},{id:476,category:"test",title:"Hockey", distance:"0.5km", when:"20h00"},{id:476,category:"test",title:"Conditionnement physique", distance:"0.5km", when:"20h00"},{id:476,category:"test",title:"Natation", distance:"0.5km", when:"20h00"}]
        }

        data.activities = data.activities.concat(data.activities,data.activities,data.activities);

        $('#home-page').find('div.content').html( Template.render('list-view', data) );

        Layout.adjustHeight();
    },
    show:function() {
        
        var $outElement = $('#container>.page.current');
        $('#home-page').addClass('current slideright in');
        $outElement.addClass('slideright out');

        setTimeout(function(){
            $outElement.removeClass('current slideright out');
            $('#home-page').removeClass('slideright in')    
        },250);
        
    }
}

ActivityController = {
    init:function() {
            
    },
    load:function() {
            
    },
    show:function() {
        
        var $outElement = $('#container>.page.current');
        $('#activity-page').addClass('current slideleft in');
        $outElement.addClass('slideleft out');

        setTimeout(function(){
            $outElement.removeClass('current slideleft out');
            $('#activity-page').removeClass('slideleft in')    
        },250);
        
    }
}

Template = {
    list:[],
    get:function( name ){
        if(!Template.list[name]){
            //load the template
            Template.list[name] = $( '#tpl-' + name ).html();
        }
        return Template.list[name];
    },
    render:function( name, data ) {
        return Mustache.to_html( Template.get(name), data );     
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