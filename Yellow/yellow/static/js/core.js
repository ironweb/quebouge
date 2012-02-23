/**
 * Front Controller
 */
FrontController = {
    run:function() {
        Router.init();
        FrontController.addActions();

        //start app
        FrontController.start();        
    },
    start:function() {
        Router.run( window.href );
    },
    addActions:function() {
        $('body').delegate('a', 'click', function(e){
            
            if(Router.History.enabled){
                e.preventDefault();
                e.stopPropagation();
                
                History.pushState({state:1}, this.title, this.href);    
            }

        })
    }     
}

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

$(document).ready(function() {
    FrontController.run();
})