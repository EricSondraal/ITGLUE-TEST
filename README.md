# ITGLUE-TEST
Mortgage Calculator API
--------------------------------

Author: Eric Sondraal<br>
Date: 6/9/2021<br>
<br>
All requests return JSON data<br>
All requests have a path prefix of '/api/v1/'<br>
All requests return status 406 on invalid input and 'result: "fail"' in the returned JSON object<br>
All requests return status 200 on valid input and 'result: "success"' in the returned JSON object<br><br>
<B>THE END POINTS:</B><br><br>
<B>payment-amount</B>:<br>
[get] https://itglue-test.herokuapp.com/api/v1/payment-amount/   <br>
Example:<br>
https://itglue-test.herokuapp.com/api/v1/payment-amount?asking-price=1300000&down-payment=650000&payment-schedule=biweekly&amortization-period=15<br><br>

<B>mortgage-amount</B>:<br>
[get] https://itglue-test.herokuapp.com/api/v1/mortgage-amount/  <br>
Example:<br>
https://itglue-test.herokuapp.com/api/v1/mortgage-amount?payment-amount=1200&payment-schedule=biweekly&amortization-period=25<br><br>

<B>interest-rate</B>:<br>
[patch] https://itglue-test.herokuapp.com/api/v1/interest-rate/ <br>
Example:<br>
https://itglue-test.herokuapp.com/api/v1/interest-rate<br>
<B>BODY</B>:<br>
{"interest-rate":0.0385}

<br>
<B>POSTMAN EXAMPLE:</B><br>
https://www.getpostman.com/collections/704c06bcd4cc5271daea
