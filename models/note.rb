class Note < ActiveRecord::Base
  belongs_to :user
  #belongs_to :tag
   #has_many :tags

  acts_as_taggable :tags
end
