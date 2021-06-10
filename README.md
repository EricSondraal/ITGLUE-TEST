# ITGLUE-TEST
Mortgage Calculator API
--------------------------------

Author: Eric Sondraal
Date: 6/9/2021
INFO:
All requests return JSON data
All requests have a path prefix of '/api/v1/'
All requests return status 406 on invalid input and 'result: "fail"' in the returned JSON object
All requests return status 200 on valid input and 'result: "success"' in the returned JSON object
THE END POINTS:
.../api/v1/payment-amount/   [get]
.../api/v1/mortgage-amount/  [get]
.../api/v1/interest-rate/    [patch]
//
POSTMAN EXAMPLE:
https://www.getpostman.com/collections/704c06bcd4cc5271daea