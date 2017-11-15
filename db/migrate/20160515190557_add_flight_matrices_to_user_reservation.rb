class AddFlightMatricesToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_reference :user_reservations, :flight_matrix, index: true, foreign_key: true
  end
end
