///////////////////////////////////////////////////////////////////////////////////////////////////////////
// <Mortgage Calculator>
// Author: Eric Sondraal
// Date: 6/9/2021
// INFO:
// All requests return JSON data
// All requests have a path prefix of '/api/v1/'
// All requests return status 406 on invalid input and 'result: "fail"' in the returned JSON object
// All requests return status 200 on valid input and 'result: "success"' in the returned JSON object
// THE END POINTS:
// .../api/v1/payment-amount/   [get]
// .../api/v1/mortgage-amount/  [get]
// .../api/v1/interest-rate/    [patch]
//
// POSTMAN EXAMPLE:
// https://www.getpostman.com/collections/704c06bcd4cc5271daea
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//requirements to run the server
const cors = require("cors");
const express = require("express");
const { json } = require("express");
const app = express();
app.use(express.json());

//port number
const PORT = process.env.PORT || 3000;
//the end point url
const endPointRoot = "/api/v1/";

//the defualt interest rate
let IR = 0.025;

//set the header for the responses
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", false);
  res.header("Access-Control-Max-Age", "86400");
  res.header("Content-Type", "application/json");
  next();
});

//start the server
app.listen(PORT, (err)=>{
  if (err) throw err;
  console.log("Listening to port: ", PORT);
});



// <<<ENDPOINT>>>
// [GET] /payment-amount/
// determines how much money will need to be payed each period 
// req                  - the request from the client
// res                  - the responce to the client
// <<<PARAMETERS>>>
// asking-price         - the mortgage amount
// down-payment         - the initial payment on the mortgage
// payment-schedule     - the frequency of payments
// amortization-period  - the amount of years to pay off the mortgage
// <<<RESPONCE>>>
// JSON DATA
// result: fail / success
// if the method fails a error message will be sent detailing the error with a status code
// if the method is successful the payment amount / period will be returned
app.get(endPointRoot + "payment-amount/", (req, res) => {
  //make sure the input is okay
  if((typeof req.query["asking-price"] !== "string") || (typeof req.query["down-payment"] !== "string")
  || (typeof req.query["payment-schedule"] !== "string") || (typeof req.query["amortization-period"] !== "string")) {
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: wrong input types"
    });
    return;
  }

  //parse the requests parameters
  let askingPrice = Number(req.query["asking-price"]);
  let downPayment = Number(req.query["down-payment"]);
  let paymentSchedule = req.query["payment-schedule"];
  let amortizationPeriod = Number(req.query["amortization-period"]);
  
  //make sure the inputs that are numbers are being parsed properly
  if(isNaN(askingPrice) || isNaN(downPayment)|| isNaN(amortizationPeriod)){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: askingPrice, downPayment, and amortizationPeriod must be numbers"
    });
    return;
  }

  //check if there is enough of a down payment
  if(IsDownPaymentTooLow(downPayment,askingPrice)){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: Down Payment Is Too Low"
    });
    return;
  }

  //calculate how much the insurance will cost
  let insurancePrice = GetInsuranceCost(downPayment,askingPrice);
  let totalPrice = askingPrice + insurancePrice;

  //check how many times they need to pay a year
  let paymentsPerYear = ConvertPaymentSchedule(paymentSchedule);
  if(paymentsPerYear === -1){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: paymentSchedule must be 'weekly', 'biweekly', or 'monthly'"
    });
    return;
  }

  //check if the time it will take to pay off the mortgage is between 5 to 25 years
  if((amortizationPeriod<5)||(amortizationPeriod>25)){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: the mortgage must be paid off between 5 to 25 years"
    });
  }

  //finally everything is good and we can calculate the payment amount
  let p = totalPrice;
  let r = IR / paymentsPerYear;
  let n = paymentsPerYear * amortizationPeriod;

  let paymentAmount = (p * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1);

  res.json({
    result: "success",
    paymentAmount: paymentAmount
  });
});



// <<<ENDPOINT>>>
// [GET] /mortgage-amount/
// determines what the max mortgage is
// req                  - the request from the client
// res                  - the responce to the client
// <<<PARAMETERS>>>
// payment-amount       - the amount of payment / period
// payment-schedule     - the frequency of payments
// amortization-period  - the amount of years to pay off the mortgage
// <<<RESPONCE>>>
// JSON DATA
// result: fail / success
// if the method fails a error message will be sent detailing the error with a status code
// if the method is successful the max mortgage will be returned
app.get(endPointRoot + "mortgage-amount/", (req, res) => {
  //make sure the input is okay
  if((typeof req.query["payment-amount"] !== "string") || (typeof req.query["payment-schedule"] !== "string")
  || (typeof req.query["amortization-period"] !== "string")) {
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: wrong input types"
    });
    return;
  }

  //parse the requests parameters
  let paymentAmount = Number(req.query["payment-amount"]);
  let paymentSchedule = req.query["payment-schedule"];
  let amortizationPeriod = Number(req.query["amortization-period"]);
  
  //make sure the inputs that are numbers are being parsed properly
  if(isNaN(paymentAmount)|| isNaN(amortizationPeriod)){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: paymentAmount and amortizationPeriod must be numbers"
    });
    return;
  }

  //check how many times they need to pay a year
  let paymentsPerYear = ConvertPaymentSchedule(paymentSchedule);
  if(paymentsPerYear === -1){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: paymentSchedule must be 'weekly', 'biweekly', or 'monthly'"
    });
    return;
  }

  //check if the time it will take to pay off the mortgage is between 5 to 25 years
  if((amortizationPeriod<5)||(amortizationPeriod>25)){
    res.status(406);
    res.json({
      result: "fail",
      message: "Error: the mortgage must be paid off between 5 to 25 years"
    });
  }

  //finally everything is good and we can calculate the maximum mortgage
  let m = paymentAmount;
  let r = IR / paymentsPerYear;
  let n = paymentsPerYear * amortizationPeriod;

  let mortgageAmount = (m * (((1 + r) ** n) - 1)) / (r * ((1 + r) ** n));

  res.json({
    result: "success",
    mortgageAmount: mortgageAmount
  });
});



// <<<ENDPOINT>>>
// [GET] /interest-rate/
// change the interest rate that is used for this application
// req                  - the request from the client
// res                  - the responce to the client
// <<<PARAMETERS>>>
// interest-rate       - the new interst rate amount
// <<<RESPONCE>>>
// JSON DATA
// result: fail / success
// if the method fails a error message will be sent detailing the error with a status code
// if the method is successful the newInterestRate and the oldInterestRate will be returned
app.patch(endPointRoot+'interest-rate/', function (req, res) {
  //parse the body of the request
  let body="";
  req.on('data', function(chunk){
    if(chunk != null){
      body +=chunk;
    }
  });

  //when the body has been parsed
  req.on('end', function(){
    let jsonBody;

    //body might not be a json object
    try{
      jsonBody = JSON.parse(body);
    } catch (err) {
      res.status(406);
      res.json({
        result: "fail",
        message: "Error: Unparsable Json"
      });
      return;
    }

    //make sure the input is okay
    if(typeof jsonBody["interest-rate"] !== "number") {
      res.status(406);
      res.json({
        result: "fail",
        message: "Error: wrong input types"
      });
      return;
    }

    let newInterestRate = jsonBody["interest-rate"];
    let oldInterestRate = IR;

    //make sure the new interest rate is greater than 0;
    if(newInterestRate <= 0){
      res.status(406);
      res.json({
        result: "fail",
        message: "Error: interest rate must be greater than 0"
      });
      return;
    }

    res.json({
      result: "success",
      oldInterestRate: oldInterestRate,
      newInterestRate: newInterestRate
    });
    IR = newInterestRate;
  });
});



// GetInsuranceCost
// calculates the insurance cost given the down payment and asking price
// <<<PARAMETERS>>>
// downPayment          - the intial payment on the mortgage
// askingPrice          - how much money for the mortgage is being requested
// <<<RETURN>>>
// the insurance cost
function GetInsuranceCost(downPayment, askingPrice){
  let downPaymentPercentage = downPayment / askingPrice;
  if(askingPrice>1000000){
    return 0;
  }else if((downPaymentPercentage>=0.05) && (downPaymentPercentage<0.10)){
    return 0.0315 * askingPrice;
  } else if((downPaymentPercentage>=0.10) && (downPaymentPercentage<0.15)){
    return 0.0240 * askingPrice;
  } else if((downPaymentPercentage>=0.15) && (downPaymentPercentage<0.20)){
    return 0.0180 * askingPrice;
  } 
  return 0;
}



// IsDownPaymentTooLow
// checks if the down payment is not enough for the mortgage
// <<<PARAMETERS>>>
// downPayment          - the intial payment on the mortgage
// askingPrice          - how much money for the mortgage is being requested
// <<<RETURN>>>
// if the down payment is not enough
function IsDownPaymentTooLow(downPayment, askingPrice){
  let minDownPayment;

  if(askingPrice > 500000){
    let amountLeft = askingPrice;
    amountLeft -= 500000;
    minDownPayment = 500000 * 0.05;
    minDownPayment += amountLeft * 0.1;
  } else{
    minDownPayment = askingPrice * 0.05;
  }

  return downPayment < minDownPayment;
}



// ConvertPaymentSchedule
// converts a string that discribes the payment period into payments / year
// <<<PARAMETERS>>>
// paymentSchedule      - a string that discribes the payment period (weekly / biweekly / monthly)
// <<<RETURN>>>
// the payment period into payments / year
function ConvertPaymentSchedule(paymentSchedule){
  if(paymentSchedule.toLowerCase() === "weekly"){
    return 52;
  } else if(paymentSchedule.toLowerCase() === "biweekly"){
    return 26;
  } else if(paymentSchedule.toLowerCase() === "monthly"){
    return 12;
  }
  return -1;
}
