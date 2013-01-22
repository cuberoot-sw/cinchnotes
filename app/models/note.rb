class Note < ActiveRecord::Base
  attr_accessible :note
  attr_writer :my_note, :my_tags
  belongs_to :user
  acts_as_taggable
  acts_as_taggable_on :tags
  
  
end
