class TagNote < ActiveRecord::Base
	# validates :scrip_id ,:uniqueness =>true
	belongs_to :tag
	belongs_to :note

	
end