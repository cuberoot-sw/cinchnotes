(function($) {
  /* Model*/
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

  Tag =  Backbone.Model.extend({ });

  /* collection*/
  var Tag_coll = Backbone.Collection.extend({
    model: Note,
    url: '/tags'
  });

  var All_notes = Backbone.Collection.extend({
    model: Note,
    url: '/notes'
  });

  /*view to show a home*/
  ViewHome = Backbone.View.extend({
    initialize:function(){
      _.bindAll(this , 'render');
      var tmpl = _.template($('#home-page-template').html());
      this.template = tmpl();
      this.render();
    },

    render:function(){
      $(this.el).html(this.template);
      $('#container').hide();
      $("#note-template").html(this.el);
      this.delegateEvents();
    }
  });

  /**** view for login */
  ViewLogin = Backbone.View.extend({
    events: {
        "submit form#login_form": "save"
    },

    initialize:function(){
      console.log("initialize")
      _.bindAll(this , 'render')
      this.model.bind('change', this.render)

      var tmpl = _.template($('#user-login-template').html())
      this.template = tmpl({model : this.model})
      this.render()
    },

    render:function(){
      $(this.el).html(this.template)
      $("#note-template").removeClass("span5")
      $("#note-template").html(this.el)
      $('#container').hide()
      $("#login_form").validationEngine()
      this.delegateEvents()
    },

    save: function() {
        var self = this;
        var router = new AppRouter();
        this.model.save({username:this.$('[name=username]').val() , password:this.$('[name=password]').val()} , {
            success: function(model, resp) {
              var msg = "SuccessFully Logged In!";
              new Notice({ message: "SuccessFully Logged In!" });
              router.navigate("#notes" , true);
              window.location.reload();
            },
            error: function() {
              var msg = "Login Failed, check 'username/password' and retry.!"
              new Notice({ message: "Login Failed, check 'username/password' and retry.!"})
            }
        });
    }
  });

  /* View for listing of tags*/
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
      $(this.el).html(this.template);
      $("#note-template").html(this.el);
      $(document).stopTime();

      this.delegateEvents();
    },

    show_list: function(e){
      var tag_name = $(e.target).attr('id');
      $('ul#taglist li a').removeClass("select_tag");

      $('li a#'+ tag_name).addClass("select_tag");
      var url = "/tags/" + tag_name;
      var Note_coll = Backbone.Collection.extend({ url: url });
      notes = new Note_coll();
      notes.fetch({
        success: function(model ) {
          new ViewShowNotes({collection: notes , model: new Tag()});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });

    }

  });

  /* View for listing of all notes*/
  var ViewNotesIndex = Backbone.View.extend({

    initialize:function(){
      _.bindAll(this , 'render');
      var tmpl = _.template($('#note-list-template').html());
      this.template = tmpl({collection : this.collection});
      this.render();
    },

    render:function(){
      $('ul#taglist li a').removeClass("select_tag");
      $(this.el).html(this.template);
      $('#container').show();
      $("#container").html(this.el);
      $(document).stopTime();
      this.delegateEvents();
    }
  });

  /*view to show all notes of tag*/
  ViewShowNotes = Backbone.View.extend({
    events: {
      "click span.delete": "clear"
    },

    initialize:function(){
      console.log("initialize");
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#note-list-template').html());
      this.template = tmpl({collection : this.collection});
      this.render();
    },

    render:function(){
      $(this.el).html(this.template);
      $('#container').show();
      $("#container").html(this.el);
      $(document).stopTime();
      this.delegateEvents();
    } ,

    clear: function(e){
      var note_id = $(e.target).attr('id')
      var answer = confirm("Are you sure you want to delete this note?");
      var note = new Note({id : note_id});
      if (answer) {
        note.destroy();
        $('#row'+note_id).remove();
        new Notice({ message: "SuccessFully Deleted!" });
      }
    }
  });

  /*view to show a note*/
  ViewShow = Backbone.View.extend({
    events: {
      "click a.delete": "clear"
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
      $('ul#taglist li a').removeClass("select_tag");
      $(this.el).html(this.template);
      $('#container').html(this.el);
      $(document).stopTime();
      this.delegateEvents();
    } ,

    clear: function(e){
      var note_id = $(e.target).attr('id')
      var answer = confirm("Are you sure you want to delete this note?");
      var note = new Note({id : note_id});
      if (answer) {
        note.destroy();
        new Notice({ message: "SuccessFully Deleted!" });
      }
    }
  });

  /* view for edit / new*/
  ViewEdit = Backbone.View.extend({
    events: {
        "click a#back_link": "back" ,
        "keypress": "start_timer"
    },

    initialize:function(){
      console.log("initialize");
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      var tmpl = _.template($('#add-note-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },


    back:function(){
       $('.formErrorContent').validationEngine('hide');
      $(document).stopTime();
    },

    start_timer: function(){
      $(document).stopTime();
      var self = this;
      $(document).oneTime(5000 , function(){
        var note = $.trim( $("textarea#note").val() );
        var notelen = note.length;
        if(notelen == 0){
          console.log("wait");
        }else{
          self.save();
        }
      });
    },

    render:function(){
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
     var params = "note=" + note + "&tag=" + tagCSV;
     if( this.model.isNew() ){
        $.post('/notes/' , params , function(data){
        self.model = new Note({ id : data.id});
          msg = "saved!"
         $('#statusmsg').html(msg);
      });
     }else{
       var url = "/notes/" + this.model.get('id');
       var params = params + "&_method=PUT";
       $.post( url , params ,function(data){
          msg = "saved!";
          $('#statusmsg').html(msg);
       });
     }
    }
  });


  /* view for  new user*/
  ViewNewUser = Backbone.View.extend({

    events: {
        "submit form#login_form": "save"
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
      $(this.el).html(this.template);
      $('#container').hide();
      $('#note-template').removeClass("span5");
      $("#note-template").html(this.el);

      $('button#login').hide();
      $('button#addUser').show();
      $('a#new-user-link').hide();
       $(document).stopTime();
      this.delegateEvents();
    },

    save: function() {
        var self = this;
        var router = new AppRouter();
        var msg = this.model.isNew() ? 'Successfully created!' : "Saved!";
        this.model.save({username:this.$('[name=username]').val() , password:this.$('[name=password]').val()} , {
            success: function(model, resp) {
              new Notice({ message: msg });
              router.navigate("#notes" , true);
              window.location.reload();

            },
            error: function() {
                new Error();
            }
        });

        $(this.el).html(msg);
        $('#msg').html(this.el);
    }
  });


  /* view for show notice*/
  Notice = Backbone.View.extend({
    className: "success",
    displayLength: 5000,
    defaultMessage: '',

    initialize: function() {
      _.bindAll(this, 'render');
      this.message = this.options.message || this.defaultMessage;
      this.render();
    },

    render: function() {
      var view = this;
      $(this.el).html(this.message);
      $(this.el).hide();
      $('#notice').addClass("alert-message info");
      $('#notice').html(this.el);
      $(this.el).slideDown();
      $.doTimeout(this.displayLength, function() {
        $('#notice').removeClass("alert-message info");
        $(view.el).slideUp();
        $.doTimeout(2000, function() {
          view.remove();
        });
      });

      return this;
    }
  });

 /*View for show error*/
  Error = Notice.extend({
    className: "error",
    defaultMessage: 'Uh oh! Something went wrong. Please try again.'
  });


  /* routers for the application*/
  var AppRouter = Backbone.Router.extend({
    routes: {
          '' : 'home' ,
          'notes' : 'index'   ,
          'allnotes' : 'allNotes' ,
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
          new Notice({ message: "Log out successfully" });
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

      tags.fetch({
        success: function() {
          new ViewIndex({ collection: tags , model:new Note()});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      });

      notes.fetch({
        success: function() {
          new ViewNotesIndex({ collection: notes });
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      })
    },

    newNote: function() {
      new ViewEdit({ model: new Note() });
    } ,

    allNotes: function(){
       var notes = new All_notes();
       notes.fetch({
        success: function() {
          new ViewNotesIndex({ collection: notes });
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      })
    },

    edit: function(id) {
      var note = new Note({id : id});
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

