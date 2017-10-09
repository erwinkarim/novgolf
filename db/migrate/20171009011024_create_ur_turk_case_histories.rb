class CreateUrTurkCaseHistories < ActiveRecord::Migration[5.1]
  def change
    create_table :ur_turk_case_histories do |t|
      t.references :ur_turk_case, foreign_key: true
      t.integer :action
      t.string :notes, limit:140
      t.bigint :action_by
      t.timestamps
    end

    add_foreign_key :ur_turk_case_histories, :users, {column: :action_by}
  end
end
