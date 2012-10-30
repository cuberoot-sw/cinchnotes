class TagsController < ApplicationController
  def index
    # get all tags by user
    @user = User.find(session[:user_id])
    render :json => @user.owned_tags
  end

  def match
    @user = User.find(session[:user_id])
    taglist = current_user.owned_tags.select{ |t| t.name.match(/^#{params[:term]}.*/i)}
    render :json => taglist.map{|e| e.name}
  end
end
