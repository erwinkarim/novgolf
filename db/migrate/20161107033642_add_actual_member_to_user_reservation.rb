class AddActualMemberToUserReservation < ActiveRecord::Migration
  def change
    add_column :user_reservations, :actual_member, :integer, default:0
  end
end
