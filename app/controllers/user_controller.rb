class UserController < ApplicationController
  def create
    @user = User.new
    data = JSON.parse(request.body.read.to_s).merge("method" => "post" )
    @user.name = data["username"]
    @user.email = data["email"]
    @user.encrypt_pass(data["password"])
    if @user.valid?
      if @user.save
        session['user_id']=@user[:id]
        session['user_name']=@user[:name]

        # add default notes for user
        help_txt =<<-HELP
Thanks for trying Cinch Notes! Our intention is to keep Cinch Notes minimal.

Thanks,
Cube Root Software
      HELP
        help = @user.notes.build(:note => help_txt)
        @user.tag(help , :with => 'welcome' , :on => :tags)

        tips_txt =<<-TIPS
1. To add a new note click '+' icon.
2. Notes are automatically saved.
2. To see all the notes click 'Home' icon.
3. Select tagged notes by clicking on the tag.
4. Search notes - start typing in the search area.
      TIPS
        help = @user.notes.build(:note => tips_txt)
        @user.tag(help , :with => 'welcome' , :on => :tags)
        render :json => @user
      else
        render :json => {'valid_status'=>'validation_error'}
      end
    else
      render :json => {'valid_status'=>'validation_error'}
    end
  end
end
