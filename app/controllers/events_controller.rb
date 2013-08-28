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
    if params[:events][:end_date].blank?
      params[:events][:end_date] = params[:events][:start_date]
    end
    @event = @user.events.new(params[:events])
    if @event.save
      render :json => {:status => 'saved'}
    else
      render :json => {:status => 'error'}
     end
  end

  def show
    @event = Event.find(params[:id])
    render :json => @event
  end

  def destroy
    @event = Event.find(params[:id])
    @event.destroy
    render :json => []
  end


end
