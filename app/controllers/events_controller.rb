class EventsController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @events = @user.events.all
      render :json => {:events =>  @events}
    end
   end

   def create
    @user = User.find(session[:user_id])
    @event = @user.events.new(params[:events])
    if @event.save
      render :json => {:status => 'saved'}
    else
      render :json => {:status => 'error'}
     end
  end

end
