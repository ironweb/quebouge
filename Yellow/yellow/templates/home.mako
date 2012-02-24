<!doctype html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Québouge - Ici, maintenant</title>
  <meta name="description" content="">

  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
  <meta names="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  <link rel="apple-touch-icon" href="/static/images/apple-icon.png"/>

% if css_mini.enabled:
  <link rel="stylesheet" href="${css_mini.compiled_url()}">
% else:
  <link rel="stylesheet" href="/static/css/normalize.css">
  <link rel="stylesheet" href="/static/css/1140.css">
  <link rel="stylesheet" href="/static/css/layout.css">
% endif
  
  <script src="/static/js/libs/modernizr.custom.79709.js"></script>
  <script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3.6&key=AIzaSyDZIPb-rrtMF5CEVw-vq8zj-fL9ZbQoxS0&sensor=false&region=CA&language=fr">
</script>

</head>
<body>
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->
  <div role="main" id="container">
    <div class="wrap">
    <section id="geo-loader-page" class="page row current">
          <header>
            <section>
              <h1>
                <a href="/"><img src="/static/images/logo.png" title="Québouge"></a>
                <strong>Ici, maintenant</strong>
              </h1>
            </section>
          </header>

          <div class="view">
              <div class="content">
                <h2>Acquisition des coordonnées de géolocalisation</h2>
                <img src="/static/images/boussole.png" alt="Acquisition des coordonnées de géolocalisation">
              </div>
              
            </div>
            
    </section>
    <section id="home-page" class="page row">
          <header>
            <section>
              <h1>
                <a href="/"><img src="/static/images/logo.png" title="Québouge"></a>
                <strong>Ici, maintenant</strong>
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
          
          <div class="error hide">
              <div class="content">
                <h2>Aucun résultat trouvé</h2>
                <img src="/static/images/aucunresultat.png" alt="Aucun résultats trouvés">
          </div>
              
            </div>
          <div class="view">
            <div class="content"></div>
          </div>
          
    
          <footer>
    
          </footer>
        </section>
    
        <section id="activity-page" class="page row">
          <header>
            <section>
              <h1>
                <a href="/"><img src="/static/images/logo.png" title="Québouge"></a>
                <strong>Ici, maintenant.</strong>
              </h1>
            </section>
            <section class="sec">
            </section>  
    
          </header>
          
         
          <div class="view">
            <div class="content"></div>
    
            <div id="wrap-map-canvas"><div id="map-canvas"></div></div>
          </div>
          
    
          <footer>
    
          </footer>
        </section>
      </div>
  </div>
% if js_mini.enabled:
  <script src="${js_mini.compiled_url()}"></script>
% else:
  <script src="/static/js/libs/zepto.min.js"></script>
  <script src="/static/js/libs/native.history.js"></script>
  <script src="/static/js/libs/dust-full-0.3.0.js"></script>
  <script src="/static/js/libs/spin.min.js"></script>
  <script src="/static/js/core.js"></script>
% endif

% if request.params.get('mobile_app'):
  % if js_mobile_mini.enabled:
  <script src="${js_mobile_mini.compiled_url()}"></script>
  % else:
  <script src="/static/js/phonegap-1.4.1.js"></script>
  <script src="/static/js/mobile_app.js"></script>
  % endif
% endif


  <script>
    var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
    (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g,s)}(document,'script'));
  </script>




  <div id="templatejs">

    <script id="tpl_list_view" type="text/html">
      <ol>
          {#activities}
          <li class="occurence">
            <a href="/activity/{occurence_id}">
              <figure class="icon_price">
                {>partial_icon_price/}
              </figure>
              <div class="content">
                <h3>{title}</h3>
                <ul class="meta">
                  <li class="time">
                    {>partial_when/}
                  </li>
                  <li class="dist">
                    {>partial_where/}
                  </li>
                </ul>
              </div>
              <span class="arrow"></span>
            </a>   
          </li>
          {:else}
          <li>Aucun résultat</li>
          {/activities}
      </ol>  
    </script>
    <script id="tpl_map_view" type="text/html">
      <div class="colLeft">
            <h3>{title}</h3>
            <p class="address">{location}</p>
            <p class="phone"><span>Contacter la ville:</span><a href="tel:{arrond_phone}">{arrond_phone}</a></p>
      </div>
      <div class="colRight">
            <p class="time">
              {>partial_when/}
            </p>        
            <p class="price">{price}</p>

      </div>
    </script>

    <script id="partial_icon_price" type="text/html">
      <img src="/static/images/category_icons/{categ_icon}" alt="{category}" />
      <br />
      <span class="price">{price}</span>
    </script>

    <script id="partial_when" type="text/html">
        {#later_label}
          <small>{later_label}</small>
          <span>{later_time}</span>
        {/later_label}
        {#today_label}
          <small>{today_label}</small>
          <span>{today_time}</span>
        {/today_label}
        {#ends_label}
          <small>{ends_label}</small>
          <span>{ends_time}</span>
        {/ends_label}
    </script>

    <script id="partial_where" type="text/html">
        <small>PROXIMITÉ</small><span>{distance}</span> km
    </script>


    <script id="tpl_map_view_howtogo" type="text/html">
        <a class="back" href="/">back</a>
        <ul id="direction-links" class="howtogo" data-href="http://maps.google.com/maps?saddr={saddr}&daddr={location_url_safe}&oq=My+lo">
          <li><a href="#" data-dirflg="" class="car">en voiture</a></li>
          <li><a href="#" data-dirflg="w" class="foot">à pied</a></li>
          <li><a href="#" data-dirflg="r" class="bus">transport en commun</a></li>
          <li><a href="#" data-dirflg="b" class="bike">en vélo</a></li>
        </ul>
    </script>

  </div>
</body>
</html>
