class User < ActiveRecord::Base
  #attr :name, :id
  validates_uniqueness_of :name
  validates_presence_of :name
  has_many :notes

  acts_as_tagger

 end
