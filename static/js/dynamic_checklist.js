/*

Build and persist faux checkboxes 
    
*/

// Facebook developer: https://developers.facebook.com/apps

var page_partial_cache_url = "/assets/page-partials/"

var remote_main_menu_url = page_partial_cache_url + "remote_menu.main.inner.html"
var remote_admiss_menu_url = page_partial_cache_url + "remote_menu.secondary.admiss.how_to_apply.html"
var remote_services_menu_url = page_partial_cache_url + "remote_menu.services.html"
var remote_social_menu_url = page_partial_cache_url + "remote_menu.social.html"

$(document).ready(function () {

    /* TODO
     * Build user class to have available throughout code
     *
     * Grab email from Facebook
     *
     * Send email from cloudcode to new registrants
     *
     * Provide opt-out method!
     * */

    var do_checker = function() {
        return window.JSON && window.JSON.parse;
    }

    var make_checkbox = function(context) {
        context.prepend('<span class="checker_item"></span>') //add the "checkbox"
        context.find(".checker_item").css("height", context.css("height"));
    }

    var show_message = function() {
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
        $(".anon").show();
        $(".loggedin").hide();
    }
    
    var show_loggedin_msg = function() {
        $(".anon").hide();
        $(".loggedin").show();
    }
    
    var build_checkers = function() {
        var chklist = null
        var checked = []
        var dummy_id = "XRF1";
        
        var ApplicationChecklist = Parse.Object.extend("ApplicationChecklist")
        
        // ensure we start with a clean slate
        $(".checker_item").remove()
        checkers.removeClass("checked").addClass("active")

        // configure all of the active checker items
        checkers.each(function() {
            var checker = $(this)
            make_checkbox(checker)
            var checker_item = checker.find(".checker_item")
            // add active class as a styling hook
            checker_item.click(function() {
                // add or remove the id of this item from storage
                checker_item.addClass("checker_working")
                if (checker.hasClass("checked")) {
                    chklist.remove("checked", checker.attr("id"))
                    //console.log(checker + " checked")
                }
                else {
                    chklist.addUnique("checked", checker.attr("id"))
                    //console.log(checker + " not checked")
                }
                chklist.save({
                    success: function(object) {
                        checker.toggleClass("checked");
                        show_message()
                        checker_item.removeClass("checker_working")
                    },
                    error: function(model, error) {
                        alert("Something went wrong and your choice was not saved. Please try again.")
                    }
                });
            })
        })

        // Grab initial data if available
        var query = new Parse.Query("ApplicationChecklist")
        query.equalTo("user", currentUser)
        
        $(".checker_message .status").addClass("checker_working")
        
        query.first({
            success: function(results) {
                if (!results) {
                    // no data for this user, create some
                    //console.log("data not found")
                    chklist = new ApplicationChecklist()
                    chklist.set("user", currentUser)
                    // only allow access for the current user
                    chklist.setACL(new Parse.ACL(Parse.User.current()));
                }
                else {
                    var checked = results.get("checked")
                    //console.log("data: " + checked)
                    $.each(checked, function(i, val) {
                        $("#" + val + " .checker_item").closest(".checker").addClass("checked")
                    })
                    chklist = results
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
    
    var build_dummy_checkers = function(reset) {
        if (!reset) reset = false
        if (reset) {
            // remove existing items and re-add them
            $(".checker_item").remove()
            checkers.each(function() {
                make_checkbox($(this))
            })
        }
        checkers.removeClass("active").addClass("checked").find(".checker_item").unbind("click")
    }

    var checkers = $(".checker")
    var message_area = $(".checker_message")
    var login_link = $(".fb a.login")
    var logout_link = $(".fb a.logout")
    var currentUser = Parse.User.current()
    
    // TEST
    $('#destroy').click(function() {
        currentUser.destroy({
            success: function(obj) {
                alert("destroyed!")
            }
        })
    })
    
    // TEST
    $('#sendmail').click(function() {
        Parse.Cloud.run('sendmail', {'username': currentUser.get('username')}, {
            success: function(result) {
              // succeed and/or fail silently
              //alert("yep: " + result)
            }, // end success
            error: function(error) {
                //alert("nope: " + error)
            } // end error
        });
    })
    
    login_link.click(function() {
        Parse.FacebookUtils.logIn("email", {
            success: function(user) {
                currentUser = user
                build_checkers()
                //console.log(currentUser)
                if (!currentUser.existed()) {
                    // grab and save fb user name and email
                    FB.api('/me', function(response) {
                        currentUser.set("name",response.name)
                        currentUser.set("email",response.email)
                        currentUser.set("login_source","fb")
                        currentUser.save(null, {
                            success: function() {
                                // TEST
                                //alert('You logged in through ' + currentUser.get('login_source') + '. Your FB info is ' + currentUser.get('name') + ": " + currentUser.get('email'));
                            }
                        })
                    });
                    // User signed up and logged in through Facebook
                    //alert("User signed up and logged in through Facebook!");
                } else {
					// User logged in through Facebook
                  //alert("User logged in through Facebook!");
                }
                show_loggedin_msg()
                show_message()
            },
            error: function(user, error) {
              alert("User cancelled the Facebook login or did not fully authorize.");
            }
        });
        return false;
    })
    
    logout_link.click(function() {
        Parse.User.logOut()
        show_anon_msg()
        build_dummy_checkers(false)
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
        build_dummy_checkers(true)
        show_anon_msg()
        show_message()
    }
    
    // in older browsers, just create completed checkboxes
    else {
        build_dummy_checkers(true)
    } // end else
    
    
    $("#main-menu").load(remote_main_menu_url)
    $("#admiss_menu").load(remote_admiss_menu_url, function() {
		$(this).find("ul").addClass("nav nav-tabs nav-stacked")
		$(this).find('*').removeClass("active active-trail")
		$(this).find('.expanded').each(function() {
			list = $(this)
			list.addClass("dropdown")
			list.find("a:first").addClass("dropdown-toggle").attr({'href':'#', 'data-toggle':'dropdown'}).append('<b class="caret"></b>')
			list.find("ul").addClass('dropdown-menu')
		})
		//$('.dropdown-toggle').dropdown()
	})
    $("#footer .service_menu").load(remote_services_menu_url)
    $("#footer .social_menu").load(remote_social_menu_url)
    
});

