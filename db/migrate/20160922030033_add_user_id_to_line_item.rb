class AddUserIdToLineItem < ActiveRecord::Migration[5.1]
  def change
    add_reference :line_items, :user, index: true, foreign_key: true
  end
end
