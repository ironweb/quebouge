Yeah l'équipe des jaunes!!!

## API documentation

**Activities**

Send a GET request to `/activities` to get datas for activities and
their asssociated occurences

Available options :
* `latlon` : point you want to calculate the distance from. Format as `nn.nnnn,nn.nnnn`
* `bb` : bounding box to filter on. add points this way : `lat1,lon1,lat2,lon2`.
Follow the `latlon` convention for each points.
* `max_price` : max price for activities. Send 0 for free only activities. int only.
* `cat_id` : filter by category.
* `subcat_id` : filter by subcategory.
* `start_dt` : only return activities that have an occurence >= to this date time.
If only a date is submitted, 00:00:00 is appended to it.
* `end_dt` : only return activities that have an occurence < to this date time.
If only a date is submitted, 00:00:00 is appended to it.

sort api : to be determined
