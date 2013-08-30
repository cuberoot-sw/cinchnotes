(function($) {
  var cinchnotes = {
    all_notes : ""
  };

  /*** Model ***/
   Note = Backbone.Model.extend({
    url : function() {
    var base = 'notes'
    if (this.isNew()) return base
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
  });

  User = Backbone.Model.extend({
    url : function() {
    var base = 'user';
    if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
  });

  Session = Backbone.Model.extend({
    url : function(){
    var base = 'session';
    if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
  });

  Contact = Backbone.Model.extend({
    url : function() {
      var base = 'contacts'
      if (this.isNew()) return base
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
     }
  });

  Event = Backbone.Model.extend({
    url : function() {
      var base = 'events'
      if (this.isNew()) return base
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
  });

  Task = Backbone.Model.extend({
    url : function() {
      var base = 'tasks'
      if (this.isNew()) return base
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
  });

  Category = Backbone.Model.extend({
    url : function() {
      var base = 'categories'
      if (this.isNew()) return base
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
  });



  /*** collection ***/
  var Tag_coll = Backbone.Collection.extend({
    model: Note,
    url: '/tags'
  });

  var All_notes = Backbone.Collection.extend({
    model: Note,
    url: '/notes',
    search : function(letters){
            if(letters == "") return this;
            var pattern = new RegExp(letters,"gi");
            return _(this.filter(function(data) {
                    return pattern.test(data.get("note"));
            }));
    }
  });

  var Contact_coll = Backbone.Collection.extend({
    model: Contact,
    url: '/contacts'
  });

  var Event_coll = Backbone.Collection.extend({
    model: Event,
    url: '/events'
  });

  var Task_coll = Backbone.Collection.extend({
    model: Event,
    url: '/tasks'
  });

  var Category_coll = Backbone.Collection.extend({
    model: Category,
    url: '/categories'
  });

  /*** view to show a home page ***/
  ViewHome = Backbone.View.extend({
    initialize:function(){
      _.bindAll(this , 'render');
      var tmpl = _.template($('#home-page-template').html());
      this.template = tmpl();
      this.render();
    },

    render:function(){
      $(this.el).html(this.template);
      $.doTimeout(8000, function() {
        $('#notice_msg').removeClass("notice-msg").empty();
      });
      $('#container').hide();
      $('#note-template').removeClass("span4 div-border");
			$('#content-wraper').removeClass("span4").addClass("span12");
      $('#search-note-template').hide();
      $("#note-template").html(this.el);
      this.delegateEvents();
    }
  });

  /*** view for login ***/
  ViewLogin = Backbone.View.extend({
    events: {
        "submit form#login_form": "save" ,
    },

    initialize:function(){
      console.log("initialize");
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#user-login-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $.doTimeout(6000, function() {
				$('#modal-login-fail').modal('hide');
      });
      $(this.el).html(this.template);
      $("#note-template").removeClass("span5 div-border");
      $("#note-template").html(this.el);
      $('#container').hide();
      $('#newuser_div_heading').html('Sign in')
      $('#search-note-template').hide();
      $("#login_form").validationEngine();
      this.delegateEvents();
    },

     save: function(e) {
        e.preventDefault();
        $("form#login_form #login").attr('data-target','#modal-window');
        $("#login_form").validationEngine('hide');
        var self = this;
        var router = new AppRouter();
        this.model.save({username:this.$('[name=username]').val() , password:this.$('[name=password]').val()} , {
            success: function(model, resp) {
              $('#modal-window').modal({
                keyboard: false
              });
              $('#modal-window .modal-header').prepend('<h3>Successfully Logged In !!!<h3>')
              setTimeout(function(){router.navigate("#notes" , true);window.location.reload();}, 5000);
            },
            error: function() {
							$('#modal-login-fail').modal({
								 backdrop: false
							});
              $('#username').focus();
            }
        });
    }
  });

  /*** View for listing of tags ***/
  var ViewIndex = Backbone.View.extend({
    events: {
       "click a.show": "show_list"
    },
    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove ,this);
      var tmpl = _.template($('#tag-list-template').html());
      this.template = tmpl({tags : this.collection});
      this.render();
    },

    render:function(){
      $.doTimeout(6000, function() {
				$('#modal-notice').modal('hide');
      });

      $(this.el).html(this.template);
      $(".data_contents").removeClass('span7').hide();
      $(".data_wrapper").hide();
      $('#note-template').addClass("");
      $('#search-note-template').show();
      $("#note-template").html(this.el);
      this.delegateEvents();
    },

    show_list: function(e){
      var tag_name = $(e.target).attr('id');
      $('ul#taglist li a').removeClass("select_tag");
      $('li a#'+ tag_name).addClass("select_tag");
      var url = "/notes?tag=" + tag_name;
      var Note_coll = Backbone.Collection.extend({ url: url });
      notes = new Note_coll();
			$('#modal-notice').modal({
				backdrop: false
			})
      notes.fetch({
        success: function() {
          // fetch notes
          new ViewNotesIndex( {collection: notes.models[0].attributes.notes });
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    }

  });

  /** View for Search box */
  var ViewSearchBox = Backbone.View.extend({
    events: {
      "keyup input#search_note" : "searchnotes"
    },

    initialize:function(){
      _.bindAll(this , 'render');
      var tmpl = _.template($('#search-box-template').html());
      this.template = tmpl();
      this.render();
    },

    render:function(){
      $.doTimeout(2000, function() {
				$('#modal-notice').modal('hide');
      });
      $(this.el).html(this.template);
      $("#search-note-template").html(this.el);
      this.delegateEvents();
    },

     searchnotes:function(){
        var note = $.trim( $("input#search_note").val() );
        var filtered = _.filter(cinchnotes.all_notes, function(item){
                    var pattern = new RegExp(note,"gi");
                    return pattern.test(item.note)
                    });
        new ViewNotesIndex( { collection:  filtered });
    }
  });

  /* View for listing of all notes */
  var ViewNotesIndex = Backbone.View.extend({

    initialize:function(){
      _.bindAll(this , 'render');
      var tmpl = _.template($('#note-list-template').html());
      this.template = tmpl({notes : this.collection});
      this.render();
    },

    render:function(){
      $('#content-wraper').show();
      $('.container-padding').show()
      $(".data_contents").removeClass('span7').hide();
      $(".data_wrapper").hide()
      $.doTimeout(6000, function() {
				$('#modal-notice').modal('hide');
      });
      $("#add-notes").validationEngine('hide');
      $(this.el).html(this.template);
      $('#container').show();
      $("#container").html(this.el);
      this.delegateEvents();
    }

  });


  /*view to show a note*/
  ViewShow = Backbone.View.extend({
    events: {
      "click img.delete-note": "clear" ,
      "click a.show_notes": "show_notes" ,
			"click a.maximize_note": "maximize_notes",
			"click a.minimize_note": "minimize_notes",
    },

    initialize:function(){
      console.log("initialize");
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#show-note-template').html());
      this.template = tmpl({model : this.model, tags: this.collection});
      this.render();
    },

    render:function(){
      $.doTimeout(2000, function() {
				$('#modal-notice').modal('hide');
			});
      $('ul#taglist li a').removeClass("select_tag");
      $(this.el).html(this.template);
      $('#container').html(this.el);
			$(".minimize_note").hide();
      this.delegateEvents();
    } ,

    clear: function(e){
      var note_id = $(e.target).attr('id');
      var answer = confirm("Are you sure you want to delete this note?");
      var router = new AppRouter();
      if (answer) {
        $.ajax({
          url: "/notes/"+note_id,
          type: "DELETE",
          beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
          success: function(responce){
				    router.navigate("#notes" , true);
            $('#modal-delete-note').modal({
				      backdrop: false
				    });
				    $.doTimeout(2000, function() {
				      $('#modal-delete-note').modal('hide');
				    });
          }
       });
     }
    } ,

    show_notes: function(e){
      var tag_name = $(e.target).attr('id');
      var url = "/notes?tag=" + tag_name;
      var Note_coll = Backbone.Collection.extend({ url: url });
      notes = new Note_coll();
			$('#modal-notice').modal({
				backdrop: false
			});
      notes.fetch({
        success: function() {
          // fetch notes
          new ViewNotesIndex( {collection: notes.models[0].attributes.notes });
					$("ul#taglist").find('li a#'+tag_name).addClass("select_tag");
					$('#content-wraper').show();
					$('#search_note').show();
					$(".minimize_note").hide();
					$(".maximize_note").show();
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

   maximize_notes: function(e){
			e.preventDefault();
			$('#content-wraper').hide('slow');
			$('#search_note').hide('slow');
			$(".maximize_note").hide();
			$(".minimize_note").show('slow');
			$("#note_div_id").animate({
			    width: "155%",
			    borderWidth: "10px"
			  }, 1500 );
			
    },

		minimize_notes: function(e){
			e.preventDefault();
			setTimeout(function() {
				$('#content-wraper').show('slow');
				$('#search_note').show('slow');
				$(".minimize_note").hide();
				$(".maximize_note").show('slow');
			}, 1500);
			
			$("#note_div_id").animate({
			    width: "100%",
					borderWidth: "10px"
			    }, 1500 );

		}
  });

  /* view for edit / new */
  ViewEdit = Backbone.View.extend({
    events: {
        "click a.back_to_notes_link": "back" ,
        "keypress textarea#note": "start_timer"
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#add-note-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    start_timer: function(){
      $(document).stopTime();
      var self = this;
      $(document).oneTime(3000 , function(){
        var note = $.trim( $("textarea#note").val() );
        var notelen = note.length;
        if(notelen == 0){
        }else{
          self.save();
        }
      });
    },

    render:function(){
      $.doTimeout(2000, function() {
				$('#modal-notice').modal('hide');
      });
      $('ul#taglist li a').removeClass("select_tag");
      $(this.el).html(this.template);
      $("#container").html(this.el);

      if(this.model.isNew()){
          $('textarea#note').focus();
      }
      var self = this;
      $("#add-notes").validationEngine({promptPosition : "centerRight" });
        $('#tags').tagit({
        tagSource: "/tags/match",select: true ,
        initialTags: this.model.get('mytags') ,
        tagsChanged: function(a,b){
          $('#demoOut').html(a + ' was ' + b);
          var note = $.trim( $("textarea#note").val() );
          var notelen = note.length;
          if(notelen == 0){
            console.log("wait");
          }else{
            self.save();
          }
        }
      });
      this.delegateEvents();
    },

    back:function(){
      var self = this;
			$("#add-notes").validationEngine('hide');
      var note = $.trim( $("textarea#note").val() );
      var notelen = note.length;
      if(notelen != 0){
        self.save();
      }
    },

    save: function() {
      var self = this;
      var msg = "saving..." ;
			$('#modal-status').modal({
			  backdrop: false
			}).html(msg);
      var note = this.$('[name=note]').val();
      var notelen = note.length;
      var taglists = [];
      $("ul#tags li.tagit-choice").each(function() {
        if($(this).text() != ''){
          tag = ($(this).text()).slice(0,($(this).text()).length-1);
          taglists.push(tag);
        }
      });
     var tagCSV = taglists.join();
     var params = $('form#add-notes').serialize()+"&tag_list="+tagCSV
     if( this.model.isNew() ){
       $.ajax({
        url: "/notes/",
        type: "POST",
        beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
        data: params,
        success: function(responce){
          self.model = new Note({ id : responce.id});
          msg = "saved!"
					$('#modal-status').modal({
					  backdrop: false
					}).html(msg);
          $("a#back_link").removeClass("back_to_notes_link");
          $.doTimeout(2000, function() {
		 			$('#modal-status').modal('hide');					 
          });
        }
       });

     }else{
       $.ajax({
        url: "/notes/" + this.model.get('id'),
        type: "PUT",
        beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
        data: params,
        success: function(responce){
          msg = "saved!";
					$('#modal-status').modal({
					  backdrop: false
					}).html(msg);
					$("a#back_link").removeClass("back_to_notes_link");
          $.doTimeout(2000, function() {
		 			$('#modal-status').modal('hide');
				 });
        }
       });
     }
    }
  });


  /* view for  new user */
  ViewNewUser = Backbone.View.extend({

    events: {
        "submit form#login_form": "save" ,
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#user-login-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $(this.el).html(this.template);
      $('#container').hide();
      $('#note-template').removeClass("span5 div-border");
      $("#note-template").html(this.el);
      $("#login_form").validationEngine()
      $('button#login').hide();
      $('#newuser_div_heading').html('Sign Up')
      $('.newuser_div').show();
      $('a#new-user-link').hide();
      this.delegateEvents();
    },

    save: function(e) {
        e.preventDefault();
        var self = this;
        var router = new AppRouter();
        var msg = this.model.isNew() ? 'Successfully created!' : "Saved!";
        this.model.save({username:this.$('[name=username]').val() , password:this.$('[name=password]').val(), email:this.$('[name=email]').val()} , {
            success: function(model, resp) {
              if (resp.valid_status){
                var msg = "sorry..This username is already exist.Please enter valid username"
                $('#error_msg_div').html(msg);
                $('#username').focus();
                return false;
              }else{
                $('#modal-window').modal({
                  keyboard: false
                });
                $('#modal-window .modal-header').prepend('<h3>Your account is successfully created !!!<h3>')
                setTimeout(function(){router.navigate("#notes" , true);window.location.reload();}, 5000);
              }

            },
            error: function() {
                new Error();
            }
        });
    }
  });

  /* View for display contacts list */
  ViewContacts = Backbone.View.extend({
    initialize:function(){
      var tmpl = _.template($('#contact-list-template').html());
      this.template = tmpl({contacts : this.collection});
      render_list_view(this);
    }
  });

  /* View for new/edit Contact*/
  ViewEditContact = Backbone.View.extend({
    events: {
        "submit form#add_contact": "save" ,
    },

    initialize:function(){
       _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#new-contact-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },
    render:function(){
      render_form_view(this)
      $("form#add_contact").validationEngine();
    },

    save: function(e){
      e.preventDefault();
      var router = new AppRouter();
      if(this.model.isNew()){
        $.ajax({
          url: "/contacts/",
          type: "POST",
          beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
          data: $('form#add_contact').serialize(),
          success: function(responce){
            router.navigate("#contacts" , true)
            $('#modal-window').modal({});
            $('#modal-window .modal-header').html('<h3>Saving Contact. Please Wait!!!<h3>');
            $.doTimeout(2000, function() {
				      $('#modal-window').modal('hide');
				    });
          }
       });
     }else{
      $.ajax({
        url: "/contacts/" + this.model.get('id'),
        type: "PUT",
        beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
        data: $('form#add_contact').serialize(),
        success: function(responce){
          router.navigate("#contacts" , true)
          $('#modal-window').modal({});
          $('#modal-window .modal-header').html('<h3>Saving Contact. Please Wait!!!<h3>');
          $.doTimeout(2000, function() {
				    $('#modal-window').modal('hide');
				  });
        }
       });
      }
    }
  });

  /* View for show contact */
  ViewContact = Backbone.View.extend({
    events: {
      "click img.delete-contact": "delete_contact"
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#show-contact-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $.doTimeout(2000, function() {
				$('#modal-notice').modal('hide');
			});
      $('ul#taglist li a').removeClass("select_tag");
      $(this.el).html(this.template);
      $(".data_contents").show().addClass('span7');
      $(".data_wrapper").show().html(this.el)
      this.delegateEvents();
    },

    delete_contact: function(e){
      var id = $(e.target).attr('id');
      var answer = confirm("Are you sure you want to delete this Contact?");
      var router = new AppRouter();
      if (answer) {
        $.ajax({
          url: "/contacts/"+id,
          type: "DELETE",
          beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
          success: function(responce){
            router.navigate("#contacts" , true);
            $('#modal-delete-note').modal({
				      backdrop: false
				    });
				    $.doTimeout(2000, function() {
				      $('#modal-delete-note').modal('hide');
				    });

          }
       });
		  }
    }
  });

  /* View Events list*/
  ViewEvents = Backbone.View.extend({
    initialize:function(){
      var tmpl = _.template($('#events-list-template').html());
      this.template = tmpl({events_collection : this.collection});
      render_list_view(this);
    }
  });

  /* View for new/edit event*/
  ViewEditEvent = Backbone.View.extend({
    events: {
      "submit form#event_form": "save" ,
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#event-form-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },
    render:function(){
      render_form_view(this)
      $('#start_date').datetimepicker({ dateFormat: "yy-mm-dd" });
      $('#end_date').datetimepicker({ dateFormat: "yy-mm-dd" });
      $("form#event_form").validationEngine();
    },

    save: function(e){
      e.preventDefault();
      var params = $('form#event_form').serialize();
      var routes_to = "#events";
      var loading_msg = "Saving Event. Please wait!!!";
      if(this.model.isNew()){
        var url = "events";
        send_post_request(url, params, "POST", routes_to, loading_msg);
      }else{
        var url =  "/events/" + this.model.get('id');
        send_post_request(url, params, "PUT", routes_to, loading_msg);
      }
    }
  });

  /* View for show event */
  ViewEvent = Backbone.View.extend({
    events: {
      "click img.delete-event": "delete_event"
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#show-event-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $.doTimeout(2000, function() {
				$('#modal-notice').modal('hide');
			});
      render_form_view(this);
    },

    delete_event: function(e){
      var id = $(e.target).attr('id');
      var answer = confirm("Are you sure you want to delete this Event?");
      var router = new AppRouter();
      if (answer) {
        var url = "/events/"+id;
        var params = "id="+id;
        var routes_to = "#events";
        var success_msg = "Deleted Event Successfully !!!";
        send_post_request(url, params, "DELETE", routes_to, success_msg);
      }
    }
  });

  /* View Tasks list*/
  ViewTasks = Backbone.View.extend({
    initialize:function(){
      var tmpl = _.template($('#tasks-list-template').html());
      this.template = tmpl({tasks_collection : this.collection});
      render_list_view(this);
    }
  });


  /* View for new/edit task*/
  ViewEditTask = Backbone.View.extend({
    events: {
      "submit form#task_form": "save" ,
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#task-form-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },
    render:function(){
      render_form_view(this)
      $('#due_date').datepicker({ dateFormat: "yy-mm-dd" });
      $("form#task_form").validationEngine();
    },

    save: function(e){
      e.preventDefault();
      var params = $('form#task_form').serialize();
      var routes_to = "#tasks";
      var loading_msg = "Saving Task. Please wait!!!";
      if(this.model.isNew()){
        var url = "tasks";
        send_post_request(url, params, "POST", routes_to, loading_msg);
      }else{
        var url =  "/tasks/" + this.model.get('id');
        send_post_request(url, params, "PUT", routes_to, loading_msg);
      }
    }
  });


   /* View for show task */
  ViewTask = Backbone.View.extend({

    events: {
      "click img.delete-task": "delete_task",
      "click img.complete-task": "complete_task"
    },

    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#show-task-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $.doTimeout(2000, function() {
				$('#modal-notice').modal('hide');
			});
      render_form_view(this);
    },

    delete_task: function(e){
      var id = $(e.target).attr('id');
      var answer = confirm("Are you sure you want to delete this Task?");
      var router = new AppRouter();
      if (answer) {
        var url = "/tasks/"+id;
        var params = "id="+id;
        var routes_to = "#tasks";
        var success_msg = "Deleted Task Successfully !!!";
        send_post_request(url, params, "DELETE", routes_to, success_msg);
      }
    },

    complete_task: function(e){
      var id= $(e.target).attr('id');
      var params = "id="+id;
      var router = new AppRouter();
      var url = "/tasks/"+id+"/change_status";
      var routes_to = "#tasks";
      var success_msg = "Status changed successfully!!!";
      send_post_request(url, params, "GET", routes_to, success_msg);
    }

  });

  /* View Category list*/
  ViewCategories = Backbone.View.extend({
    initialize:function(){
      var tmpl = _.template($('#category-list-template').html());
      this.template = tmpl({categories_collection : this.collection});
      render_list_view(this);
    }
  });


  /* Send post request to create new model*/
  send_post_request = function(url, params, method, routes_to, msg){
    var router = new AppRouter();
    $.ajax({
      url: url,
      type: method,
      beforeSend: function(xhr) {xhr.setRequestHeader("X-CSRF-Token", $("meta[name=\"csrf-token\"]").attr("content"))},
      data: params,
      success: function(responce){
                router.navigate(routes_to , true)
                $('#modal-window').modal({});
                $('#modal-window .modal-header').html('<h3>'+msg+'<h3>');
                $.doTimeout(2000, function() {
				          $('#modal-window').modal('hide');
				        });
      }
    });
  }

  /* render function for list view */
  render_list_view = function(element){
    $('#content-wraper').hide();
    $('.container-padding').hide();
    $(".data_wrapper").hide()
    $(element.el).html(element.template);
    $(".data_contents").removeClass('span7').show().html(element.el);
    element.delegateEvents();
  }

  /* render function for form view */
  render_form_view = function(element){
    $('#content-wraper').hide();
    $('.container-padding').hide()
    $(element.el).html(element.template);
    $(".data_contents").show().addClass('span7');
    $(".data_wrapper").show().html(element.el);
    element.delegateEvents();
  }

  /* view for show notice */
  Notice = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this, 'render');
      this.message = this.options.message || this.defaultMessage;
      this.render();
    },

    render: function() {
      var view = this;
      $(this.el).html(this.message);
      $(this.el).hide();
      $(this.el).slideDown();
      $.doTimeout(this.displayLength, function() {
        $(view.el).slideUp();
        $.doTimeout(4000, function() {
          view.remove();
        });
      });

      return this;
    }
  });

 /* View for show error */
  Error = Notice.extend({
    className: "error",
    defaultMessage: 'Uh oh! Something went wrong. Please try again.'
  });


  /* routers for the application*/
  var AppRouter = Backbone.Router.extend({
    routes: {
          '' : 'home' ,
          'notes' : 'index',
          'login' : "login",
          'new' : "newNote" ,
          'logout' : "logout",
          'notes/:id' : "show" ,
          'notes/:id/edit' : "edit",
          'newUser' : "newUser",
          'contacts' : "contacts_index",
          'contacts/new' : "new_contact",
          'contacts/:id' : "show_contact",
          'contacts/:id/edit' : "edit_contact",
          'events' : "events_index",
          'events/new' : "new_event",
          'events/:id' : "show_event",
          'events/:id/edit' : "edit_event",
          'tasks' : "tasks_index",
          'tasks/new' : "new_task",
          'tasks/:id' : "show_task",
          'tasks/:id/edit' : "edit_task",
          'categories' : "category_index"
    },

    home: function(){
      new ViewHome({ model: new Session()});
    },

    login: function(){
          new ViewLogin ({  model:new Session()});
    },

    logout: function(){
      var session = new Session();
      session.fetch({
        success: function(model ) {
					$('#modal-logout').modal({
                  backdrop: false
            });
          var router = new AppRouter();
	        $.doTimeout(2000, function() {
	          router.navigate("#" , true);
	          window.location.reload();
	        });
          

        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    newUser: function() {
      new ViewNewUser({ model: new User() });
    } ,

    index:function(){
      var result = new All_notes();
			$('#modal-notice').modal({
				backdrop: false
			});
			$('#note_div_id').removeClass("note_div_wrapper");
			$('#note_div_id').addClass("note_div");
			$('#content-wraper').show();
			$('#search_note').show();
      result.fetch({
        success: function() {
          //collect all_notes for searching option
          cinchnotes.all_notes = result.models[0].attributes.notes;
          new ViewSearchBox();
          //call view to show note_list
          new ViewNotesIndex({ collection: result.models[0].attributes.notes });
          //call view to show taglist
          new ViewIndex({ collection: result.models[0].attributes.tags , model:new Note()});

        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      })
    },

    newNote: function() {
			$('#modal-notice').modal({
				backdrop: false
			});
      new ViewEdit({ model: new Note() });
    } ,

    edit: function(id) {
      var note = new Note({id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
			$('#content-wraper').show();
			$('#search_note').show();
			$('#note_div_id').addClass("note_div");
			$('#note_div_id').removeClass("note_div_wrapper");
      note.fetch({
        success: function(model ) {
          new ViewEdit({ model:note});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    } ,

    show: function(id){
      var note = new Note({ id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      note.fetch({
        success: function(model) {
          new ViewShow({ model: note, collection: note.get('mytags')});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    contacts_index: function(){
      var contacts = new Contact_coll();
      contacts.fetch({
       success: function() {
          new ViewContacts({ collection: contacts.models[0].attributes.contacts })
        }
        });
    },

    new_contact: function(){
      new ViewEditContact({ model: new Contact() });
    },

    show_contact: function(id){
      var contact = new Contact({ id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      contact.fetch({
        success: function(model) {
          new ViewContact({ model: contact});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    edit_contact: function(id){
      var contact = new Contact({id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      contact.fetch({
        success: function(model ) {
          new ViewEditContact({ model:contact});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    events_index: function(){
      var events = new Event_coll();
      events.fetch({
       success: function() {
          new ViewEvents({ collection: events.models[0].attributes.events })
        }
        });
    },

    new_event: function(){
      new ViewEditEvent({ model: new Event() });
    },

    show_event : function(id){
      var get_event = new Event({ id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      get_event.fetch({
        success: function(model) {
          new ViewEvent({ model: get_event});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    edit_event : function(id){
      var get_event = new Event({id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      get_event.fetch({
        success: function(model ) {
          new ViewEditEvent({ model:get_event});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    tasks_index: function(){
      var tasks = new Task_coll();
      tasks.fetch({
       success: function() {
          new ViewTasks({ collection: tasks.models[0].attributes.tasks })
        }
        });
    },

     new_task: function(){
      new ViewEditTask({ model: new Task() });
    },

    show_task : function(id){
      var task = new Task({ id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      task.fetch({
        success: function(model) {
          new ViewTask({ model: task});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    edit_task : function(id){
      var task = new Task({id : id});
			$('#modal-notice').modal({
				backdrop: false
			});
      task.fetch({
        success: function(model ) {
          new ViewEditTask({ model:task});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    },

    category_index: function(){
      var categories = new Category_coll();
      categories.fetch({
       success: function() {
          new ViewCategories({ collection: categories.models[0].attributes.categories })
        }
        });
    },


  });

  var app_router = new AppRouter;
  Backbone.history.start();
})(jQuery);
