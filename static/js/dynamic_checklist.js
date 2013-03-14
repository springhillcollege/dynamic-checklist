/*

Build and persist checkboxes 
    
*/

// Facebook developer: https://developers.facebook.com/apps


var do_checker = function() {
	// can the browser handle it?
	return window.JSON && window.JSON.parse;
}

var make_checkbox = function(context) {
	// add a checkbox item to each checker
	context.prepend('<span class="checkbox"></span>') //add the "checkbox"
	context.find(".checkbox").css("height", context.css("height"));
}

var show_message = function() {
	// gather data about checkboxes and update status
	if (message_area.length >= 1) {
		$(".n_checked").html($(".checked").length)
		$(".n_checker").html($(".checker").length)
		if (currentUser) {
			$(".username").html(localUserName)
		}
		message_area.show()
	}
}

var show_anon_msg = function() {
	// only display messages designed for anon users
	$(".anon").show();
	$(".loggedin").hide();
}

var show_loggedin_msg = function() {
	// only display the messages designed for logged in
	$(".anon").hide();
	$(".loggedin").show();
}

var check_complete = function() {
	// show message if all checkboxes are checked
	if (checkers.length == $('.checker.checked').length) {
		$.pnotify({
			title: messages.done.title,
			text: messages.done.text,
			type: 'success',
		})
	}
}

var build_checkers = function() {
	// build our checklist
	var chklist = null
	var checked = []
	
	var ApplicationChecklist = Parse.Object.extend("ApplicationChecklist")
	
	// ensure we start with a clean slate
	$(".checkbox").remove()
	checkers.removeClass("checked").addClass("active")
	checkers.off('click')

	// configure all of the active checker items
	checkers.each(function() {
		var checker = $(this)
		make_checkbox(checker)
		var checkbox = checker.find(".checkbox")
		// add active class as a styling hook
		checkbox.on('click', function() {
			checkbox.addClass("checker_working")
			// add or remove the id of this item from storage
			if (checker.hasClass("checked")) {
				chklist.remove("checked", checker.attr("id"))
			}
			else {
				chklist.addUnique("checked", checker.attr("id"))
			}
			// save data to Parse
			chklist.save({
				success: function(object) {
					checker.toggleClass("checked");
					show_message()
					checkbox.removeClass("checker_working")
					check_complete()
				},
				error: function(model, error) {
					$.pnotify({
						title: messages.saveError.title,
						text: messages.saveError.text,
						type: 'error',
					})
				}
			});
		})
	})

	// show that we are working on something
	$(".checker_message .status").addClass("checker_working")
	// Grab initial data if available
	var query = new Parse.Query("ApplicationChecklist")
	query.equalTo("user", currentUser)
	
	query.first({
		success: function(results) {
			if (!results) {
				// no data for this user, create some
				chklist = new ApplicationChecklist()
				chklist.set("user", currentUser)
				// only allow access to this data for the current user
				chklist.setACL(new Parse.ACL(Parse.User.current()));
			}
			else {
				// if we have data, use it!
				var checked = results.get("checked")
				$.each(checked, function(i, val) {
					$("#" + val + " .checkbox").closest(".checker").addClass("checked")
				})
				chklist = results
				check_complete()
			}
			show_message()
			$(".checker_message .status").removeClass("checker_working")
		},
		error: function(error){
			//console.log("could not load data")
			$(".checker_message .status").removeClass("checker_working")
		}
	})
}

var build_dummy_checkers = function() {
	// remove existing checkbox items
	$(".checkbox").remove()
	// reset classes and event handlers on checker items
	checkers.off('click')
	checkers.removeClass('checked')
	checkers.addClass('active')
	// add checkboxes and bind login message
	checkers.each(function() {
		make_checkbox($(this))
		$(this).find(".checkbox").on('click', function() {
			permanotice_login = $.pnotify({
				title: messages.loginRequired.title,
				text: messages.loginRequired.text,
				type: 'info',
				hide: false // this one is important, so make it sticky
			})
			//do_login()
		})
	})
}

var do_login = function() {
	Parse.FacebookUtils.logIn("email", {
		success: function(user) {
			try {
				permanotice_login.pnotify_remove()
			} catch(err) { /*do nothing*/ }
			currentUser = user
			build_checkers()
			console.log(currentUser)
			if (!currentUser.existed()) {
				// grab and save fb user name and email
				FB.api('/me', function(response) {
					currentUser.set("name",response.name)
					localUserName = response.name
					currentUser.set("email",response.email)
					currentUser.set("login_source","fb")
					currentUser.save(null, {
						success: function() {
							// User signed up and logged in through Facebook
							$.pnotify({
								title: messages.fbRegistered.title + localUserName,
								text: messages.fbRegistered.text,
								type: 'info',
							})
							send_email_on_new_user_reg()
						}
					})
				});
				
			} else {
				// User logged in through Facebook
				localUserName = currentUser.get('name')
				$.pnotify({
					title: messages.fbLogin.title + localUserName,
					text: messages.fbLogin.text,
					type: 'info',
				})
			}
			show_loggedin_msg()
			show_message()
		},
		error: function(user, error) {
			$.pnotify({
				title: messages.fbLoginError.title,
				text: messages.fbLoginError.text,
				type: 'error',
			})
		}
	});
}

var send_email_on_new_user_reg = function() {
	// Let someone know we have a new user registration
	Parse.Cloud.run('sendmail_admin_new_user_reg', {
			'admin_user_name': admin_user_name,
			'admin_user_email': admin_user_email,
			'username': localUserName,
			'email': currentUser.get('email')
	},
	{});
}

var clean_up_menu = function(context) {
	// on load, clean up the menu to work with bootstrap
	// context = $("#admiss_menu")
	context.find('*').removeClass("active active-trail")
	context.find("ul").addClass("nav nav-list")
	// add submenus
	context.find('.expanded').each(function() {
		list = $(this)
		list.addClass("dropdown")
		list.find("a:first").addClass("dropdown-toggle").attr({'href':'#', 'data-toggle':'dropdown'}).append('<b class="caret"></b>')
		list.find("ul").addClass('dropdown-menu')
	})
	// set block title as menu title
	var title = $("#admiss_menu h2")
	$("#admiss_menu ul").first().prepend('<li class="nav-header">' + title.text() + '</li>')
	title.remove()
}

// load the menu partials cached from shc.edu
var loadPartials = function(partials, callback) {
	$.each(partials, function(i,v) {
		var self = $(v.selector)
		$.ajax({
			url: v.url,
			cache: false
		}).done(function( html ) {
			self.html(html)
			consoleLog(v.selector + " : " + v.callback + " : " + callback)
			if (v.callback) {
				v.callback(self)
			}
			if (callback) {
				callback(self)
			}
		})

		// if (v.callback) {
		// 	$.ajax({
		// 			url: v.url,
		// 			cache: false
		// 		}).done(function( html ) {
		// 			$(v.selector).html(html);
		// 		});
		// 	//$(v.selector).load(v.url, v.callback)
		// }
		// else {
		// 	$.ajax({
		// 			url: v.url,
		// 			cache: false
		// 		}).done(function( html ) {
		// 			$(v.selector).html(html);
		// 		});
		// 	// $(v.selector).load(v.url)
		// }
	})
}

var fix_links = function(context) {
	context.find("a").each(function() {
        href = $(this).attr("href") + "?device=desktop"
        if (href.indexOf("#") == -1 ) {
            $(this).attr("href", href)
        }
    })
}


/* Edit these if needed */

var this_url = "https://www.shc.edu/sandbox/dynamic-checklist/"
var this_url_tracker = this_url + "?utm_source=facebook&utm_medium=online&utm_campaign=you_gotta_see_this"
var page_partial_cache_url = "https://www.shc.edu/assets/page-partials/"

var partials = [
	{url: page_partial_cache_url + "remote_menu.main.inner.html", selector: "#main-menu", callback: null },
	{url: page_partial_cache_url + "remote_menu.secondary.admiss.how_to_apply.html", selector: "#admiss_menu .ajax", callback: clean_up_menu },
	{url: page_partial_cache_url + "remote_menu.services.html", selector: "#footer .service_menu", callback: null },
	{url: page_partial_cache_url + "remote_menu.social.html", selector: "#footer .social_menu", callback: null }
]

var admin_user_name = "SHC Admissions"
//var admin_user_email = "web_admiss@shc.edu"
var admin_user_email = "chughes@shc.edu"

var messages = {
	'done' : {
		title: 'All done!',
		text: "Congrats! You're ready to be a Badger!"
	},
	'loginRequired': {
		title: 'You can log in with Facebook',
		text: 'and we will keep track of your progress.<br><a href="#" class="login btn">Login now</a><br><small>There&lsquo;s also a login link in the sidebar'
	},
	'fbRegistered': {
		title: 'Hi ',
		text: 'You have successfully registered through Facebook.'
	},
	'fbLogin': {
		title: 'Hi ',
		text: 'You have successfully signed in through Facebook.'
	},
	'fbLoginError': {
		title: 'Whoops',
		text: 'User cancelled the Facebook login or did not fully authorize.'
	},
	'logout': {
		title: 'Bye',
		text: 'You have successfully signed out.'
	},
	'saveError': {
		title: 'Whoops',
		text: 'Something went wrong and your choice was not saved. Please try again.'
	}
}

/* Don't change anything else */

var checkers = $(".checker")
var message_area = $(".checker_message")
var login_link = $("a.login")
var logout_link = $("a.logout")

var currentUser = null
var localUserName = "User"

ks.ready(function() {

    var currentUser = Parse.User.current()
    
    // set a shorter pines notify default delay
    $.pnotify.defaults.delay = 3000;
    
    // TEST
    //~ $('#destroy').on('click', function() {
        //~ currentUser.destroy({
            //~ success: function(obj) {
                //~ alert("destroyed!")
            //~ }
        //~ })
    //~ })
    
    // TEST
    //~ $('#sendmail').on('click', function() {
        //~ send_email_on_new_user_reg()
	//~ })
	
	// prettify link buttons
	$('.checklist a.btn').append('&nbsp;<i class="icon-chevron-right"></i>')
	$('.content a.btn-info i').addClass('icon-white')
    
    // bind login and buttons
    $('body').on('click', '.login', function() {
        do_login()
        return false
    })
    logout_link.on('click', function() {
        Parse.User.logOut()
        show_anon_msg()
        build_dummy_checkers()
        $.pnotify({
			title: messages.logout.title,
			text: messages.logout.text,
			type: 'info'
		})
        return false
    })
    
    // if we have a modern browser and a current user
    if (do_checker() && currentUser) {
        build_checkers()
        show_loggedin_msg()
        show_message()
    } // end if
    
    // user is not logged in
    else if (do_checker) {
        build_dummy_checkers()
        show_anon_msg()
        show_message()
    }
    
    // in older browsers, just create empty checkboxes
    else {
        build_dummy_checkers()
    } // end else

	loadPartials(partials, fix_links)

});

