class NotesController < ApplicationController
  def index
    @user = User.find(session[:user_id])
    if params[:tag].nil?
      @notes = @user.notes.select("id, substring(note, 1, 60) note")
      result = {:notes =>  @notes, :tags => @user.owned_tags }
    else
      @notes = @user.notes.select("notes.id, substring(note, 1, 60) note").tagged_with(params[:tag], :on => :tags)
      result = {:notes =>  @notes }
    end
    render :json => result
  end

  def show
    tag_arr = []
    @note = Note.find(params[:id])
    mytags = @note.tags
    mytags.each do |tag|
      tag_arr << tag.name
    end
    @note['mytags'] = tag_arr
    @note['mynote'] = @note.note.gsub(/\n/, '<br/>')
    render :json => @note
  end

  def create
    tag_arr = []
    @note = Note.new
    @note.note = params["note"]
    @note.user_id = current_user.id
    @note.created_at = Time.now
    @note.updated_at = Time.now
    #add new tags for note here
    current_user.tag(@note , :with => params["tag_list"] , :on => :tags)
    @note.save

    mytags = @note.tags
    mytags.each do |tag|
      tag_arr << tag.name
    end
    @note['mytags'] = tag_arr

    render :json => @note

  end

  # delete Note
  def destroy
    @note = Note.find(params[:id])
    @note.destroy
    render :json => []
  end

  def update
    tag_arr = []
    @note = Note.find(params[:id])
    @note.update_attribute(:note , params["note"])
    @note.update_attribute(:updated_at , Time.now)

    #add new tags for note here
    current_user.tag(@note , :with => params["tag_list"] , :on => :tags)

    mytags = @note.tags
    mytags.each do |tag|
      tag_arr << tag.name
    end
    @note['mytags'] = tag_arr

    if @note.save
      render :json => @note
    end
  end
end
