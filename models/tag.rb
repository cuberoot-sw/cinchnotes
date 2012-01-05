class Tag < ActiveRecord::Base
	#has_many :tag_notes
	#has_many :tag_notes
	#has_many :notes, :through => :tag_notes
	belongs_to :note
end