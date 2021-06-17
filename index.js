const { WebServerService } = require("./services/webserver");
const express = require("express");
const path = require("path");
const request = require("request");
const PORT = process.env.PORT || 5000;

// Pass in the repo URL through query params, then provide OAuth flow to Salesforce dev hub (ie must be production, or custom URL so could redirect straight away...)
// Open up the oauth app to see how it was done in there
const app = express();
const authInstance = new WebServerService();

app
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.use(express.static(__dirname + "/client"));
app.get("/", (req, res) => {
  // Instantiate the service to create the URL to call
  const authorizationUrl = authInstance.generateAuthorizationRequest();

  // Launch the request to get the authorization code

  // Launch the HTTP GET request based on the constructed URL with parameters
  console.log("Sending GET request: " + authorizationUrl);
  handleGetRequest(authorizationUrl, res);
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
  // If an authorization code is returned, check the state and continue web-server flow.
  // if (returnedState == originalState) {
    // Web Server instance was already created during first step of the flow, just send the request
    let postRequest = authInstance.generateTokenRequest(code);

    // Send the request to the endpoint and specify callback function
    handlePostRequest(postRequest, res);
  // } else {
  //   res
  //     .status(500)
  //     .end(
  //       "Error occurred: " +
  //         "\nCross App / Site Request Forgery detected!" +
  //         "\nReturned state: " +
  //         returnedState +
  //         "\nOriginal state: " +
  //         originalState
  //     );
  // }
});

function handleGetRequest(getRequest, res) {
  request({ method: "GET", url: getRequest }).pipe(res);
}

/**
 * Send the POST request and process the response. Show an error if anything goes wrong.
 *
 * @param {JSON Object} postRequest The JSON object containing details on the POST request.
 * @param {*} res The response object from Node.js.
 */
function handlePostRequest(postRequest, res) {
    request(postRequest, function (error, remoteResponse, remoteBody) {
        // Handle error or process response
        if (error) {
            res.status(500).end('Error occurred: ' + JSON.stringify(error));
        } else {
            let { error, accessTokenHeader, refreshToken, redirect } = authInstance.processCallback(remoteBody);
            processResponse(error, accessTokenHeader, refreshToken, redirect, res);
        }
    });
}
