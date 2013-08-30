class CategoriesController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @categories = @user.categories.all
      render :json => {:categories =>  @categories}
    end
   end

   def create
    @user = User.find(session[:user_id])
    @category = @user.categories.new(params[:categories])
    if @category.save
      render :json => {:status => 'saved'}
    else
      render :json => {:status => 'error'}
     end
  end


end
