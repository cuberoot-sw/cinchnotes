class SessionsController < ApplicationController
  # create session
  def create
    data = JSON.parse(request.body.read.to_s).merge("method" => "post" )
    @user = User.authenticate(data["username"], data["password"])
    if @user.nil?
      redirect root_url
    else
      session['user_id'] = @user[:id]
      session['user_name'] = @user[:name]
      render :json => @user
    end
  end

  # destroy session
  def destroy
    session['user_id'] = nil
    session['user_name'] = nil
    render :json => session
  end
end
