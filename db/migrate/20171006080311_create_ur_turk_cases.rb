class CreateUrTurkCases < ActiveRecord::Migration[5.1]
  def change
    create_table :ur_turk_cases do |t|
      t.references :user_reservation, foreign_key: true
      # refer in the aws
      t.references :user, type: :integer, foreign_key: true
      t.timestamps
    end
  end
end
