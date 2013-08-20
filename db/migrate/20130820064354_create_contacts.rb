class CreateContacts < ActiveRecord::Migration
  def change
    create_table :contacts do |t|
      t.string :first_name
      t.string :last_name
      t.string :company
      t.string :title
      t.text :address
      t.string :phone
      t.string :mobile
      t.string :fax
      t.string :email
      t.string :website
      t.string :facebook_id
      t.string :twitter_id
      t.string :linked_in_id
      t.string :skype_id
      t.string :google_id

      t.timestamps
    end
  end
end
