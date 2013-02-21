
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("sendmail", function(request, response) {
  var mandrill = require('mandrill');
  mandrill.initialize('g4stGFlg1DdJ2pl5x-zVEg');
  
  mandrill.sendEmail({
	  
	  {
		"key": "g4stGFlg1DdJ2pl5x-zVEg",
		"template_name": "shc application checklist - notify new user registrations",
		//"template_content": [
			//{
				//"name": "example name",
				//"content": "example content"
			//}
		//],
		"message": {
			//"text": "example text",
			"subject": "SHC Admissions Application Checklist",
			"from_email": "noreply@shc.edu",
			"from_name": "SHC Web Services",
			"to": [
				{
					"email": request.params.admin_user_email,
					"name": request.params.admin_user_name
				}
			],
			//"headers": {
				//"...": "..."
			//},
			//"track_opens": true,
			//"track_clicks": true,
			//"auto_text": true,
			//"url_strip_qs": true,
			//"preserve_recipients": true,
			//"bcc_address": "message.bcc_address@example.com",
			//"global_merge_vars": [
				//{
					//"name": "example name",
					//"content": "example content"
				//}
			//],
			"merge_vars": [
				{
					"rcpt": admin_user_email,
					"vars": [
						{
							"name": "ADMIN_USER_NAME",
							"content": request.params.admin_user_email
						},
						{
							"name": "NAME",
							"content": request.params.username
						},
						{
							"name": "EMAIL",
							"content": request.params.email
						},
					]
				}
			],
			//"tags": [
				//"example tags[]"
			//],
			//"google_analytics_domains": [
				//"..."
			//],
			//"google_analytics_campaign": "...",
			//"metadata": [
				//"..."
			//],
			//"recipient_metadata": [
				//{
					//"rcpt": "example rcpt",
					//"values": [
						//"..."
					//]
				//}
			//],
			//"attachments": [
				//{
					//"type": "example type",
					//"name": "example name",
					//"content": "example content"
				//}
			//],
			//"images": [
				//{
					//"type": "example type",
					//"name": "example name",
					//"content": "example content"
				//}
			//]
		//},
		"async": true
	}
	  
	  
    //message: {
      //text: "Hello World!",
      //subject: "New user registered via Facebook!",
      //from_email: "noreply@shc.edu",
      //from_name: "SHC Online Application Checklist",
      //to: [
        //{
          //email: "chughes@shc.edu",
          //name: "Chris"
        //}
      //]
    //},
    //async: true
    //},{
    //success: function(httpResponse) {
      //console.log(httpResponse);
      //response.success("Email sent!");
    //},
    //error: function(httpResponse) {
      //console.error(httpResponse);
      //response.error("Uh oh, something went wrong");
    //}   
  }); // end sendmail
  
  response.success("Email sent!");
});
