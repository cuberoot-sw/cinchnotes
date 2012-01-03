(function($) {
  /* Model*/
   Note = Backbone.Model.extend({
    url : function() {
    var base = 'notes';
    if (this.isNew()) return base;
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

  /* collection*/
  var Note_coll = Backbone.Collection.extend({
    model: Note,
    url: '/notes'
  });


  /**** view for login */
  ViewLogin = Backbone.View.extend({
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
      $("#note-template").html(this.el);
      this.delegateEvents();
    },

    save: function() {
        var self = this;
        var router = new AppRouter();

        var welcome_msg = "welcome  " + this.$('[name=username]').val() + " |" ;
        this.model.save({username:this.$('[name=username]').val() , password:this.$('[name=password]').val()} , {
            success: function(model, resp) {
              var msg = "SuccessFully Logged In!";
              new Notice({ message: "SuccessFully Logged In!" });
              
              $('#welcome_msg').html(welcome_msg);
              router.navigate("#notes" , true);
            },
            error: function() {
              var msg = "Login Failed, check 'username/password' and retry.!"
              new Notice({ message: "Login Failed, check 'username/password' and retry.!"})
            }
        });       
    }
});




  /* View for listing of notes*/
  var ViewIndex = Backbone.View.extend({
    events: {
        "click .delete": "clear" , 
        "click a.logout": "logout"
    },
    initialize:function(){
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove ,this);

      var tmpl = _.template($('#note-list-template').html());
      this.template = tmpl({collection : this.collection});
      this.render();
    },

    render:function(){
      $(this.el).html(this.template);
      $("#note-template").html(this.el);
      this.delegateEvents();
    },

    clear: function(e){
      var note_id = $(e.target).attr('id')

      var answer = confirm("Are you sure you want to delete this note?");
      var note = new Note({id : note_id});  
      if (answer) {
        note.destroy();
        $('#row'+note_id).remove();
        new Notice({ message: "SuccessFully Deleted!" });
      }
    },

    remove: function() {
      $(this.el).remove();
      var router = new AppRouter();
      router.navigate("#notes" , true);

    } ,

    logout: function() {
      alert("Hello logout");
    }

    
  });

  /*view to show record*/
  ViewShow = Backbone.View.extend({
     events: {
        "click a#back_link": "back"
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
      $(this.el).html(this.template);
      $("#note-template").html(this.el);
      this.delegateEvents();
    },

    back:function(){
      var router = new AppRouter();     
      router.navigate("#notes" , true);
    }
  });

  /* view for edit / new*/
  ViewEdit = Backbone.View.extend({
    events: {
        "submit form#add-notes": "save"
    },
    
    initialize:function(){
      console.log("initialize");
      _.bindAll(this , 'render');
      this.model.bind('change', this.render);

      var tmpl = _.template($('#add-note-template').html());
      this.template = tmpl({model : this.model});
      this.render();
    },

    render:function(){
      $(this.el).html(this.template);
      $("#note-template").html(this.el);
      this.delegateEvents();
    },

    save: function() {
        var self = this;
        var msg = this.model.isNew() ? 'Successfully created!' : "Saved!";
        this.model.save({note:this.$('[name=note]').val()} , {
            success: function(model, resp) {
              new Notice({ message: msg });
              window.history.back();
            },
            error: function() {
                new Error();
            }
        });
        $(this.el).html(msg);
        $('#msg').html(this.el);
       
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
      $("#note-template").html(this.el);

      $('button#login').hide();
      $('button#addUser').show();
      $('a#new-user-link').hide();
      this.delegateEvents();
    },

    save: function() {
        var self = this;
        var router = new AppRouter();
        var msg = this.model.isNew() ? 'Successfully created!' : "Saved!";
        var welcome_msg = "welcome  " + this.$('[name=username]').val() ;
        this.model.save({username:this.$('[name=username]').val() , password:this.$('[name=password]').val()} , {
            success: function(model, resp) {
              new Notice({ message: msg });
              
              $('#welcome_msg').html(welcome_msg);
              router.navigate("#notes" , true);
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
      $('#notice').html(this.el);
      $(this.el).slideDown();
      $.doTimeout(this.displayLength, function() {
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
          'notes' : 'index'   ,
          '' : "login",
          'new' : "newNote" ,
          'logout' : "logout",
          "notes/:id" : "show" ,
          "notes/:id/edit" : "edit",
           'newUser' : "newUser" ,
           'session' : 'logout'  
    },



    login: function(){
          new ViewLogin ({  model:new Session()});
    },

    
    logout: function(){
      var session = new Session();
      session.fetch({
        success: function(model ) {
          $('#welcome_msg').html('');
          new Notice({ message: "Log out successfully" });
          var router = new AppRouter();     
          router.navigate("#" , true);

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
      var notes = new Note_coll();

      notes.fetch({
        success: function() {
          new ViewIndex({ collection: notes , model:new Note()});
        },
        error: function() {
          new Error({ message: "Error loading data." });
        }
      }); 
    },

    newNote: function() {
      new ViewEdit({ model: new Note() });
    } ,

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
      var note = new Note({id : id});
      note.fetch({
        success: function(model ) {
          new ViewShow({ model:note});
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