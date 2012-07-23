class CreateUsers < ActiveRecord::Migration
  def up
     create_table :users do |t|
      t.string :name
      t.string :email, :limit => 60
      t.string :password_hash
      t.string :password_salt
    end
  end

  def down
    drop_table :users
  end
end
