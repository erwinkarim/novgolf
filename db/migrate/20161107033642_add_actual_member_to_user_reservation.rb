class AddActualMemberToUserReservation < ActiveRecord::Migration[5.1]
  def change
    add_column :user_reservations, :count_member, :integer, default:0
  end
end
