(function($) {
  /* Model*/
  var Note = Backbone.Model.extend({
       
  });

  /* collection*/
  var Note_coll = Backbone.Collection.extend({
    model: Note,
    url: 'notes'
  });



  /* View for listing of books*/
  var ViewIndex = Backbone.View.extend({
    events: {
        "click .delete": "clear"
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
      var note_id = $(e.target).attr('id');
      var answer = confirm("Are you sure you want to delete this note?");
      var note = new Note({id : note_id});  
      if (answer) {
        note.destroy();
        $('#row'+note_id).remove();
      }
    },

    /*remove: function() {
      $(this.el).remove();
    }*/

    
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
      window.history.back();
    }
  });

  /* view for edit / new*/
  ViewEdit = Backbone.View.extend({
    events: {
        "submit form": "save"
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
        this.model.save({ note: this.$('[name=note]').val() }, {
            success: function(model, resp) {
              new Notice({ message: msg });
              /*if(msg != 'Saved!'){
                window.history.back();
                var row = "<tr><td><a href= #books/"+model.id+">"+model.get('title')+"</td><td>"+model.get('author')+"</a></td><td>"+model.get('publisher')+"</td></tr>";
                $("#books-tbl").append(row);
                $('form').hide();
              } else {
                window.history.back();
                var row = "<td><a href= #books/"+model.id+">"+model.get('title')+"</td><td>"+model.get('author')+"</a></td><td>"+model.get('publisher')+"</td>";
                var row_id = 'row'+model.id;
                $("#"+row_id).html(row);
                $('#book-template').show();
                Backbone.history.saveLocation('books/' + model.id);
              }*/
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
          '' : 'index'   ,
          'new' : "newNote" ,
          "notes/:id" : "show"
      
    },

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