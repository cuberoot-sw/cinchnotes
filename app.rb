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

get '/' do
  if session[:user_id] != nil
    redirect "/notes/"
  else
    redirect "/login/"
  end
end

get '/notes/?' do
  if session[:user_id] != nil
    @user = User.find(session[:user_id])
    if @user == nil
      env['x-rack.flash'].notice = "User not found."
    elsif @user
      @notes = Note.find(:all, :conditions =>["user_id= ?", session[:user_id]])
      respond_to do |format|
        format.html{ haml :"/notes/index"}
      end
    end
  else
    env['x-rack.flash'].notice = "not logged in"
    flash[:error] = "User not logged-in."
    redirect "/login/"
  end
end

post '/notes/' do
  flash[:notice]= "Hello World "
  @note = Note.new
  @note.note = params[:note]
  @note.user_id = params[:user_id]
  if @note.save!
    flash[:notice] = "Record saved successfully!"
    @notes = Note.find(:all, :conditions =>["user_id = ?", params[:user_id]])
    respond_to do |format|
      format.json{ @notes }
      format.js{[]}
    end
  end
end

delete '/notes/:id' do
  @note = Note.find(params[:id])
  @note.destroy
  respond_to do |format|
    format.js {[]}
  end
end

get '/login/' do
  respond_to do |format|
    format.html{ haml :"users/login" }
  end
end

get '/logout/' do
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

get '/user/' do
  @user = authenticate(params[:name], params[:password])
  if @user !=nil
    session['user_id'] = @user[:id]
    session['user_name'] = @user[:name]
    redirect "/notes/"
  else
    flash['error'] = "Login Failed, check 'username/password' and retry."
    redirect "/login/"
  end
end

post '/user/' do
  @user = User.new
  @user.name = params[:name]
  encrypt_pass(@user, params[:password])
  if @user.save!
    session['user_id']=@user.id
    session['user_name']=@user.name
    redirect "/notes/"
  end
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
