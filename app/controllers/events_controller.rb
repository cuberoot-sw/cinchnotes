class EventsController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @events = @user.events.all
      render :json => {:events =>  @events}
    end
   end
end
