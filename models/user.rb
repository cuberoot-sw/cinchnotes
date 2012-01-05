class User < ActiveRecord::Base
  #attr :name, :id
  has_many :notes

  acts_as_tagger

 end
