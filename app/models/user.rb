require 'bcrypt'
class User < ActiveRecord::Base
  validates_uniqueness_of :name
  validates_presence_of :name
  has_many :notes
  has_many :contacts
  has_many :events
  has_many :tasks
  has_many :categories

  acts_as_tagger


  def encrypt_pass(password)
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, self.password_salt)
    end
  end

  def self.authenticate(name, password)
    @user = User.find(:all, :conditions => ['name=?', name]).first
    if @user && @user.password_hash == BCrypt::Engine.hash_secret(password, @user.password_salt)
      @user
    else
      nil
    end
  end

end
