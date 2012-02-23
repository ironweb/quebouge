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
        Router.runRoute( window.href );
    },
    addActions:function() {
        $('body').delegate('a', 'click', function(e){
            
            if(Router.History.enabled){
                e.preventDefault();
                e.stopPropagation();
            
                Router.runRoute( this.href );    
            }

        })
    }     
}

Router = {
    init:function(){
        Router.History = window.History; // Note: We are using a capital H instead of a lower h
        if ( !Router.History.enabled ) {
            // History.js is disabled for this browser.
            // This is because we can optionally choose to support HTML4 browsers or not.
            return false;
        } 

        Router.History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
            var State = Router.History.getState(); // Note: We are using History.getState() instead of event.state
            Router.History.log(State.data, State.title, State.url);
        });
    },
    runRoute:function( route ) {
         cd           
    }
}


$(document).ready(function() {
    FrontController.run();
})