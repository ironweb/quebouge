<!doctype html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Yellow team app</title>
  <meta name="description" content="">

  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="/static/css/normalize.css">
  <link rel="stylesheet" href="/static/css/1140.css">
  <link rel="stylesheet" href="/static/css/layout.css">
  
  <script src="/static/js/libs/modernizr.custom.79709.js"></script>

</head>
<body>
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
  <div role="main" id="container">
    <section id="home-page" class="page row current">
      <header>
        <section>
          <h1><a href="/">Super duper apps</a></h1>
          <a href="#" class="toggle-filters" data-state="close">Filtres</a>  
        </section>
        
        <form action="" class="state-close filter">
          <div class="row">
            <div class="sixcol">
              <label for="lst-category">Cat&eacute;gories</label>
              <select name="category" id="lst-category">
                % for category in categories:
                  <option value="${category.id}">${category.name}</option>
                % endfor
              </select>
            </div>
            <div class="sixcol last">
                 <label for="">Tarifications ($)</label>
                 <input type="range" min="0" max="30" step="5">
            </div>  
          </div>
          <div class="row">
            <div class="sixcol">
              <label for="lst-sports">Sports</label>
              <select name="sports" id="lst-sports">
                <option value="">Toutes les sports</option>
              </select>
            </div>
            <div class="sixcol last">
                 <label for="">Distances (km)</label>
                 <input type="range" min="0" max="10" step="0.5">
            </div>  
          </div>
          
        </form>
      </header>
      
     
      <div id="home-view">
        <div class="content"></div>
      </div>
      

      <footer>

      </footer>
    </section>

    <section id="activity-page" class="page row">
      <header>
        <section>
          <h1><a href="/">Super duper apps</a></h1>
          <a href="#" class="toggle-filters" data-state="close">Filtres</a>  
        </section>
        
        <form action="" class="state-close filter">
          <div class="row">
            <div class="sixcol">
              <label for="lst-category">Cat&eacute;gories</label>
              <select name="category" id="lst-category">
                <option value="">Toutes les cat&eacute;gories</option>
              </select>    
            </div>
            <div class="sixcol last">
                 <label for="">Tarifications ($)</label>
                 <input type="range" min="0" max="30" step="5">
            </div>  
          </div>
          <div class="row">
            <div class="sixcol">
              <label for="lst-sports">Sports</label>
              <select name="sports" id="lst-sports">
                <option value="">Toutes les sports</option>
              </select>    
            </div>
            <div class="sixcol last">
                 <label for="">Distances (km)</label>
                 <input type="range" min="0" max="10" step="0.5">
            </div>  
          </div>
          
        </form>
      </header>
      
     
      <div id="activity-view">
        <div class="content"></div>
      </div>
      

      <footer>

      </footer>
    </section>
  </div>
  <!--<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>-->
  <script src="//cdnjs.cloudflare.com/ajax/libs/zepto/0.8/zepto.min.js"></script>
  <!--<script>window.jQuery || document.write('<script src="/static/js/libs/jquery-1.7.1.min.js"><\/script>')</script>-->
  <script src="/static/js/libs/mustache-0.4.0.min.js"></script>
  <script src="/static/js/libs/native.history.js"></script>
  <script src="/static/js/davis.light.js"></script>
  <script src="/static/js/core.js"></script>

  <script>
    var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
    (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g,s)}(document,'script'));
  </script>
  <div id="templatejs">

    <script id="tpl-list-view" type="text/x-mustache-template">
      <ol>
          {{#activities}}
          <li>
            <a href="/show/{{id}}"> 
              <figure>
                <img src="/static/images/{{category}}.gif" alt="{{category}}" />  
              </figure>
              <div class="content">
                <h3>{{title}}</h3>
                <ul class="meta">
                  <li><small>Aujoud'hui</small>{{when}}</li>
                  <li><small>Distance</small>{{distance}}</li>
                  <li><small>Prix</small>{{price}} $</li>
                </ul>
              </div>
              <span class="arrow"></span>
            </a>   
          </li>
          {{/activities}}
      </ol>  
    </script>
    <script id="tpl-map-view" type="text/x-mustache-template">
      
    </script>
  </div>
</body>
</html>
