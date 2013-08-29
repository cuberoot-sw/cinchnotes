class TasksController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @tasks = @user.tasks.all
      render :json => {:tasks =>  @tasks}
    end
   end
end
