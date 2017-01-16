# uthgard-players-lookup
A web-based tool to lookup and compare player info from the DAOC Uthgard server.
Uses vue.js and connects to the uthgard server api at https://uthgard.org/herald/api/player/____

You can view this tool at:  http://poism.com/daoc/

Unforunately, attempting to pull the data directly via JS resulted in Cross-Origin Request Blocked.
So to work-around this, JS fetches from the local api.php which simply uses CURL to fetch the data from Uthgard API.

Right now the api.php file accepts a comma separated list of names and then sends each individual name request to the Uthgard API.  Moving forward, I'd like to rewrite the JS side to send multiple requests as if it were handling the native Uthgard API (assuming eventually there won't be the Cross-Origin issue).

Originally I planned on expanding the api.php file; for instance, to reduce hits on the uthgard api by caching the requested data locally and only refreshing it every so often when new data is expected (if I could figure out the refresh cycle of the server's player data).  Since it seems like the API's data is pretty old anyway I doubt this script hitting the API will be much of a performance concern, so caching this data seems unecessary.

-Po (Mistar Nooblar)