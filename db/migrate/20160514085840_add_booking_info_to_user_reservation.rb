class AddBookingInfoToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :booking_date, :date
    add_column :user_reservations, :booking_time, :time
  end
end
