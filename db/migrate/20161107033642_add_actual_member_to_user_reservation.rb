class AddActualMemberToUserReservation < ActiveRecord::Migration
  def change
    add_column :user_reservations, :count_member, :integer, default:0
  end
end
