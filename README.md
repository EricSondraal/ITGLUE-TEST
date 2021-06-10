# ITGLUE-TEST
Mortgage Calculator API
--------------------------------

Author: Eric Sondraal<br>
Date: 6/9/2021<br>
<br>
All requests return JSON data<br>
All requests have a path prefix of '/api/v1/'<br>
All requests return status 406 on invalid input and 'result: "fail"' in the returned JSON object<br>
All requests return status 200 on valid input and 'result: "success"' in the returned JSON object<br>
THE END POINTS:<br>
.../api/v1/payment-amount/   [get]<br>
.../api/v1/mortgage-amount/  [get]<br>
.../api/v1/interest-rate/    [patch]<br>
<br>
POSTMAN EXAMPLE:<br>
https://www.getpostman.com/collections/704c06bcd4cc5271daea
