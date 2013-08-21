class ContactsController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @contacts = @user.contacts.all
      render :json => {:contacts =>  @contacts}
    end
  end

  def create
    puts params
    @user = User.find(session[:user_id])
    @contact = @user.contacts.new(params[:contacts])
    if @contact.save
      render :json => {:status => 'saved'}
    else
      render :json => {:status => 'error'}
     end
  end
end
