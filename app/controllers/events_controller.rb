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
    @start_date = DateTime.parse(params[:events][:start_date])
    if params[:events][:end_date].blank?
      @end_date = DateTime.parse(@start_date.to_date.to_s + "23:59")
    end
    @event = @user.events.new(params[:events])
    @event.start_date = @start_date
    @event.end_date = @end_date
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

  def update
    @event = Event.find(params[:id])
    if params[:events][:end_date].blank?
      params[:events][:end_date] = params[:events][:start_date]
    end
    if @event.update_attributes(params[:events])
      render :json => {:status => 'saved'}
    end
  end



end
