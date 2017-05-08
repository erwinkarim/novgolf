class AddUrContactToUserReservation < ActiveRecord::Migration[5.0]
  def change
    add_reference :user_reservations, :ur_contact, foreign_key: true
  end
end
