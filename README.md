a simple article managment system and final project for maktab sharif.

the server run on 3000.

in /tools/database.js you can change the url of localhost.
it will create three collections called users, articles and comments.

to add an admin use Postman and Send a Post Request to /api/veisi/add_admin with this information in the below:
[ role , first_name , last_name , username , phone , password , gender ]
and send it as JSON.

remember you can only add one admin not more.
