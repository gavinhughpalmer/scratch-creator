const { UserAgentService } = require("./services/useragent");
const express = require("express");
const path = require("path");
const request = require("request");
const PORT = process.env.PORT || 5000;

// Pass in the repo URL through query params, then provide OAuth flow to Salesforce dev hub (ie must be production, or custom URL so could redirect straight away...)
// Open up the oauth app to see how it was done in there
const app = express();
const authInstance = new UserAgentService();

app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get("/", (req, res) => {
  // Instantiate the service to create the URL to call
  const userAgentUrlWithParameters = authInstance.generateUserAgentRequest();

  // Launch the HTTP GET request based on the constructed URL with parameters
  console.log("Sending GET request: " + userAgentUrlWithParameters);
  handleGetRequest(userAgentUrlWithParameters, res);
  console.log(
    "Once user authorizes the app, a redirect will be performed to the oauthcallback page"
  );
});

/**
 * Handle OAuth callback from Salesforce and parse the result.
 * Result is parsed in oauthcallback.ejs.
 */
app.get("/oauthcallback", function (req, res) {
  let code = req.query.code;
  let returnedState = req.query.state;
  console.log(authInstance);
  let originalState = authInstance ? authInstance.state : undefined;

  console.log("Callback received, parsing response...");
  if (code) {
    // If an authorization code is returned, check the state and continue web-server flow.
    if (returnedState === originalState) {
      // Web Server instance was already created during first step of the flow, just send the request
      let postRequest = authInstance.generateTokenRequest(code);

      // Send the request to the endpoint and specify callback function
      handlePostRequest(postRequest, res);
    } else {
      res
        .status(500)
        .end(
          "Error occurred: " +
            "\nCross App / Site Request Forgery detected!" +
            "\nReturned state: " +
            returnedState +
            "\nOriginal state: " +
            originalState
        );
    }
  } else {
      // If no authorization code is returned, render oauthcallback.
      // We need client-side Javascript to get to the fragment (after #) of the URL.
      res.render('oauthcallback');
  }
});


function handleGetRequest(getRequest, res) {
  request({ method: 'GET', url: getRequest }).pipe(res);
}