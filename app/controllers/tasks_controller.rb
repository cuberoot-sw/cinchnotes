class TasksController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @tasks = @user.tasks.all
      @tasks.each do |task|
        task[:category] = task.category if task.category.present?
      end
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
    @user = User.find(session[:user_id])
    @task = Task.find(params[:id])
    @task[:note] =  @task.note.gsub(/\n/, '<br/>')
    @task[:all_categories] = @user.categories.all
    unless @task.category.nil?
      @task[:category] = @task.category.name
    end
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

  def change_status
    @task = Task.find(params[:id])
    if @task.status == "pending"
      @task.complete!
    end
    render :json => []
  end
end
