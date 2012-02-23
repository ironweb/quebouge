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
  <meta names="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  <link rel="stylesheet" href="/static/css/normalize.css">
  <link rel="stylesheet" href="/static/css/1140.css">
  <link rel="stylesheet" href="/static/css/layout.css">
  
  <script src="/static/js/libs/modernizr.custom.79709.js"></script>
  <script src="/static/js/libs/modernizr.custom.79709.js"></script>
	<script type="text/javascript"
    src="http://maps.googleapis.com/maps/api/js?sensor=true">
</script>

</head>
<body>
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
  <div role="main" id="container">
    <section id="home-page" class="page row current">
      <header>
        <section>
          <h1>
            <a href="/"><img src="/static/images/logo.png" title="Québouge"></a>
            <strong>Ici, maintenant.</strong>
          </h1>
        </section>
        
        <form action="" class="state-close filter filterbox">
              
            <select name="category" id="lst-category">
              % for category in categories:
                <option value="${category.id}">${category.name}</option>
              % endfor
            </select>

        </form>
      </header>
      
     
      <div class="view">
        <div class="content"></div>
      </div>
      

      <footer>

      </footer>
    </section>

    <section id="activity-page" class="page row">
      <header>
        
        <section>
          <h1><a href="/" class="back">&lt; Retour</a></h1>
          <a href="#" class="toggle-filters" data-state="close">Partager</a>  
        </section>

        <div id="map-canvas"></div>

      </header>
      
     
      <div class="view">
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
  <script src="/static/js/libs/spin.min.js"></script>
  <script src="/static/js/libs/native.history.js"></script>
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
          <li class="occurence">
            <a href="/show/{{id}}"> 
              <figure>
                <img src="/static/images/default.png" alt="{{category}}" style="width:50px;" /><br />
                <span class="price">{{price}}</span>
              </figure>
              <div class="content">
                <h3>{{title}}</h3>
                <ul class="meta" style="margin-top: 3px;">
                  <li class="time">
                    {{#later_label}}
                      <small>{{later_label}}</small>
                      <span>{{later_time}}</span>
                    {{/later_label}}
                    {{#today_label}}
                      <small>{{today_label}}</small>
                      <span>{{today_time}}</span>
                    {{/today_label}}
                    {{#ends_label}}
                      <small>{{ends_label}}</small>
                      <span>{{ends_time}}</span>
                    {{/ends_label}}
                  </li>
                  <li class="dist"><small>PROXIMITÉ</small><span>{{distance}}</span> km</li>
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
