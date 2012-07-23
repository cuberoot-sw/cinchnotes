class CreateTaggings < ActiveRecord::Migration
  def up
   create_table :taggings do |t|
      t.integer :tag_id
      t.integer :taggable_id
      t.integer :tagger_id
      t.string :taggable_type
      t.string :tagger_type
      t.string :context
    end

  end

  def down
    drop_table :taggings
  end
end
