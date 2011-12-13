class User < ActiveRecord::Base
  attr :name, :id
  has_many :notes

 end
