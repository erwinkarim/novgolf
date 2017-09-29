class AddGolfClubToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_reference :user_reservations, :golf_club, index: true, foreign_key: true
  end
end
