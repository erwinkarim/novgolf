class AddBookingTimeToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :booking_datetime, :datetime
  end
end
