class AddBookingTimeToUserReservation < ActiveRecord::Migration
  def change
    add_column :user_reservations, :booking_datetime, :datetime
  end
end
