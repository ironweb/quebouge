Yeah l'équipe des jaunes!!!

## API documentation

**Activities**

Send a GET request to `/activities` to get data for an occurence and
it's associated activity

Available options :

* `latlon` : point you want to calculate the distance from. Format as `nn.nnnn,nn.nnnn`
* `bb` : bounding box to filter on. add points this way : `lat1,lon1,lat2,lon2`.
Follow the `latlon` convention for each points. Cannot be used with `radius`
* `radius` : sets a radius in which you wish to search. Cannot be used with `bb`
* `max_price` : max price for activities. Send 0 for free only activities. int only.
* `cat_id` : filter by category.
* `subcat_id` : filter by subcategory. # NOT IMPLEMENTED YET
* `start_dt` : only return activities that have an occurence >= to this date time.
If only a date is submitted, 00:00:00 is appended to it.
* `end_dt` : only return activities that have an occurence < to this date time.
If only a date is submitted, 00:00:00 is appended to it.

sort api : to be determined


## Setup

    psql postgres
    CREATE DATABASE yellow_dev OWNER `your_user`;
    
    #load in required data in …
    
    # Get some data
    ./env/bin/populate_Yellow `your_config_file`;


## Technical overview of the project

*HTML5 Boilerplate
*Zepto (jQuery-like API that does not support IE)
*One-page app, minize API
    * Low latency
*Pyramid
*SQLAlchemy / GeoAlchemy
    * Submitted issues to GeoAlchemy
*PostgreSQL + spatial extensions PostGIS
*Mobile first
    * Second layout at 1024px wide
*DustJS
*Modernizr
