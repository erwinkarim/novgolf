class AddSecondaryFlightToUserReservation < ActiveRecord::Migration[5.0]
  def change
    add_column :user_reservations, :second_booking_time, :time
    add_reference :user_reservations, :second_course_listing, references: :course_listings, index: true
    add_foreign_key :user_reservations, :course_listings, column: :second_course_listing_id
  end
end
