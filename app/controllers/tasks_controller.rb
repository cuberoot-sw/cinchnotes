class TasksController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @tasks = @user.tasks.all
      render :json => {:tasks =>  @tasks}
    end
   end

   def create
    @user = User.find(session[:user_id])
    @due_date = DateTime.parse(params[:tasks][:due_date])
    @task = @user.tasks.new(params[:tasks])
    @task.due_date = @due_date
    if @task.save
      render :json => {:status => 'saved'}
    else
      render :json => {:status => 'error'}
     end
  end

  def show
    @task = Task.find(params[:id])
    render :json => @task
  end

  def destroy
    @task = Task.find(params[:id])
    @task.destroy
    render :json => []
  end

  def update
    @task = Task.find(params[:id])
    if @task.update_attributes(params[:tasks])
      render :json => {:status => 'saved'}
    end
  end
end
