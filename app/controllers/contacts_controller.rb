class ContactsController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if @user
      @contacts = @user.contacts.all
      render :json => {:contacts =>  @contacts}
    end
  end
end
