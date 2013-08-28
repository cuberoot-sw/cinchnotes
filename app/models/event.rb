class Event < ActiveRecord::Base
  belongs_to :user
  attr_accessible :end_date, :location, :start_date, :title
end
