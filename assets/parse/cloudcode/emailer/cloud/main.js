
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("sendmail", function(request, response) {
  var mandrill = require('mandrill');
  mandrill.initialize('g4stGFlg1DdJ2pl5x-zVEg');
  
  mandrill.sendEmail({
    message: {
      text: "Hello World!",
      subject: "New user registered via Facebook!",
      from_email: "noreply@shc.edu",
      from_name: "SHC Online Application Checklist",
      to: [
        {
          email: "chughes@shc.edu",
          name: "Chris"
        }
      ]
    },
    async: true
    },{
    success: function(httpResponse) {
      console.log(httpResponse);
      response.success("Email sent!");
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      response.error("Uh oh, something went wrong");
    }   
  }); // end sendmail
  
  response.success("Email sent!");
});
