class AddCourseListingToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_reference :user_reservations, :course_listing, index: true, foreign_key: true
  end
end
