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
      $('#note-template').removeClass("span5 div-border");
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
        $('#notice_msg').removeClass("notice-msg").empty();
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
              $('#notice_msg').html("Login Failed, check 'username/password' and retry.!").addClass("notice-msg");
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
      this.template = tmpl({collection : this.collection});
      this.render();
    },

    render:function(){
      $.doTimeout(6000, function() {
        $('#notice_msg').removeClass("notice-msg").empty();
      });

      $(this.el).html(this.template);
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
      $('#notice_msg').html("Loading ..please wait!").addClass("notice-msg");
      notes.fetch({
        success: function() {
          new ViewNotesIndex( {collection: notes });
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
        $('#notice_msg').removeClass("notice-msg").empty();
      });
      $(this.el).html(this.template);
      $("#search-note-template").html(this.el);
      this.delegateEvents();
    },

     searchnotes:function(){
        var note = $.trim( $("input#search_note").val() );
        var filtered = cinchnotes.all_notes.search(note);
        new ViewNotesIndex( { collection:  filtered });
    }
  });

  /* View for listing of all notes */
  var ViewNotesIndex = Backbone.View.extend({

    initialize:function(){
      _.bindAll(this , 'render');
      var tmpl = _.template($('#note-list-template').html());
      this.template = tmpl({collection : this.collection});
      this.render();
    },

    render:function(){
      $.doTimeout(6000, function() {
        $('#notice_msg').removeClass("notice-msg").empty();
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
      "click img.delete-note": "clear"
    },

    initialize:function(){
      console.log("initialize");
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#show-note-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $.doTimeout(2000, function() {
        $('#notice_msg').removeClass("notice-msg").empty();
      });
      $('ul#taglist li a').removeClass("select_tag");
      $(this.el).html(this.template);
      $('#container').html(this.el);
      this.delegateEvents();
    } ,

    clear: function(e){
      var note_id = $(e.target).attr('id');
      var answer = confirm("Are you sure you want to delete this note?");
      var note = new Note({id : note_id});
      if (answer) {
        note.destroy();
        var router = new AppRouter();
        router.navigate("#notes" , true);
        $('#notice_msg').html("Deleted Note Successfully !!!").addClass("notice-msg");
      }
    }
  });

  /* view for edit / new */
  ViewEdit = Backbone.View.extend({
    events: {
        "click a#back_link": "back" ,
        "keypress": "start_timer"
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
        $('#notice_msg').removeClass("notice-msg").empty();
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
        tagSource: "/notes/tags/", select: true ,
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
      $("#add-notes").validationEngine('hide');
     },


    save: function() {
      var self = this;
      var msg = "saving..." ;
      $('#statusmsg').html(msg);
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
        $.post('/notes/' , params , function(data){
          self.model = new Note({ id : data.id});
          msg = "saved!"
          $('#statusmsg').html(msg);
          $.doTimeout(2000, function() {
           $('#statusmsg').empty();
          });
        });
     }else{
       var url = "/notes/" + this.model.get('id');
       var params = params + "&_method=PUT";
       $.post( url , params ,function(data){
          msg = "saved!";
          $('#statusmsg').html(msg);
          $.doTimeout(2000, function() {
           $('#statusmsg').empty();
         });

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
      $('#notice_msg').html(this.el).addClass("notice-msg");
      $(this.el).slideDown();
      $.doTimeout(this.displayLength, function() {
        $(view.el).slideUp();
        $.doTimeout(4000, function() {
          $('#notice_msg').removeClass("notice-msg");
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
          'newUser' : "newUser"
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
          $('#notice_msg').html("Log Out Successfully !!!").addClass("notice-msg");
          var router = new AppRouter();
          router.navigate("#" , true);
          window.location.reload();

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
      var tags = new Tag_coll();
      var notes = new All_notes();
      $('#notice_msg').html("Loading ..please wait!").addClass("notice-msg");

      tags.fetch({
        success: function() {
          new ViewIndex({ collection: tags , model:new Note()});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
      $('#notice_msg').html("Loading ..please wait!").addClass("notice-msg");
      notes.fetch({
        success: function() {
          //collect all_notes for searching option
          cinchnotes.all_notes = notes;
          new ViewSearchBox();
          //call view to shiw note_list
          new ViewNotesIndex({ collection: notes });
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      })
    },

    newNote: function() {
      $('#notice_msg').html("Loading ..please wait!").addClass("notice-msg");
      new ViewEdit({ model: new Note() });
    } ,

    edit: function(id) {
      var note = new Note({id : id});
      $('#notice_msg').html("Loading ..please wait!").addClass("notice-msg");
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
      $('#notice_msg').html("Loading ..please wait!").addClass("notice-msg");
      note.fetch({
        success: function(model) {
          new ViewShow({ model: note});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });
    }
  });

  var app_router = new AppRouter;
  Backbone.history.start();
})(jQuery);
