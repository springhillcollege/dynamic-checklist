Parse.Cloud.define("sendmail_admin_new_user_reg", function(request, response) {
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
