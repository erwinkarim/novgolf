class AddGolfClubToUrInvoice < ActiveRecord::Migration[5.1]
  def change
    add_reference :ur_invoices, :golf_club, foreign_key: true
  end
end
