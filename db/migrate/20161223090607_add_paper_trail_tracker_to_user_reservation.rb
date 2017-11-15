class AddPaperTrailTrackerToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :last_paper_trail_id, :integer
  end
end
