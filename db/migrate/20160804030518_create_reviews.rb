class CreateReviews < ActiveRecord::Migration[5.1]
  def change
    create_table :reviews do |t|
      t.references :user, index: true, foreign_key: true
      t.references :topic, polymorphic:true, index: true
      t.integer :rating
      t.text :comment, :limit => 320

      t.timestamps null: false
    end
  end
end
