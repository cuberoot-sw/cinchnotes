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

require 'acts-as-taggable-on'

require File.dirname(__FILE__) + '/models/note.rb'
require File.dirname(__FILE__) + '/models/user.rb'
require File.dirname(__FILE__) + '/models/tag.rb'
require File.dirname(__FILE__) + '/models/tag_notes.rb'


get '/' do
  haml :index
 # File.read(File.join('public', 'index.html'))
end

# get all tags by user
get '/notes/?' do
  @user = User.find(session[:user_id])
  content_type :json
  @user.owned_tags.to_json
end

get '/data' do
  content_type :json
  @user = User.find(session[:user_id])
  @notes = @user.notes
  @notes.to_json
end

# get all notes having same tag
get '/tags/:name' do
  content_type :json
  @user = User.find(session[:user_id])
  @notes = @user.notes.tagged_with(params[:name], :on => :tags)
  @notes.to_json

end

# create new note
post '/notes/?' do
  @user = User.find(session[:user_id])
  @note = Note.new
  content_type :json
  data = JSON.parse(request.body.read.to_s).merge("user_id" => session[:user_id] )
  @note.note = data["note"]
  @note.user_id = session[:user_id]
  @user.tag(@note , :with => data["tag"] , :on => :tags)
  @note.save
  @note.to_json
end

# delete Note
delete '/notes/:id' do
  @note = Note.find(params[:id])
  @note.destroy
  respond_to do |format|
    format.js {[]}
  end
end

# show a note
get '/notes/:id' do
  tag_arr = []
  content_type :json
  @note = Note.find(params[:id])
  mytags = @note.tags
  mytags.each do |tag|
    tag_arr << tag.name
  end
  @note['mytags'] = tag_arr
  @note.to_json
end

# Edit a note
put '/notes/:id' do
  @user = User.find(session[:user_id])
  content_type :json
  @note = Note.find(params[:id])
  data = JSON.parse(request.body.read.to_s).merge("user_id" => session[:user_id] )
  @note.update_attribute(:note , data["note"])
  @user.tag(@note , :with => data["tag"] , :on => :tags)
  if @note.save
   @note.to_json
  else
    flash[:error] = "Error! "
  end
end

#create a user
get '/user/new' do
  respond_to do |format|
    format.html{ haml :"users/new"}
  end
end

#create session
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

#destrroy session
get '/session' do
  content_type :json
  session['user_id'] = nil
  session['user_name'] = nil
  flash[:notice] = "Signed Out successfully!"
  session.to_json
end

#create user
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

#get users tag
get "/notes/tags/?" do
  puts "***"
  @user = User.find(session[:user_id])
  content_type :json
  taglist = @user.owned_tags.select{ |t| t.name.match(/^#{params[:term]}.*/i)}
  taglist.map{|e| e.name}.to_json
end




#helper for authenticate user
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
