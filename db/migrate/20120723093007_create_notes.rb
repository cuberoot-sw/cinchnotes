class CreateNotes < ActiveRecord::Migration
  def up
    create_table :notes do |t|
      t.text :note
      t.integer :user_id
      t.datetime :created_at
      t.datetime :updated_at
    end

  end

  def down
    drop_table :notes
  end
end
