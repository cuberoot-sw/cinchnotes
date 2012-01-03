require 'rubygems'
require 'bundler/setup'

require 'sinatra'
require "sinatra/reloader" # if development?
require 'active_record'
require 'haml'
require 'json'
require 'sinatra/respond_to'
require 'rack-flash'
require 'yaml'
require 'bcrypt'
require File.dirname(__FILE__) + '/models/note.rb'
require File.dirname(__FILE__) + '/models/user.rb'
require File.dirname(__FILE__) + '/models/tag.rb'
require File.dirname(__FILE__) + '/models/tag_notes.rb'

Sinatra::Application.register Sinatra::RespondTo
enable :sessions
use Rack::Flash,:accessorize => [:notice, :error]
config = YAML.load_file(File.dirname(__FILE__)+ '/config/config.yml')

ActiveRecord::Base.establish_connection(
  :adapter => 'mysql2',
  :database => config['database'],
  :host => config['host'],
  :password => config['password']
)
ActiveRecord::Base.include_root_in_json = false

get '/' do
  #if session[:user_id].nil?
  #  redirect "/login/"
  #else
   #redirect "/notes/"
   File.read(File.join('public', 'index.html'))
  #end
end

get '/notes/?' do
  @notes = []
  if session[:user_id] != nil
      @user = User.find(session[:user_id])
      if @user.nil?
        env['x-rack.flash'].notice = "User not found."
      else
        @notes = Note.find(:all, :conditions =>["user_id= ?", session[:user_id]])
        content_type :json
        @notes.to_json
      end
    
  else
    env['x-rack.flash'].notice = "not logged in"
    flash[:error] = "User not logged-in."
    redirect "/login/"
  end
end

get '/notes/:id' do
  @note = Note.find(params[:id])
  @note.to_json
end

post '/notes/?' do
  #content_type :html
  @note = Note.new
  content_type :json
  data = JSON.parse(request.body.read.to_s).merge("user_id" => session[:user_id] )
  @note.note = data["note"]
  @note.user_id = session[:user_id]
  #@tag = Tag.find(:all, :conditions =>["name = ?", params[:tag]])
  #@tag = @tag.first
  if @note.save
  #  @tagnote = TagNote.new
  #  @tagnote.tag_id = @tag.id
  #  @tagnote.note_id = @note.id
  #  @tagnote.save
      @note.to_json  
  else
    flash[:error] = "Error! "
  end
end

delete '/notes/:id' do
  @note = Note.find(params[:id])
  @note.destroy
  #@tagnote = TagNote.where("note_id = ?", params[:id])
  #tagnote.first.destroy
  respond_to do |format|
    format.js {[]}
  end
end

put '/notes/:id' do
  content_type :json
  @note = Note.find(params[:id])
  data = JSON.parse(request.body.read.to_s).merge("user_id" => session[:user_id] )
  puts data
  @note.update_attribute(:note , data["note"])
  if @note.save
   @note.to_json
  else
    flash[:error] = "Error! "
  end
end

get '/logout' do
    session['user_id'] = nil
    session['user_name'] = nil
    flash[:notice] = "Signed Out successfully!"
    redirect "/"
end

get '/user/new' do
  respond_to do |format|
    format.html{ haml :"users/new"}
  end
end

post '/session' do
  content_type :json
  data = JSON.parse(request.body.read.to_s).merge("method" => "post" )
  @user = authenticate(data["username"], data["password"])
  if @user.nil?
    flash['error'] = "Login Failed, check 'username/password' and retry."
    redirect "/"
  else
    session['user_id'] = @user[:id]
    session['user_name'] = @user[:name]
    @user.to_json
  end

end

get '/session' do
  content_type :json

  session['user_id'] = nil
  session['user_name'] = nil
  flash[:notice] = "Signed Out successfully!"
  session.to_json
end

post '/user' do
  @user = User.new
  content_type :json
  data = JSON.parse(request.body.read.to_s).merge("method" => "post" )
  @user.name = data["username"]
  encrypt_pass(@user, data["password"])
  if @user.save
    session['user_id']=@user[:id]
    session['user_name']=@user[:name]
    @user.to_json
  else
    flash['error'] = "Error in creating account"
  end
end

get "/notes/tags" do
  @tag_arr = []
  content_type :json
  @tags = Tag.where("name like ?", "#{params[:term]}%")
 
  @tags.each do |t|
    @tag_arr << t.name
  end
  @tag_arr.to_json

end

helpers do
  def authenticate(name, password)
    @user = User.find(:all, :conditions => ['name=?', name]).first
    if @user && @user.password_hash == BCrypt::Engine.hash_secret(password, @user.password_salt)
      @user
    else
      nil
    end
  end

  def encrypt_pass(user, password)
    if password.present?
      user.password_salt = BCrypt::Engine.generate_salt
      user.password_hash = BCrypt::Engine.hash_secret(password, user.password_salt)
    end
  end

end
