class CategoriesController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @categories = @user.categories.all
      render :json => {:categories =>  @categories}
    end
   end

end
