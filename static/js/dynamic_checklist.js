/*

Build and persist checkboxes 
    
*/

// Facebook developer: https://developers.facebook.com/apps

var this_url = "https://www.shc.edu/sandbox/dynamic-checklist/"
var this_url_tracker = this_url + "?utm_source=facebook&utm_medium=online&utm_campaign=you_gotta_see_this"
var page_partial_cache_url = "https://www.shc.edu/assets/page-partials/"

var remote_main_menu_url = page_partial_cache_url + "remote_menu.main.inner.html"
var remote_admiss_menu_url = page_partial_cache_url + "remote_menu.secondary.admiss.how_to_apply.html"
var remote_services_menu_url = page_partial_cache_url + "remote_menu.services.html"
var remote_social_menu_url = page_partial_cache_url + "remote_menu.social.html"

var admin_user_name = "SHC Admissions"
//var admin_user_email = "web_admiss@shc.edu"
var admin_user_email = "chughes@shc.edu"

var currentUser = null

ks.ready(function() {

    var do_checker = function() {
        // can the browser handle it?
        return window.JSON && window.JSON.parse;
    }

    var make_checkbox = function(context) {
		// add a checkbox item to each checker
        context.prepend('<span class="checker_item"></span>') //add the "checkbox"
        context.find(".checker_item").css("height", context.css("height"));
    }

    var show_message = function() {
		// gather data about checkboxes and update status
        if (message_area.length >= 1) {
            $(".n_checked").html($(".checked").length)
            $(".n_checker").html($(".checker").length)
            if (currentUser) {
                $(".username").html(currentUser.get("name"))
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
				title: 'All done!',
				text: "Congrats! You're ready to be a Badger!",
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
        $(".checker_item").remove()
        checkers.removeClass("checked").addClass("active")
        checkers.off('click')

        // configure all of the active checker items
        checkers.each(function() {
            var checker = $(this)
            make_checkbox(checker)
            var checker_item = checker.find(".checker_item")
            // add active class as a styling hook
            checker_item.on('click', function() {
                checker_item.addClass("checker_working")
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
                        checker_item.removeClass("checker_working")
                        check_complete()
                    },
                    error: function(model, error) {
                        alert("Something went wrong and your choice was not saved. Please try again.")
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
                        $("#" + val + " .checker_item").closest(".checker").addClass("checked")
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
        $(".checker_item").remove()
        // reset classes and event handlers on checker items
        checkers.off('click')
        checkers.removeClass('checked')
        checkers.addClass('active')
        // add checkboxes and bind login message
        checkers.each(function() {
            make_checkbox($(this))
            $(this).find(".checker_item").on('click', function() {
				$.pnotify({
					title: 'You need to log in with Facebook',
					text: 'so we can keep track of your progress.<br><a href="#" class="login btn">Login now</a><br><small>There&lsquo;s also a login link in the sidebar',
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
                currentUser = user
                build_checkers()
                console.log(currentUser)
                if (!currentUser.existed()) {
                    // grab and save fb user name and email
                    FB.api('/me', function(response) {
                        currentUser.set("name",response.name)
                        currentUser.set("email",response.email)
                        currentUser.set("login_source","fb")
                        currentUser.save(null, {
                            success: function() {
                                // User signed up and logged in through Facebook
								$.pnotify({
									title: 'Hi ' + currentUser.get('name'),
									text: 'You have successfully registered through Facebook.',
									type: 'info',
								})
								send_email_on_new_user_reg()
                            }
                        })
                    });
                    
                } else {
					// User logged in through Facebook
					$.pnotify({
						title: 'Hi ' + currentUser.get('name'),
						text: 'You have successfully signed in through Facebook.',
						type: 'info',
					})
                }
                show_loggedin_msg()
                show_message()
            },
            error: function(user, error) {
				$.pnotify({
					title: 'Whoops',
					text: 'User cancelled the Facebook login or did not fully authorize.',
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
				'username': currentUser.get('name'),
				'email': currentUser.get('email')
		},
		{});
	}


    var checkers = $(".checker")
    var message_area = $(".checker_message")
    var login_link = $("a.login")
    var logout_link = $("a.logout")
    var currentUser = Parse.User.current()
    
    // set a shorter pines notify default delay
    $.pnotify.defaults.delay = 3000;
    
    // TEST
    //$('#destroy').on('click', function() {
        //currentUser.destroy({
            //success: function(obj) {
                //alert("destroyed!")
            //}
        //})
    //})
    
    //// TEST
    //$('#sendmail').on('click', function() {
        //send_email_on_new_user_reg()
	//})
	
	// prettify link buttons
	$('.content a.btn').append('&nbsp;<i class="icon-chevron-right"></i>')
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
			title: 'Bye',
			text: 'You have successfully signed out.',
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
    
    // load the menu partials cached from shc.edu
    $("#main-menu").load(remote_main_menu_url)
    $("#admiss_menu .ajax").load(remote_admiss_menu_url, function() {
		// on load, clean up the menu to work with bootstrap
		$(this).find('*').removeClass("active active-trail")
		$(this).find("ul").addClass("nav nav-list")
		// add submenus
		$(this).find('.expanded').each(function() {
			list = $(this)
			list.addClass("dropdown")
			list.find("a:first").addClass("dropdown-toggle").attr({'href':'#', 'data-toggle':'dropdown'}).append('<b class="caret"></b>')
			list.find("ul").addClass('dropdown-menu')
		})
		// set block title as menu title
		var title = $("#admiss_menu h2")
		$("#admiss_menu ul").first().prepend('<li class="nav-header">' + title.text() + '</li>')
		title.remove()
	})
    $("#footer .service_menu").load(remote_services_menu_url)
    $("#footer .social_menu").load(remote_social_menu_url)
    
    //$('.share').on('click', function(){
		//FB.ui(
			//{
				//method: 'feed',
				//name: "I'm using the Spring Hill College Application Checklist",
				//description: (
					//'A quick and easy way to track your progress in the online admission process ' +
					//'for Spring Hill College.'
				//),
				//link: this_url_tracker,
				//picture: 'http://www.shc.edu/media/common/SHC_crest-100x100.png'
			//},
			//function(response) {
				//if (response && response.post_id) {
					//alert('Post was published.')
				//} else {
					//alert('Post was not published.')
				//}
			//}
		//)
		//return false
	//})

});

