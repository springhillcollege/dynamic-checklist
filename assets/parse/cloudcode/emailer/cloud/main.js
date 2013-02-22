Parse.Cloud.define("sendmail_admin_new_user_reg", function(request, response) {
	var mandrill = require('mandrill');
	mandrill.initialize('g4stGFlg1DdJ2pl5x-zVEg');
  
	mandrill.sendEmail({
		message: {
			html: "<p>A new user registered for the SHC Admissions Checklist</p>" +
				"<ul><li>FB name: " + request.params.username + "</li>" +
				"<li>FB email: " + request.params.email + "</li></ul>" +
				"<p>Please remember to use this information with discretion</p>",
			subject: "SHC Admissions Application Checklist - new user",
			from_email: "noreply@shc.edu",
			from_name: "SHC Web Services",
			to: [
					{
						email: request.params.admin_user_email,
						name: request.params.admin_user_name
					}
				]
		},
		async: true
    
	},
	{
			success: function() {
				response.success("Email sent");
			},
			error: function() {
				response.error("Whoops!");
			}
	}); // end sendmail
  
});
