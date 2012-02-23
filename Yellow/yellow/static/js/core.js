/**
 * Front Controller
 */
FrontController = {
    init:function() {
        FrontController.addActions();

        //prepare controller
        SearchController.init();


        FrontController.start();    
    },
    start:function() {
        //add future router here
        SearchController.load();      
    },
    addActions:function() {
        $('body').delegate('a', 'click', function(e){
            
            if(Router.History.enabled){
                e.preventDefault();
                e.stopPropagation();
                
                //History.pushState({state:1}, this.title, this.href);    
            }

        })
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
            activities:[{id:476,category:"test",desc:"jgnsdfbgfdb", distance:"0.5km"},{id:476,category:"test",desc:"jgnsdfbgfdb", distance:"0.5km"},{id:476,category:"test",desc:"jgnsdfbgfdb", distance:"0.5km"},{id:476,category:"test",desc:"jgnsdfbgfdb", distance:"0.5km"}]
        }

        $('#home-view').children('.content').html( Template.render('list-view', data) );
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