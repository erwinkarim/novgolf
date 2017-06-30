class UrInvoice < ApplicationRecord
  belongs_to :user_reservation
  belongs_to :invoice
  belongs_to :golf_club
  validates_presence_of :golf_club_id, :invoice_id, :user_reservation_id, :final_total, :billing_category

  enum billing_category: UserReservation.reserve_methods.keys.map{ |x| x.to_sym }
end
