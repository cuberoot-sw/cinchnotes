class Contact < ActiveRecord::Base
  attr_accessible :address, :company, :email, :facebook_id, :fax, :first_name, :google_id, :last_name, :linked_in_id, :mobile, :phone, :skype_id, :title, :twitter_id, :website

  belongs_to :user
end
